import s from './Mixer.module.css'

export default function Mixer({ cf, onCF, volA, volB, onVolA, onVolB }) {
  const label = cf < 45 ? 'A' : cf > 55 ? 'B' : 'CENTER'
  return (
    <div className={s.mixer}>
      <div className={s.sec}>
        <div className={s.title}>CHANNEL</div>
        <div className={s.row}>
          <span className={s.lbl} style={{ color: 'var(--accent-a)' }}>A</span>
          <input type="range" min="0" max="100" value={volA} className="a" onChange={e => onVolA(+e.target.value)} />
          <span className={s.val}>{volA}</span>
        </div>
        <div className={s.row}>
          <span className={s.lbl} style={{ color: 'var(--accent-b)' }}>B</span>
          <input type="range" min="0" max="100" value={volB} className="b" onChange={e => onVolB(+e.target.value)} />
          <span className={s.val}>{volB}</span>
        </div>
      </div>

      <div className={s.sec}>
        <div className={s.title}>CROSSFADER</div>
        <div className={s.cfLabels}>
          <span style={{ color: 'var(--accent-a)' }}>A</span>
          <span className={s.cfPos}>{label}</span>
          <span style={{ color: 'var(--accent-b)' }}>B</span>
        </div>
        <input type="range" min="0" max="100" value={cf}
          style={{ accentColor: '#666' }} onChange={e => onCF(+e.target.value)} />
      </div>
    </div>
  )
}
