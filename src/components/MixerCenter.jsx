// components/MixerCenter.jsx
import styles from './MixerCenter.module.css'

export default function MixerCenter({
  crossfader, onCrossfader,
  suggestions, isLoadingAI,
  genres, selectedGenre, onGenre,
  onLoadSuggestion, onAISuggestDeck, onAISuggestBoth, onRefreshAI,
  hasApiKey,
  deckAVol, deckBVol, onDeckAVol, onDeckBVol,
}) {
  const cfLabel = crossfader < 45 ? 'DECK A' : crossfader > 55 ? 'DECK B' : 'CENTER'

  return (
    <div className={styles.center}>

      {/* Volume faders */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>CHANNEL</div>
        <div className={styles.volRow}>
          <span className={styles.volLabel} style={{ color: 'var(--accent-a)' }}>A</span>
          <input
            type="range" min="0" max="100" value={deckAVol}
            className="deck-a"
            onChange={e => onDeckAVol(parseInt(e.target.value))}
          />
          <span className={styles.volVal}>{deckAVol}</span>
        </div>
        <div className={styles.volRow}>
          <span className={styles.volLabel} style={{ color: 'var(--accent-b)' }}>B</span>
          <input
            type="range" min="0" max="100" value={deckBVol}
            className="deck-b"
            onChange={e => onDeckBVol(parseInt(e.target.value))}
          />
          <span className={styles.volVal}>{deckBVol}</span>
        </div>
      </div>

      {/* Crossfader */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>CROSSFADER</div>
        <div className={styles.crossfaderLabels}>
          <span style={{ color: 'var(--accent-a)' }}>A</span>
          <span className={styles.cfLabel}>{cfLabel}</span>
          <span style={{ color: 'var(--accent-b)' }}>B</span>
        </div>
        <input
          type="range" min="0" max="100" value={crossfader}
          style={{ accentColor: '#888' }}
          onChange={e => onCrossfader(parseInt(e.target.value))}
        />
      </div>

      {/* AI Suggest buttons */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={hasApiKey ? styles.aiDotOn : styles.aiDotOff} />
          AI SUGGEST
        </div>
        <div className={styles.aiButtons}>
          <button className={styles.aiBtn} onClick={() => onAISuggestDeck('a')}>
            → DECK A
          </button>
          <button className={styles.aiBtn} onClick={() => onAISuggestDeck('b')}>
            → DECK B
          </button>
          <button
            className={`${styles.aiBtn} ${styles.aiBtnBoth}`}
            onClick={onAISuggestBoth}
          >
            ✦ BOTH
          </button>
        </div>
      </div>

      {/* AI Suggestions list */}
      <div className={styles.suggestionsPanel}>
        <div className={styles.suggestionsHeader}>
          <span>TRACKS</span>
          <button
            className={styles.refreshBtn}
            onClick={onRefreshAI}
            disabled={isLoadingAI}
            title="Refresh suggestions"
          >
            {isLoadingAI ? '...' : '↻'}
          </button>
        </div>

        <div className={styles.suggestionsList}>
          {isLoadingAI ? (
            <div className={styles.loading}>
              <span className={styles.loadDot} />
              <span className={styles.loadDot} style={{ animationDelay: '0.2s' }} />
              <span className={styles.loadDot} style={{ animationDelay: '0.4s' }} />
            </div>
          ) : suggestions.length === 0 ? (
            <div className={styles.emptyState}>No suggestions yet</div>
          ) : (
            suggestions.map((track, i) => (
              <SuggestionCard
                key={`${track.title}-${i}`}
                track={track}
                onLoadA={() => onLoadSuggestion(track, 'a')}
                onLoadB={() => onLoadSuggestion(track, 'b')}
              />
            ))
          )}
        </div>
      </div>

    </div>
  )
}

function SuggestionCard({ track, onLoadA, onLoadB }) {
  return (
    <div className={styles.suggestionCard}>
      <div className={styles.suggestionInfo}>
        <div className={styles.suggestionTitle}>{track.title}</div>
        <div className={styles.suggestionArtist}>{track.artist}</div>
        <div className={styles.suggestionMeta}>
          <span className={styles.suggestionBpm}>{track.bpm} BPM</span>
          {track.camelot && (
            <span className={styles.camelotTag}>{track.camelot}</span>
          )}
        </div>
        {track.mixTip && (
          <div className={styles.mixTip}>{track.mixTip}</div>
        )}
        <div className={styles.matchBar}>
          <div
            className={styles.matchFill}
            style={{ width: `${track.matchScore}%` }}
          />
          <span className={styles.matchVal}>{track.matchScore}%</span>
        </div>
      </div>
      <div className={styles.suggestionActions}>
        <button
          className={styles.loadBtn}
          style={{ color: 'var(--accent-a)', borderColor: 'rgba(200,80,248,0.3)' }}
          onClick={onLoadA}
          title="Load to Deck A"
        >
          A
        </button>
        <button
          className={styles.loadBtn}
          style={{ color: 'var(--accent-b)', borderColor: 'rgba(0,212,255,0.3)' }}
          onClick={onLoadB}
          title="Load to Deck B"
        >
          B
        </button>
      </div>
    </div>
  )
}
