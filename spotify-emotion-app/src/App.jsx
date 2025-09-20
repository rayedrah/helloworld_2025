import React, { useEffect, useRef, useState } from 'react'

export default function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [permissionError, setPermissionError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)

  useEffect(() => {
    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        setPermissionError('Camera access denied or not available')
      }
    }
    startVideo()

    return () => {
      // stop the stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(t => t.stop())
      }
    }
  }, [])

  async function handleScan() {
    setLoading(true)
    setSuggestion(null)
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      // draw current video frame to canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)

      // convert to blob (JPEG)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))

      // Prepare form data for the camera/analyze API
      const formData = new FormData()
      formData.append('image', blob, 'capture.jpg')

      // Camera API endpoint (backend stub)
      const cameraApiUrl = '/api/analyze' // <-- server stub

      // Uncomment and use this when your backend is running locally at the same origin
      // const resp = await fetch(cameraApiUrl, { method: 'POST', body: formData })
      // const result = await resp.json()
      // const emotion = result.emotion

      // For now fallback to simulated emotion if backend is not available
      let emotion = null
      try {
        const resp = await fetch(cameraApiUrl, { method: 'POST', body: formData })
        if (resp.ok) {
          const result = await resp.json()
          emotion = result.emotion
        }
      } catch (e) {
        // ignore — we'll fallback to demo
      }

      if (!emotion) {
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral']
        emotion = emotions[Math.floor(Math.random() * emotions.length)]
      }

      // Call suggestion API to get a Spotify track (backend stub)
      const suggestApi = '/api/suggest'
      let suggestedTrack = null
      try {
        const sresp = await fetch(suggestApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emotion }) })
        if (sresp.ok) {
          const sjson = await sresp.json()
          suggestedTrack = sjson.track
        }
      } catch (e) {
        // ignore — fallback to demo below
      }

      if (!suggestedTrack) {
        suggestedTrack = { name: `${emotion} song (sample)`, artist: 'Sample Artist', spotify_url: 'https://open.spotify.com/' }
      }

      setSuggestion({ emotion, track: suggestedTrack })
    } catch (err) {
      console.error(err)
      setPermissionError('Failed to capture or analyze image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Spotify Emotion Scanner</h1>
      {permissionError && <div className="error">{permissionError}</div>}
      <div className="camera-area">
        <video ref={videoRef} autoPlay muted playsInline className="video" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="controls">
        <button onClick={handleScan} disabled={loading} className="scan-btn">
          {loading ? 'Scanning…' : 'Scan Emotion'}
        </button>
      </div>

      {suggestion && (
        <div className="suggestion">
          <h2>Detected: {suggestion.emotion}</h2>
          <div className="track">
            <div className="track-name">{suggestion.track.name}</div>
            <div className="track-artist">{suggestion.track.artist}</div>
            <a href={suggestion.track.spotify_url} target="_blank" rel="noreferrer">Open in Spotify</a>
            {suggestion.track.preview_url && (
              <div className="preview">
                <audio controls src={suggestion.track.preview_url} />
              </div>
            )}
          </div>
        </div>
      )}

      <footer>
        <small>
          API endpoints placeholders: camera API -&gt; <code>/api/analyze</code>, Spotify backend -&gt; your backend route
        </small>
      </footer>
    </div>
  )
}
