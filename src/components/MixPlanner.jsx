import React from 'react'
import PropTypes from 'prop-types'
import styles from './MixPlanner.module.css'

export default function MixPlanner({ plan, onGenerate }) {
  return (
    <div className={styles.planner}>
      <button onClick={onGenerate}>GENERATE PLAN</button>
      {plan.map((t, i) => (
        <div key={i} className={styles.track}>{t.title} - {t.artist}</div>
      ))}
    </div>
  )
}

MixPlanner.propTypes = {
  plan: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    artist: PropTypes.string,
  })).isRequired,
  onGenerate: PropTypes.func.isRequired,
}
