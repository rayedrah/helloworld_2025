# Backend stub for Spotify Emotion App

Endpoints:

- POST /api/analyze
  - multipart/form-data with `image` field
  - returns: { emotion: 'happy' }

- POST /api/suggest
  - JSON { emotion: 'happy' }
  - returns: { track: { name, artist, spotify_url } }

Run locally:

1. Start the Python detector service (recommended). From the `server/python_service` folder create a virtualenv, install requirements and run it:

  python3 -m venv .venv
  source .venv/bin/activate
  pip install -U pip
  pip install deepface flask opencv-python-headless
  PY_DETECT_PORT=6000 python app.py

2. In another terminal, run the Express server. Make sure you set Spotify credentials in a `.env` file inside `server/`.

  Create `server/.env` with:

  ```env
  SPOTIFY_CLIENT_ID=your_spotify_client_id
  SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
  ```

  Then:

  npm install
  npm run dev

Notes

- The Express server forwards uploaded images to the Python detector at `PY_DETECT_URL` (defaults to `http://127.0.0.1:6000`). Set `PY_DETECT_URL` env var if your Python service runs elsewhere.
- The `/api/analyze` endpoint accepts multipart/form-data `image` and returns `{ emotion }` from DeepFace.
- The `/api/suggest` endpoint accepts JSON `{ emotion }` and returns a Spotify suggestion using the Client Credentials flow. For user-specific playback or saved tracks you will need the full OAuth flow.
- Keep Spotify credentials out of source control; use environment variables or a secrets manager for production.
