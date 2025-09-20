const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
require('dotenv').config()

const app = express()
const upload = multer({ dest: path.join(__dirname, 'uploads/') })

app.use(express.json())

// Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'))
}

const PY_SERVICE = process.env.PY_DETECT_URL || 'http://127.0.0.1:6000'

// POST /api/analyze - forwards multipart image to the Python service and returns { emotion }
app.post('/api/analyze', upload.single('image'), async(req, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file uploaded' })

    try {
        const form = new FormData()
        form.append('image', fs.createReadStream(req.file.path), req.file.originalname || 'upload.jpg')

        const resp = await axios.post(`${PY_SERVICE}/analyze`, form, {
            headers: form.getHeaders(),
            timeout: 20000
        })

        // cleanup uploaded file
        try { fs.unlinkSync(req.file.path) } catch (e) { /* ignore */ }

        return res.json(resp.data)
    } catch (err) {
        console.error('analyze error', err ? .message || err)
        try { fs.unlinkSync(req.file.path) } catch (e) { /* ignore */ }
        return res.status(500).json({ error: 'analysis_failed', detail: err ? .message })
    }
})

// Helper: get Spotify access token (Client Credentials)
async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Missing Spotify credentials (SPOTIFY_CLIENT_ID/SECRET)')

    const tokenUrl = 'https://accounts.spotify.com/api/token'
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const resp = await axios.post(tokenUrl, 'grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    return resp.data.access_token
}

// Map simple emotion to seed genres or seed tracks/artists for Spotify recommendations.
function mapEmotionToSeeds(emotion) {
    // These are naive mappings; adapt as you like.
    const map = {
        happy: { seed_genres: ['pop'], target_valence: 0.9 },
        sad: { seed_genres: ['acoustic', 'piano'], target_valence: 0.2 },
        angry: { seed_genres: ['metal', 'rock'], target_valence: 0.3 },
        surprised: { seed_genres: ['indie'], target_valence: 0.7 },
        neutral: { seed_genres: ['ambient'], target_valence: 0.5 }
    }
    return map[emotion] || { seed_genres: ['pop'], target_valence: 0.5 }
}

// POST /api/suggest - accepts { emotion } and returns a Spotify recommendations response (one track)
app.post('/api/suggest', async(req, res) => {
    const { emotion } = req.body
    if (!emotion) return res.status(400).json({ error: 'missing emotion' })

    try {
        const token = await getSpotifyToken()

        const seeds = mapEmotionToSeeds(emotion)
        const params = new URLSearchParams()
        if (seeds.seed_genres && seeds.seed_genres.length) params.append('seed_genres', seeds.seed_genres.join(','))
        if (typeof seeds.target_valence !== 'undefined') params.append('target_valence', String(seeds.target_valence))
        params.append('limit', '10')

        const recResp = await axios.get(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        const tracks = recResp.data.tracks || []
        if (!tracks.length) return res.status(500).json({ error: 'no_recommendations' })

        // pick one track (first)
        const t = tracks[0]
        const track = {
            name: t.name,
            artist: (t.artists && t.artists[0] && t.artists[0].name) || 'Unknown',
            spotify_url: t.external_urls && t.external_urls.spotify,
            preview_url: t.preview_url || null
        }
        return res.json({ track })
    } catch (err) {
        console.error('suggest error', err ? .message || err)
        return res.status(500).json({ error: 'suggest_failed', detail: err ? .message })
    }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))