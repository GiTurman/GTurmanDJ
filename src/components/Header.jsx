import s from './Header.module.css'

export default function Header({ bpm, master, onMaster, hasKey, onKeyClick, tip }) {
  return (
    <header className={s.header}>
      <div className={s.logo}>AI<span>MIX</span></div>

      <div className={s.tip}>
        {tip && <><span className={s.tipDot}>✦</span>{tip}</>}
      </div>

      <div className={s.right}>
        <div className={s.bpm}><span className={s.bpmNum}>{bpm}</span><span className={s.bpmLbl}>BPM</span></div>
        <div className={s.vol}>
          <span className={s.volLbl}>MASTER</span>
          <input type="range" min="0" max="100" value={master} onChange={e => onMaster(+e.target.value)} />
          <span className={s.volVal}>{master}%</span>
        </div>
        <button className={`${s.key} ${hasKey ? s.keyOn : ''}`} onClick={onKeyClick}>
          <span className={hasKey ? s.dotOn : s.dotOff} />
          {hasKey ? 'AI ON' : 'ADD KEY'}
        </button>
      </div>
    </header>
  )
}
