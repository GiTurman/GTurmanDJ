import styles from './BottomBar.module.css'

export default function BottomBar({
  selectedGenre, genres, onGenre,
  recording, recSeconds, onRecord,
  onExport, exportProgress,
  deckA, deckB,
}) {
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const exportLabel = exportProgress === null ? '↓ MP3' : exportProgress >= 100 ? '✓ SAVED' : `⚙ ${exportProgress}%`

  return (
    <div className={styles.bar}>
      <div className={styles.genreFilters}>
        {genres.map(g => (
          <button key={g} className={`${styles.genreBtn} ${selectedGenre === g ? styles.genreActive : ''}`} onClick={() => onGenre(g)}>
            {g}
          </button>
        ))}
      </div>
      <div className={styles.deckStatus}>
        <div className={styles.statusChip} style={{ borderColor: 'rgba(200,80,248,0.3)' }}>
          <span className={styles.statusDot} style={{ background: deckA.playing ? 'var(--accent-a)' : 'var(--border-md)' }} />
          <span style={{ color: 'var(--accent-a)' }}>A</span>
          <span className={styles.statusBpm}>{deckA.bpm} BPM</span>
        </div>
        <div className={styles.statusChip} style={{ borderColor: 'rgba(0,212,255,0.3)' }}>
          <span className={styles.statusDot} style={{ background: deckB.playing ? 'var(--accent-b)' : 'var(--border-md)' }} />
          <span style={{ color: 'var(--accent-b)' }}>B</span>
          <span className={styles.statusBpm}>{deckB.bpm} BPM</span>
        </div>
      </div>
      <div className={styles.recControls}>
        {recording && <span className={styles.recTimer}><span className={styles.recDot} />{fmt(recSeconds)}</span>}
        <button className={`${styles.recBtn} ${recording ? styles.recActive : ''}`} onClick={onRecord}>
          {recording ? '⏹ STOP' : '⏺ RECORD'}
        </button>
        <button className={styles.exportBtn} onClick={onExport}
          disabled={exportProgress !== null && exportProgress < 100}
          style={exportProgress >= 100 ? { color: 'var(--green)', borderColor: 'rgba(0,230,118,0.3)' } : {}}>
          {exportLabel}
        </button>
      </div>
    </div>
  )
}