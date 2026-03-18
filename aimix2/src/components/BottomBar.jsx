import s from './BottomBar.module.css'

export default function BottomBar({ genre, genres, onGenre, recording, recSec, onRecord, onExport, exportProg, deckA, deckB }) {
  const fmt = sec => `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`
  const expLabel = exportProg === null ? '↓ MP3' : exportProg >= 100 ? '✓ SAVED' : `⚙ ${exportProg}%`

  return (
    <div className={s.bar}>
      <div className={s.genres}>
        {genres.map(g => (
          <button key={g} className={`${s.genre} ${genre === g ? s.active : ''}`} onClick={() => onGenre(g)}>{g}</button>
        ))}
      </div>

      <div className={s.status}>
        <div className={s.chip} style={{ borderColor: 'rgba(208,80,255,0.3)' }}>
          <span className={s.dot} style={{ background: deckA.playing ? 'var(--accent-a)' : 'var(--border-md)', animation: deckA.playing ? 'blink 0.7s infinite' : 'none' }} />
          <span style={{ color: 'var(--accent-a)' }}>A</span>
          <span className={s.chipBpm}>{deckA.bpm} BPM</span>
        </div>
        <div className={s.chip} style={{ borderColor: 'rgba(0,212,255,0.3)' }}>
          <span className={s.dot} style={{ background: deckB.playing ? 'var(--accent-b)' : 'var(--border-md)', animation: deckB.playing ? 'blink 0.7s infinite' : 'none' }} />
          <span style={{ color: 'var(--accent-b)' }}>B</span>
          <span className={s.chipBpm}>{deckB.bpm} BPM</span>
        </div>
      </div>

      <div className={s.rec}>
        {recording && (
          <span className={s.timer}><span className={s.recDot} />{fmt(recSec)}</span>
        )}
        <button className={`${s.recBtn} ${recording ? s.recOn : ''}`} onClick={onRecord}>
          {recording ? '⏹ STOP' : '⏺ RECORD'}
        </button>
        <button className={s.expBtn} onClick={onExport}
          disabled={exportProg !== null && exportProg < 100}
          style={exportProg >= 100 ? { color: 'var(--green)', borderColor: 'rgba(0,230,118,0.3)' } : {}}>
          {expLabel}
        </button>
      </div>
    </div>
  )
}
