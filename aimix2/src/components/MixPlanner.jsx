import { useState } from 'react'
import { buildMixPlan, aiMixPlan, rateTransition } from '../lib/mixPlanner.js'
import { staticSuggestions } from '../lib/tracks.js'
import s from './MixPlanner.module.css'

const DEMO_TRACKS = [
  { title:'Strobe', artist:'deadmau5', genre:'PROGRESSIVE HOUSE', bpm:128, key:'F MIN', camelot:'4A', energy:6 },
  { title:'Music Sounds Better With You', artist:'Stardust', genre:'FRENCH HOUSE', bpm:126, key:'F MAJ', camelot:'7B', energy:9 },
  { title:'One More Time', artist:'Daft Punk', genre:'FRENCH HOUSE', bpm:125, key:'G MAJ', camelot:'9B', energy:8 },
  { title:'Finally', artist:'CeCe Peniston', genre:'HOUSE', bpm:124, key:'C MAJ', camelot:'8B', energy:8 },
  { title:'Show Me Love', artist:'Robin S', genre:'HOUSE', bpm:131, key:'C MIN', camelot:'5A', energy:9 },
  { title:'Born Slippy', artist:'Underworld', genre:'TECHNO', bpm:138, key:'A MAJ', camelot:'11B', energy:10 },
]

export default function MixPlanner({ apiKey, genre, onLoadToDeck }) {
  const [tracks, setTracks] = useState(DEMO_TRACKS)
  const [plan, setPlan] = useState(null)
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('tracks') // tracks | plan
  const [newTrack, setNewTrack] = useState({ title:'', artist:'', bpm:'', key:'', camelot:'', energy:'5', genre:'' })
  const [mixStyle, setMixStyle] = useState('build')
  const [useAI, setUseAI] = useState(true)

  const MIX_STYLES = {
    build: 'Progressive build — low energy start, big peak at 2/3',
    peak: 'Peak hour — high energy throughout',
    journey: 'Journey — varied energy with story arc',
    warmup: 'Warm-up — gentle intro, slowly rising',
    closing: 'Closing set — peak then gradual comedown',
  }

  const generatePlan = async () => {
    if (tracks.length < 2) return
    setLoading(true)
    setPlan(null)
    setNarrative('')

    try {
      let result = null

      if (useAI && apiKey) {
        const aiResult = await aiMixPlan({ tracks, genre, style: MIX_STYLES[mixStyle], apiKey })
        if (aiResult?.sequence) {
          // Map AI sequence back to full track data
          const mapped = aiResult.sequence.map((item, i) => {
            const found = tracks.find(t => t.title === item.title) || tracks[i] || tracks[0]
            const next = aiResult.sequence[i + 1]
            const nextFull = next ? tracks.find(t => t.title === next.title) : null
            return {
              ...found,
              position: item.position,
              mixTip: item.mixTip,
              transitionType: item.transitionType,
              energyNote: item.energyNote,
              nextTrack: next ? { title: next.title, artist: next.artist } : null,
              transitionScore: nextFull ? calcScore(found, nextFull) : null,
              isFirst: i === 0,
              isLast: i === aiResult.sequence.length - 1,
            }
          })
          setPlan(mapped)
          setNarrative(aiResult.setNarrative || '')
          setTab('plan')
          return
        }
      }

      // Fallback: local algorithm
      const localPlan = buildMixPlan(tracks)
      setPlan(localPlan)
      setTab('plan')
    } catch (e) {
      console.error(e)
      setPlan(buildMixPlan(tracks))
      setTab('plan')
    } finally {
      setLoading(false)
    }
  }

  const calcScore = (a, b) => {
    if (!a || !b) return 0
    let sc = 0
    const d = Math.abs(a.bpm - b.bpm)
    if (d <= 2) sc += 40; else if (d <= 5) sc += 28; else if (d <= 10) sc += 14; else if (d <= 20) sc += 4
    const neighbors = { '8A':['8A','7A','9A','8B'],'9A':['9A','8A','10A','9B'],'7B':['7B','6B','8B','7A'] }
    const n = neighbors[a.camelot] || []
    if (a.camelot === b.camelot) sc += 35; else if (n.includes(b.camelot)) sc += 25
    return Math.min(99, sc)
  }

  const addTrack = () => {
    if (!newTrack.title || !newTrack.bpm) return
    setTracks(prev => [...prev, {
      ...newTrack,
      bpm: parseInt(newTrack.bpm) || 128,
      energy: parseInt(newTrack.energy) || 5,
    }])
    setNewTrack({ title:'', artist:'', bpm:'', key:'', camelot:'', energy:'5', genre:'' })
  }

  const removeTrack = (idx) => setTracks(prev => prev.filter((_, i) => i !== idx))

  const addFromSuggestions = () => {
    const suggs = staticSuggestions({ genre, count: 6 })
    const newOnes = suggs.filter(s => !tracks.find(t => t.title === s.title))
    setTracks(prev => [...prev, ...newOnes.slice(0, 4)])
  }

  return (
    <div className={s.planner}>
      {/* Header */}
      <div className={s.head}>
        <div className={s.headTitle}>
          <span className={s.headIcon}>⚡</span>
          AUTO MIX PLANNER
        </div>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab==='tracks'?s.tabOn:''}`} onClick={() => setTab('tracks')}>
            TRACKS ({tracks.length})
          </button>
          <button className={`${s.tab} ${tab==='plan'?s.tabOn:''}`} onClick={() => setTab('plan')} disabled={!plan}>
            MIX PLAN {plan ? `(${plan.length})` : ''}
          </button>
        </div>
      </div>

      {tab === 'tracks' && (
        <div className={s.tracksTab}>
          {/* Track list */}
          <div className={s.trackList}>
            {tracks.map((t, i) => (
              <div key={i} className={s.trackRow}>
                <div className={s.trackNum}>{i + 1}</div>
                <div className={s.trackInfo}>
                  <span className={s.tTitle}>{t.title}</span>
                  <span className={s.tArtist}>{t.artist}</span>
                </div>
                <div className={s.trackMeta}>
                  <span className={s.metaTag}>{t.bpm} BPM</span>
                  {t.camelot && <span className={s.camelotTag}>{t.camelot}</span>}
                  {t.energy && <span className={s.energyTag}>E{t.energy}</span>}
                </div>
                <button className={s.removeBtn} onClick={() => removeTrack(i)}>✕</button>
              </div>
            ))}
            {tracks.length === 0 && (
              <div className={s.emptyTracks}>No tracks added yet</div>
            )}
          </div>

          {/* Add track form */}
          <div className={s.addForm}>
            <div className={s.formTitle}>ADD TRACK MANUALLY</div>
            <div className={s.formRow}>
              <input className={s.inp} placeholder="Title *" value={newTrack.title} onChange={e => setNewTrack(p => ({...p, title: e.target.value}))} />
              <input className={s.inp} placeholder="Artist" value={newTrack.artist} onChange={e => setNewTrack(p => ({...p, artist: e.target.value}))} />
            </div>
            <div className={s.formRow}>
              <input className={s.inp} placeholder="BPM *" type="number" value={newTrack.bpm} onChange={e => setNewTrack(p => ({...p, bpm: e.target.value}))} style={{width:70}} />
              <input className={s.inp} placeholder="Key (e.g. F MIN)" value={newTrack.key} onChange={e => setNewTrack(p => ({...p, key: e.target.value}))} />
              <input className={s.inp} placeholder="Camelot (e.g. 8A)" value={newTrack.camelot} onChange={e => setNewTrack(p => ({...p, camelot: e.target.value}))} style={{width:90}} />
              <input className={s.inp} placeholder="Energy 1-10" type="number" min="1" max="10" value={newTrack.energy} onChange={e => setNewTrack(p => ({...p, energy: e.target.value}))} style={{width:90}} />
            </div>
            <div className={s.formActions}>
              <button className={s.addBtn} onClick={addTrack} disabled={!newTrack.title || !newTrack.bpm}>+ ADD TRACK</button>
              <button className={s.suggBtn} onClick={addFromSuggestions}>+ FROM DATABASE</button>
            </div>
          </div>

          {/* Settings + Generate */}
          <div className={s.settings}>
            <div className={s.settRow}>
              <span className={s.settLabel}>MIX STYLE</span>
              <select className={s.select} value={mixStyle} onChange={e => setMixStyle(e.target.value)}>
                {Object.entries(MIX_STYLES).map(([k, v]) => (
                  <option key={k} value={k}>{k.toUpperCase()} — {v.split('—')[0].trim()}</option>
                ))}
              </select>
            </div>
            <div className={s.settRow}>
              <span className={s.settLabel}>USE AI</span>
              <button
                className={`${s.toggle} ${useAI ? s.toggleOn : ''}`}
                onClick={() => setUseAI(x => !x)}
                title={apiKey ? 'Toggle AI planning' : 'Add API key to use AI'}>
                {useAI && apiKey ? '✦ AI' : 'LOCAL'}
              </button>
            </div>
          </div>

          <button
            className={s.generateBtn}
            onClick={generatePlan}
            disabled={tracks.length < 2 || loading}>
            {loading ? '⏳ PLANNING MIX...' : `⚡ GENERATE MIX PLAN (${tracks.length} TRACKS)`}
          </button>
        </div>
      )}

      {tab === 'plan' && plan && (
        <div className={s.planTab}>
          {narrative && (
            <div className={s.narrative}>
              <span className={s.narrativeIcon}>✦</span>
              {narrative}
            </div>
          )}

          <div className={s.sequence}>
            {plan.map((step, i) => {
              const rating = step.transitionScore !== null ? rateTransition(step.transitionScore) : null
              return (
                <div key={i} className={s.step}>
                  <div className={s.stepNum}>{step.position || i + 1}</div>
                  <div className={s.stepContent}>
                    <div className={s.stepTrack}>
                      <span className={s.stepTitle}>{step.title}</span>
                      <span className={s.stepArtist}>{step.artist}</span>
                    </div>
                    <div className={s.stepMeta}>
                      <span className={s.stepBpm}>{step.bpm} BPM</span>
                      {step.camelot && <span className={s.stepCamelot}>{step.camelot}</span>}
                      {step.energy && (
                        <div className={s.stepEnergy}>
                          {Array.from({length:10},(_,j)=>(
                            <div key={j} className={s.eDot} style={{ background: j < step.energy ? 'var(--accent-a)' : 'var(--border-md)' }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {!step.isLast && step.nextTrack && (
                      <div className={s.transition}>
                        <div className={s.transArrow}>↓</div>
                        <div className={s.transInfo}>
                          {rating && (
                            <span className={s.transRating} style={{ color: rating.color }}>
                              {rating.label} {step.transitionScore ? `(${step.transitionScore}%)` : ''}
                            </span>
                          )}
                          {step.mixTip && <span className={s.transTip}>{step.mixTip}</span>}
                          {step.bpmChange !== null && step.bpmChange !== undefined && (
                            <span className={s.bpmChange} style={{ color: Math.abs(step.bpmChange) <= 5 ? 'var(--green)' : Math.abs(step.bpmChange) <= 10 ? 'var(--yellow)' : 'var(--red)' }}>
                              {step.bpmChange > 0 ? '+' : ''}{step.bpmChange} BPM
                            </span>
                          )}
                        </div>
                        <div className={s.transNext}>→ {step.nextTrack.title}</div>
                      </div>
                    )}
                    {step.isLast && (
                      <div className={s.lastBadge}>🎤 SET ENDS HERE</div>
                    )}
                  </div>
                  <div className={s.stepActions}>
                    <button className={s.loadA} onClick={() => onLoadToDeck && onLoadToDeck(step, 'a')}>A</button>
                    <button className={s.loadB} onClick={() => onLoadToDeck && onLoadToDeck(step, 'b')}>B</button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={s.planActions}>
            <button className={s.backBtn} onClick={() => setTab('tracks')}>← EDIT TRACKS</button>
            <button className={s.regenBtn} onClick={generatePlan} disabled={loading}>
              {loading ? '⏳' : '↻ REGENERATE'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
