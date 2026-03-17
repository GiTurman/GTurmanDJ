// components/Header.jsx
import styles from './Header.module.css'

export default function Header({ bpm, masterVol, onMasterVol, hasApiKey, onApiKeyClick, mixTip }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        AI<span>MIX</span>
        <div className={styles.logoSub}>DJ MIXER</div>
      </div>

      <div className={styles.center}>
        {mixTip && (
          <div className={styles.mixTip}>
            <span className={styles.tipIcon}>✦</span>
            {mixTip}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.bpmDisplay}>
          <span className={styles.bpmVal}>{bpm}</span>
          <span className={styles.bpmLabel}>BPM</span>
        </div>

        <div className={styles.masterVol}>
          <span className={styles.volLabel}>MASTER</span>
          <input
            type="range" min="0" max="100" value={masterVol}
            onChange={e => onMasterVol(parseInt(e.target.value))}
            className={styles.masterSlider}
          />
          <span className={styles.volVal}>{masterVol}%</span>
        </div>

        <button
          className={`${styles.apiBtn} ${hasApiKey ? styles.apiBtnActive : ''}`}
          onClick={onApiKeyClick}
          title={hasApiKey ? 'Gemini AI connected' : 'Connect Google AI Studio'}
        >
          <span className={hasApiKey ? styles.aiDotOn : styles.aiDotOff}></span>
          {hasApiKey ? 'AI ON' : 'ADD AI KEY'}
        </button>
      </div>
    </header>
  )
}
