import s from './SuggestionPanel.module.css'

export default function SuggestionPanel({ suggestions, loading, hasKey, onRefresh, onSuggestBoth, onLoadA, onLoadB }) {
  return (
    <div className={s.panel}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <span className={hasKey ? s.dotOn : s.dotOff} />
          <span className={s.title}>AI SUGGESTIONS</span>
        </div>
        <button className={s.refresh} onClick={onRefresh} disabled={loading} title="Refresh">
          {loading ? '···' : '↻'}
        </button>
      </div>

      <div className={s.actions}>
        <button className={s.actionBtn} onClick={onRefresh}>→ SUGGEST A</button>
        <button className={s.actionBtn} onClick={onRefresh}>→ SUGGEST B</button>
        <button className={`${s.actionBtn} ${s.both}`} onClick={onSuggestBoth}>✦ BOTH</button>
      </div>

      <div className={s.list}>
        {loading ? (
          <div className={s.loading}>
            <span className={s.dot} /><span className={s.dot} style={{ animationDelay: '.2s' }} /><span className={s.dot} style={{ animationDelay: '.4s' }} />
          </div>
        ) : suggestions.length === 0 ? (
          <div className={s.empty}>No suggestions yet</div>
        ) : suggestions.map((t, i) => (
          <TrackCard key={`${t.title}-${i}`} track={t} onLoadA={() => onLoadA(t)} onLoadB={() => onLoadB(t)} />
        ))}
      </div>
    </div>
  )
}

function TrackCard({ track, onLoadA, onLoadB }) {
  return (
    <div className={s.card}>
      <div className={s.info}>
        <div className={s.trackTitle}>{track.title}</div>
        <div className={s.trackArtist}>{track.artist}</div>
        <div className={s.meta}>
          <span className={s.metaBpm}>{track.bpm} BPM</span>
          {track.camelot && <span className={s.camelot}>{track.camelot}</span>}
          {track.energy && <span className={s.energy}>E{track.energy}</span>}
        </div>
        {track.mixTip && <div className={s.tipText}>{track.mixTip}</div>}
        <div className={s.bar}>
          <div className={s.barTrack}><div className={s.fill} style={{ width: `${track.matchScore || 0}%` }} /></div>
          <span className={s.score}>{track.matchScore}%</span>
        </div>
      </div>
      <div className={s.btns}>
        <button className={s.loadA} onClick={onLoadA} title="Load to Deck A">A</button>
        <button className={s.loadB} onClick={onLoadB} title="Load to Deck B">B</button>
      </div>
    </div>
  )
}
