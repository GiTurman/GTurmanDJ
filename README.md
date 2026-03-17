# AIMIX — AI DJ Mixer

Serato-style DJ mixer with Google Gemini AI track suggestions.

## Stack
- **React + Vite** — UI framework
- **Web Audio API** — real-time audio mixing, EQ, crossfader
- **Google Gemini 1.5 Flash** — AI track suggestions (via Google AI Studio)
- **ffmpeg.wasm** — client-side WebM → MP3 conversion
- **Vercel** — hosting

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```

### 3. Get Google AI Studio API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key (free tier works)
3. In the app, click **ADD AI KEY** in the header
4. Paste your key — stored only in your browser's localStorage

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or push to GitHub and connect repo on vercel.com
```

The `vercel.json` already includes the required headers for ffmpeg.wasm:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

---

## Features

### Decks
- **2 independent decks** (A and B) with waveform display
- **Drag & drop** audio files (MP3, WAV, FLAC, OGG)
- **BPM detection** via autocorrelation
- **EQ** — High / Mid / Low shelves (±12dB)
- **SYNC** — tempo-match one deck to the other
- **LOOP** — toggle loop mode
- **CUE** — return to start
- **Hot Cues** — 4 cue points per deck

### Mixer
- **Crossfader** with equal-power curve
- **Channel volume** faders for A and B
- **Master volume**

### AI Suggestions
- **Without API key** — static curated database with Camelot wheel matching
- **With Gemini API key** — real-time suggestions based on currently loaded tracks
  - BPM compatibility scoring
  - Harmonic mixing (Camelot wheel)
  - Energy arc analysis
  - Mix-in tips per track
- **Genre filter** — House / Techno / D&B / Hip-Hop / Ambient / Trance
- **Load to Deck A or B** — one click

### Recording & Export
- **RECORD** — captures master mix output via Web Audio API
- **STOP** → auto-exports
- **MP3 export** via ffmpeg.wasm (client-side, no server needed)
  - 192kbps, 44.1kHz, stereo
  - Falls back to WebM if ffmpeg.wasm fails to load
  - Progress bar during conversion

---

## File Structure

```
src/
  components/
    Header.jsx          — BPM display, master vol, API key button
    Deck.jsx            — Full DJ deck (waveform, transport, EQ)
    Waveform.jsx        — Canvas waveform renderer
    MixerCenter.jsx     — Crossfader, volumes, AI suggestions list
    BottomBar.jsx       — Genre filters, record button
    ExportButton.jsx    — MP3 export with progress
    APIKeyModal.jsx     — Google AI Studio key input
  lib/
    audioEngine.js      — Web Audio API engine (play, EQ, record)
    geminiService.js    — Google Gemini API calls
    trackDatabase.js    — Static track DB + Camelot scoring
    mp3Export.js        — ffmpeg.wasm WebM→MP3 conversion
  styles/
    global.css          — CSS variables, base styles
  App.jsx               — Main app state & logic
  main.jsx              — React entry point
vercel.json             — COEP/COOP headers for ffmpeg.wasm
```

---

## Serato Integration

AIMIX is designed to complement Serato DJ:
- Exported MP3 mixes can be imported into Serato's library
- Track suggestions use the same Camelot wheel system as Serato's Smart Sync
- BPM detection results are compatible with Serato's grid format

---

## Development Notes

### Audio Context
Web Audio requires user interaction to start. The audio context initializes on first Play button click.

### ffmpeg.wasm Size
The WASM file is ~30MB — loads once and caches. First export takes 5–15s on first load, near-instant after.

### API Rate Limits
Gemini 1.5 Flash free tier: 15 RPM, 1M tokens/day — more than enough for a DJ session.
