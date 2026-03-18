import React from 'react'
import PropTypes from 'prop-types'
import styles from './SuggestionPanel.module.css'

export default function SuggestionPanel({ suggestions, onLoad }) {
  return (
    <div className={styles.panel}>
      <h3>SUGGESTIONS</h3>
      {suggestions.map((t, i) => (
        <div key={i} className={styles.track} onClick={() => onLoad(t)}>
          <div>{t.title} - {t.artist}</div>
          <div className={styles.meta}>{t.bpm} BPM | {t.camelot} | {t.matchScore}%</div>
        </div>
      ))}
    </div>
  )
}

SuggestionPanel.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    artist: PropTypes.string,
    bpm: PropTypes.number,
    camelot: PropTypes.string,
    matchScore: PropTypes.number,
  })).isRequired,
  onLoad: PropTypes.func.isRequired,
}
