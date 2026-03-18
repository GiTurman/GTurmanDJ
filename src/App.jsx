import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import DeckPanel from './components/DeckPanel.jsx'
import Mixer from './components/Mixer.jsx'
import SuggestionPanel from './components/SuggestionPanel.jsx'
import BottomBar from './components/BottomBar.jsx'
import APIModal from './components/APIModal.jsx'
import {
  initAudio, loadFile, play, stop, cue, getPosition,
  setVolume, setMaster, setCrossfader, setEQ, syncBPM,
  startRec, stopRec
} from './lib/audio.js'
import { getSuggestions } from './lib/gemini.js'
import { staticSuggestions, GENRES } from './lib/tracks.js'
import { exportMP3 } from './lib/export.js'
import styles from './App.module.css'

const makeDeck = id => ({
  id,
  title: id === 'a' ? 'Strobe' : 'Around the World',
  artist: id === 'a' ? 'deadmau5' : 'Daft Punk',
  genre: id === 'a' ? 'PROGRESSIVE HOUSE' : 'FRENCH HOUSE',
  bpm: id === 'a' ? 128 : 121,
  key: id === 'a' ? 'F MIN' : 'G MIN',
  camelot: id === 'a' ? '4A' : '6A',
  energy: id === 'a' ? 6 : 7,
  playing: false, looping: false, synced: false,
  position: 0, volume: 80, eq: { high: 0, mid: 0, low: 0 },
  waveform: Array.from({ length: 180 }, () => Math.random() * 0.7 + 0.15),
  duration: 0, hasFile: false,
})

export default function App() {
  const [deckA, setDeckA] = useState(makeDeck('a'))
  const [deckB, setDeckB] = useState(makeDeck('b'))
  const [cf, setCF] = useState(50)
  const [master, setMasterVol] = useState(80)
  const [genre, setGenre] = useState('ALL')
  const [suggestions, setSuggestions] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [apiKey, setApiKey] = useState(() => { try { return localStorage.getItem('aimix_key') || '' } catch { return '' } })
  const [showModal, setShowModal] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recSec, setRecSec] = useState(0)
  const [exportProg, setExportProg] = useState(null)
  const [tip, setTip] = useState('')
  const recRef = useRef(null)
  const recInterval = useRef(null)

  // position update loop
  useEffect(() => {
    const id = setInterval(() => {
      setDeckA(d => ({ ...d, position: getPosition('a') }))
      setDeckB(d => ({ ...d, position: getPosition('b') }))
    }, 80)
    return () => clearInterval(id)
  }, [])

  // recording timer
  useEffect(() => {
    if (recording) {
      recInterval.current = setInterval(() => setRecSec(s => s + 1), 1000)
    } else {
      clearInterval(recInterval.current)
      setRecSec(0)
    }
    return () => clearInterval(recInterval.current)
  }, [recording])

  // load suggestions on mount & when key/genre changes
  useEffect(() => {
    fetchSuggestions(genre, deckA, deckB)
  }, [apiKey])

  const sd = (id, u) => {
    const setter = id === 'a' ? setDeckA : setDeckB
    setter(d => typeof u === 'function' ? { ...d, ...u(d) } : { ...d, ...u })
  }
  const gd = id => id === 'a' ? deckA : deckB

  const fetchSuggestions = useCallback(async (g, da, db) => {
    setLoadingAI(true)
    try {
      let tracks = null
      if (apiKey) tracks = await getSuggestions({ deckA: da, deckB: db, genre: g, apiKey, count: 6 })
      if (!tracks?.length) tracks = staticSuggestions({ deckA: da, deckB: db, genre: g, count: 6 })
      setSuggestions(tracks)
    } catch {
      setSuggestions(staticSuggestions({ deckA: da, deckB: db, genre: g, count: 6 }))
    } finally {
      setLoadingAI(false)
    }
  }, [apiKey])

  const handleFileLoad = async (deckId, file) => {
    try {
      initAudio()
      const info = await loadFile(deckId, file)
      sd(deckId, {
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local File', genre: '—',
        bpm: Math.round(info.bpm) || 128,
        duration: Math.round(info.duration),
        waveform: info.waveform,
        hasFile: true, playing: false, position: 0,
      })
    } catch (e) { console.error(e) }
  }

  const handlePlay = async (deckId) => {
    initAudio()
    const deck = gd(deckId)
    if (deck.playing) { stop(deckId); sd(deckId, { playing: false }) }
    else { await play(deckId); sd(deckId, { playing: true }) }
  }

  const handleCue = (deckId) => {
    cue(deckId)
    sd(deckId, { playing: false, position: 0 })
  }

  const handleSync = (deckId) => {
    const deck = gd(deckId)
    const other = gd(deckId === 'a' ? 'b' : 'a')
    const newSynced = !deck.synced
    if (newSynced && deck.hasFile) syncBPM(deckId, deck.bpm, other.bpm)
    sd(deckId, { synced: newSynced, bpm: newSynced ? other.bpm : gd(deckId).bpm })
  }

  const handleVolume = (deckId, v) => {
    setVolume(deckId, v)
    sd(deckId, { volume: v })
  }

  const handleEQ = (deckId, band, v) => {
    setEQ(deckId, band, v)
    sd(deckId, d => ({ eq: { ...d.eq, [band]: parseInt(v) } }))
  }

  const handleCF = (v) => {
    setCF(v)
    setCrossfader(v)
  }

  const handleMaster = (v) => {
    setMasterVol(v)
    setMaster(v)
  }

  const handleGenre = (g) => {
    setGenre(g)
    fetchSuggestions(g, deckA, deckB)
  }

  const handleLoadTrack = (track, deckId) => {
    sd(deckId, {
      title: track.title, artist: track.artist, genre: track.genre,
      bpm: track.bpm, key: track.key, camelot: track.camelot, energy: track.energy,
      waveform: Array.from({ length: 180 }, () => Math.random() * 0.7 + 0.15),
      playing: false, position: 0, hasFile: false,
    })
    if (track.mixTip) { setTip(track.mixTip); setTimeout(() => setTip(''), 7000) }
  }

  const handleSuggestBoth = async () => {
    let tracks = null
    if (apiKey) tracks = await getSuggestions({ deckA, deckB, genre, apiKey, count: 8 }).catch(() => null)
    if (!tracks?.length) tracks = staticSuggestions({ deckA, deckB, genre, count: 8 })
    if (tracks[0]) handleLoadTrack(tracks[0], 'a')
    if (tracks[1]) handleLoadTrack(tracks[1], 'b')
    setSuggestions(tracks.slice(2))
  }

  const handleRecord = async () => {
    initAudio()
    if (!recording) {
      startRec(); setRecording(true); recRef.current = null
    } else {
      const blob = await stopRec()
      recRef.current = blob; setRecording(false)
    }
  }

  const handleExport = async () => {
    if (!recRef.current) { alert('ჯერ ჩაწერე მიქსი — RECORD დააჭირე'); return }
    setExportProg(0)
    try { await exportMP3(recRef.current, setExportProg) }
    catch (e) { alert('Export error: ' + e.message) }
    finally { setTimeout(() => setExportProg(null), 3000) }
  }

  const handleSaveKey = (key) => {
    setApiKey(key)
    try { localStorage.setItem('aimix_key', key) } catch {}
    setShowModal(false)
    fetchSuggestions(genre, deckA, deckB)
  }

  const avgBpm = Math.round((deckA.bpm + deckB.bpm) / 2)

  return (
    <div className={styles.app}>
      <Header bpm={avgBpm} master={master} onMaster={handleMaster}
        hasKey={!!apiKey} onKeyClick={() => setShowModal(true)} tip={tip} />

      <div className={styles.body}>
        <DeckPanel deck={deckA} deckId="a"
          onPlay={() => handlePlay('a')} onCue={() => handleCue('a')}
          onSync={() => handleSync('a')} onLoop={() => sd('a', d => ({ looping: !d.looping }))}
          onVolume={v => handleVolume('a', v)} onEQ={(b, v) => handleEQ('a', b, v)}
          onFile={f => handleFileLoad('a', f)} />

        <Mixer cf={cf} onCF={handleCF}
          volA={deckA.volume} volB={deckB.volume}
          onVolA={v => handleVolume('a', v)} onVolB={v => handleVolume('b', v)} />

        <SuggestionPanel
          suggestions={suggestions} loading={loadingAI}
          hasKey={!!apiKey}
          onRefresh={() => fetchSuggestions(genre, deckA, deckB)}
          onSuggestBoth={handleSuggestBoth}
          onLoadA={t => handleLoadTrack(t, 'a')}
          onLoadB={t => handleLoadTrack(t, 'b')} />

        <DeckPanel deck={deckB} deckId="b"
          onPlay={() => handlePlay('b')} onCue={() => handleCue('b')}
          onSync={() => handleSync('b')} onLoop={() => sd('b', d => ({ looping: !d.looping }))}
          onVolume={v => handleVolume('b', v)} onEQ={(b, v) => handleEQ('b', b, v)}
          onFile={f => handleFileLoad('b', f)} />
      </div>

      <BottomBar genre={genre} genres={GENRES} onGenre={handleGenre}
        recording={recording} recSec={recSec} onRecord={handleRecord}
        onExport={handleExport} exportProg={exportProg}
        deckA={deckA} deckB={deckB} />

      {showModal && <APIModal current={apiKey} onSave={handleSaveKey} onClose={() => setShowModal(false)} />}
    </div>
  )
}
