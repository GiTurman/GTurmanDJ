// App.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import Deck from './components/Deck.jsx'
import MixerCenter from './components/MixerCenter.jsx'
import BottomBar from './components/BottomBar.jsx'
import APIKeyModal from './components/APIKeyModal.jsx'
import styles from './App.module.css'
import { getAISuggestions } from './lib/geminiService.js'
import { getStaticSuggestions, GENRES } from './lib/trackDatabase.js'
import {
  initAudio, loadAudioFile, playDeck, stopDeck, cueDeck,
  setDeckVolume, setMasterVolume, setCrossfader, setEQ, setDeckBPM,
  getDeckPosition, startRecording, stopRecording, exportToMP3,
  extractWaveformData
} from './lib/audioEngine.js'

const DEFAULT_DECK = (id) => ({
  id,
  title: id === 'a' ? 'Strobe' : 'Around the World',
  artist: id === 'a' ? 'deadmau5' : 'Daft Punk',
  genre: id === 'a' ? 'PROGRESSIVE HOUSE' : 'FRENCH HOUSE',
  bpm: id === 'a' ? 128 : 121,
  key: id === 'a' ? 'F MIN' : 'G MIN',
  camelot: id === 'a' ? '4A' : '6A',
  energy: id === 'a' ? 6 : 7,
  playing: false,
  looping: false,
  synced: false,
  position: 0,
  volume: 80,
  gain: 100,
  eq: { high: 0, mid: 0, low: 0 },
  waveform: null,
  duration: 0,
  hasFile: false,
})

export default function App() {
  const [deckA, setDeckA] = useState(DEFAULT_DECK('a'))
  const [deckB, setDeckB] = useState(DEFAULT_DECK('b'))
  const [crossfader, setCrossfaderState] = useState(50)
  const [masterVol, setMasterVol] = useState(75)
  const [suggestions, setSuggestions] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('ALL')
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const [showApiModal, setShowApiModal] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  const [mixTip, setMixTip] = useState('')
  const positionIntervalRef = useRef(null)

  // Load initial static suggestions
  useEffect(() => {
    refreshSuggestions('ALL', deckA, deckB)
  }, [])

  // Update playhead positions
  useEffect(() => {
    positionIntervalRef.current = setInterval(() => {
      setDeckA(d => ({ ...d, position: getDeckPosition('a') }))
      setDeckB(d => ({ ...d, position: getDeckPosition('b') }))
    }, 100)
    return () => clearInterval(positionIntervalRef.current)
  }, [])

  const setDeck = (id, updater) => {
    if (id === 'a') setDeckA(d => typeof updater === 'function' ? updater(d) : { ...d, ...updater })
    else setDeckB(d => typeof updater === 'function' ? updater(d) : { ...d, ...updater })
  }

  const getDeck = (id) => id === 'a' ? deckA : deckB

  const handleFileLoad = async (deckId, file) => {
    initAudio()
    try {
      const info = await loadAudioFile(deckId, file)
      const waveform = extractWaveformData(info.buffer || {}, 150)
      setDeck(deckId, {
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local File',
        genre: '—',
        bpm: Math.round(info.bpm) || 128,
        duration: Math.round(info.duration),
        waveform,
        hasFile: true,
        playing: false,
        position: 0,
      })
    } catch (e) {
      console.error('Failed to load audio:', e)
    }
  }

  const handlePlay = (deckId) => {
    initAudio()
    const deck = getDeck(deckId)
    if (deck.playing) {
      stopDeck(deckId)
      setDeck(deckId, { playing: false })
    } else {
      const ok = playDeck(deckId)
      if (ok || !deck.hasFile) setDeck(deckId, { playing: true })
    }
  }

  const handleCue = (deckId) => {
    cueDeck(deckId)
    setDeck(deckId, { playing: false, position: 0 })
  }

  const handleSync = (deckId) => {
    const deck = getDeck(deckId)
    const otherDeck = getDeck(deckId === 'a' ? 'b' : 'a')
    const newSynced = !deck.synced
    if (newSynced && deck.hasFile) {
      setDeckBPM(deckId, deck.bpm, otherDeck.bpm)
    }
    setDeck(deckId, { synced: newSynced, bpm: newSynced ? otherDeck.bpm : deck.bpm })
  }

  const handleLoop = (deckId) => {
    setDeck(deckId, d => ({ looping: !d.looping }))
  }

  const handleVolume = (deckId, val) => {
    setDeckVolume(deckId, val)
    setDeck(deckId, { volume: val })
  }

  const handleEQ = (deckId, band, val) => {
    setEQ(deckId, band, val)
    setDeck(deckId, d => ({ eq: { ...(d.eq || { high: 0, mid: 0, low: 0 }), [band]: parseInt(val) } }))
  }

  const handleCrossfader = (val) => {
    setCrossfader(val)
    setCrossfader(val)
  }

  const handleMasterVol = (val) => {
    setMasterVolume(val)
    setMasterVol(val)
  }

  const refreshSuggestions = useCallback(async (genre, deckAData, deckBData) => {
    setIsLoadingAI(true)
    try {
      let tracks
      if (apiKey) {
        tracks = await getAISuggestions({
          deckA: deckAData,
          deckB: deckBData,
          genre,
          apiKey,
          count: 5
        })
      }
      if (!tracks || tracks.length === 0) {
        tracks = getStaticSuggestions({ deckA: deckAData, deckB: deckBData, genre, count: 5 })
      }
      setSuggestions(tracks)
    } catch (e) {
      const fallback = getStaticSuggestions({ deckA: deckAData, deckB: deckBData, genre, count: 5 })
      setSuggestions(fallback)
    } finally {
      setIsLoadingAI(false)
    }
  }, [apiKey])

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre)
    refreshSuggestions(genre, deckA, deckB)
  }

  const handleLoadSuggestion = (track, deckId) => {
    setDeck(deckId, {
      title: track.title,
      artist: track.artist,
      genre: track.genre,
      bpm: track.bpm,
      key: track.key,
      camelot: track.camelot,
      energy: track.energy,
      waveform: generateFakeWaveform(),
      playing: false,
      position: 0,
      hasFile: false,
    })
    if (track.mixTip) setMixTip(track.mixTip)
  }

  const handleAISuggestBoth = async () => {
    const tracks = await (apiKey
      ? getAISuggestions({ deckA, deckB, genre: selectedGenre, apiKey, count: 6 }).catch(() => [])
      : Promise.resolve([]))
    const all = tracks.length ? tracks : getStaticSuggestions({ deckA, deckB, genre: selectedGenre, count: 6 })
    if (all[0]) handleLoadSuggestion(all[0], 'a')
    if (all[1]) handleLoadSuggestion(all[1], 'b')
    setSuggestions(all.slice(2))
  }

  const handleRecord = async () => {
    initAudio()
    if (!recording) {
      startRecording()
      setRecording(true)
      setRecSeconds(0)
    } else {
      const blob = await stopRecording()
      setRecording(false)
      if (blob) exportToMP3(blob)
    }
  }

  const handleSaveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('gemini_api_key', key)
    setShowApiModal(false)
    refreshSuggestions(selectedGenre, deckA, deckB)
  }

  return (
    <div className={styles.app}>
      <Header
        bpm={Math.round((deckA.bpm + deckB.bpm) / 2)}
        masterVol={masterVol}
        onMasterVol={handleMasterVol}
        hasApiKey={!!apiKey}
        onApiKeyClick={() => setShowApiModal(true)}
        mixTip={mixTip}
      />

      <div className={styles.main}>
        <Deck
          deck={deckA}
          deckId="a"
          onPlay={() => handlePlay('a')}
          onCue={() => handleCue('a')}
          onSync={() => handleSync('a')}
          onLoop={() => handleLoop('a')}
          onVolume={(v) => handleVolume('a', v)}
          onEQ={(band, v) => handleEQ('a', band, v)}
          onFileLoad={(f) => handleFileLoad('a', f)}
        />

        <MixerCenter
          crossfader={crossfader}
          onCrossfader={handleCrossfader}
          suggestions={suggestions}
          isLoadingAI={isLoadingAI}
          genres={GENRES}
          selectedGenre={selectedGenre}
          onGenre={handleGenreFilter}
          onLoadSuggestion={handleLoadSuggestion}
          onAISuggestDeck={(d) => refreshSuggestions(selectedGenre, deckA, deckB)}
          onAISuggestBoth={handleAISuggestBoth}
          onRefreshAI={() => refreshSuggestions(selectedGenre, deckA, deckB)}
          hasApiKey={!!apiKey}
          deckAVol={deckA.volume}
          deckBVol={deckB.volume}
          onDeckAVol={(v) => handleVolume('a', v)}
          onDeckBVol={(v) => handleVolume('b', v)}
        />

        <Deck
          deck={deckB}
          deckId="b"
          onPlay={() => handlePlay('b')}
          onCue={() => handleCue('b')}
          onSync={() => handleSync('b')}
          onLoop={() => handleLoop('b')}
          onVolume={(v) => handleVolume('b', v)}
          onEQ={(band, v) => handleEQ('b', band, v)}
          onFileLoad={(f) => handleFileLoad('b', f)}
        />
      </div>

      <BottomBar
        selectedGenre={selectedGenre}
        genres={GENRES}
        onGenre={handleGenreFilter}
        recording={recording}
        recSeconds={recSeconds}
        onRecord={handleRecord}
        deckA={deckA}
        deckB={deckB}
      />

      {showApiModal && (
        <APIKeyModal
          currentKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  )
}

function generateFakeWaveform(points = 150) {
  return Array.from({ length: points }, () => Math.random())
}
