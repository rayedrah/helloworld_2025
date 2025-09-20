# Integration notes

Placeholders and integration notes:

- Camera API endpoint: POST /api/analyze
  - Accepts multipart/form-data with image field 'image'
  - Returns JSON { "emotion": "happy" }

- Spotify backend endpoint: POST /api/suggest
  - Accepts JSON { "emotion": "happy" }
  - Returns JSON { "track": { "name": "...", "artist": "...", "spotify_url": "..." } }

Update `src/App.jsx` to point to your real endpoints when ready.
