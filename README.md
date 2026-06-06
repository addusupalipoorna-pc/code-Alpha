# CodeAlpha AI Language Translation Platform

A premium AI-powered translation platform built with React, Tailwind CSS, Framer Motion, and FastAPI.

## Features

- Real-time translation with auto language detection
- Voice input and speech synthesis
- Translation history and export
- Analytics dashboard
- Glassmorphism UI with responsive layout
- PDF and TXT export

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Icons, Axios
- Backend: FastAPI, deep-translator

## Run Locally

### Backend (optional — faster translations when running)

From the project root:

```bash
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:4173`. The dev server proxies `/translate` to the backend when it is running. If the backend is offline, translations still work via a built-in cloud fallback.

**Voice & speech:** Use Chrome or Edge, allow microphone access for voice input, and click **Listen** after translating to hear the result.

## Backend API

- `POST /translate` — translate text
- `GET /languages` — get supported languages

## Notes

The translation backend uses `deep-translator` with Google Translate. Use the browser's speech APIs for in-app voice capture and audio playback.
