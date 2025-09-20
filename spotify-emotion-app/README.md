# Spotify Emotion App (starter)

This is a minimal React (Vite) app that captures a photo from your webcam, sends it to a camera/emotion analysis API, and then displays a suggested Spotify track.

What I scaffolded

- package.json (Vite + React)
- index.html
- src/main.jsx
- src/App.jsx (UI + placeholder API calls)
- src/styles.css
- server/ backend stubs with Express

Where to plug your APIs

- Camera/emotion API: in `src/App.jsx` replace `cameraApiUrl = '/api/analyze'` and uncomment the fetch call.
- Spotify suggestion API: after getting the emotion you should POST it to your backend (or directly call Spotify) and return a suggested track object. Replace the placeholder `suggestedTrack` with the real API response.

How to run (locally)

1. cd spotify-emotion-app

2. Install front-end deps:

   npm install

3. Install backend deps & run server in another terminal:

   cd server
   npm install
   npm run dev

4. Run the frontend:

   cd ..
   npm run dev

Notes

- The current UI uses a random emotion for demo purposes until you hook up the camera API.
- I kept the app intentionally minimal. Tell me if you want authentication, OAuth with Spotify, or a backend skeleton next.
