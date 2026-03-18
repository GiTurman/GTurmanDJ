// mixPlanner.js — Auto DJ mix sequencer
// Builds optimal track order using Camelot wheel + BPM matching

const CAMELOT_NEIGHBORS = {
  '1A':['1A','12A','2A','1B'], '2A':['2A','1A','3A','2B'], '3A':['3A','2A','4A','3B'],
  '4A':['4A','3A','5A','4B'], '5A':['5A','4A','6A','5B'], '6A':['6A','5A','7A','6B'],
  '7A':['7A','6A','8A','7B'], '8A':['8A','7A','9A','8B'], '9A':['9A','8A','10A','9B'],
  '10A':['10A','9A','11A','10B'],'11A':['11A','10A','12A','11B'],'12A':['12A','11A','1A','12B'],
  '1B':['1B','12B','2B','1A'], '2B':['2B','1B','3B','2A'], '3B':['3B','2B','4B','3A'],
  '4B':['4B','3B','5B','4A'], '5B':['5B','4B','6B','5A'], '6B':['6B','5B','7B','6A'],
  '7B':['7B','6B','8B','7A'], '8B':['8B','7B','9B','8A'], '9B':['9B','8B','10B','9A'],
  '10B':['10B','9B','11B','10A'],'11B':['11B','10B','12B','11A'],'12B':['12B','11B','1B','12A'],
}

// Score how well two tracks transition
function transitionScore(from, to) {
  if (!from || !to) return 0
  let score = 0

  // BPM compatibility (max 40 pts)
  const bpmDiff = Math.abs(from.bpm - to.bpm)
  if (bpmDiff === 0) score += 40
  else if (bpmDiff <= 2) score += 36
  else if (bpmDiff <= 5) score += 28
  else if (bpmDiff <= 8) score += 18
  else if (bpmDiff <= 12) score += 8
  else if (bpmDiff <= 20) score += 2

  // Camelot key compatibility (max 35 pts)
  if (from.camelot && to.camelot) {
    const neighbors = CAMELOT_NEIGHBORS[from.camelot] || []
    if (from.camelot === to.camelot) score += 35       // same key
    else if (neighbors.includes(to.camelot)) score += 25 // neighbor key
    else {
      // Check if 2 steps away
      let twoStep = false
      for (const n of neighbors) {
        if ((CAMELOT_NEIGHBORS[n] || []).includes(to.camelot)) { twoStep = true; break }
      }
      if (twoStep) score += 10
    }
  }

  // Energy flow (max 25 pts) — prefer +0/+1/+2 energy steps
  if (from.energy && to.energy) {
    const diff = to.energy - from.energy
    if (diff === 0) score += 20
    else if (diff === 1) score += 25  // slight build = perfect
    else if (diff === -1) score += 18
    else if (diff === 2) score += 15
    else if (diff === -2) score += 12
    else if (Math.abs(diff) <= 3) score += 6
  }

  return score
}

function getMixTipLocal(from, to) {
  const bpmDiff = Math.abs(from.bpm - to.bpm)
  const fromN = CAMELOT_NEIGHBORS[from.camelot] || []
  const keyCompat = from.camelot === to.camelot ? 'same' : fromN.includes(to.camelot) ? 'neighbor' : 'distant'

  if (bpmDiff <= 2 && keyCompat !== 'distant') return 'Perfect mix — blend directly over 32 bars'
  if (bpmDiff <= 5 && keyCompat === 'same') return 'Nudge pitch slightly, then EQ blend'
  if (bpmDiff <= 8 && keyCompat === 'neighbor') return 'High-pass filter sweep into the drop'
  if (bpmDiff <= 5) return 'EQ swap: cut lows on A, boost on B'
  if (keyCompat === 'same') return 'Same key — use filter or echo for smooth entry'
  if (bpmDiff > 15) return 'Big BPM jump — loop a breakdown section'
  return 'Filter transition + tempo nudge recommended'
}

// Greedy nearest-neighbor with backtracking
export function buildMixPlan(tracks) {
  if (!tracks || tracks.length < 2) return []

  const used = new Set()
  const sequence = []

  // Start with lowest energy track that has a camelot key
  const sorted = [...tracks].sort((a, b) => {
    const ea = a.energy || 5
    const eb = b.energy || 5
    return ea - eb
  })
  let current = sorted[0]
  used.add(current.id || current.title)
  sequence.push(current)

  while (used.size < tracks.length) {
    let bestNext = null
    let bestScore = -1

    for (const t of tracks) {
      const tid = t.id || t.title
      if (used.has(tid)) continue
      const sc = transitionScore(current, t)
      if (sc > bestScore) {
        bestScore = sc
        bestNext = t
      }
    }

    if (!bestNext) break
    used.add(bestNext.id || bestNext.title)
    sequence.push(bestNext)
    current = bestNext
  }

  // Build transition info between consecutive pairs
  return sequence.map((track, i) => {
    const next = sequence[i + 1] || null
    const prev = sequence[i - 1] || null
    return {
      ...track,
      position: i + 1,
      isFirst: i === 0,
      isLast: i === sequence.length - 1,
      transitionScore: next ? transitionScore(track, next) : null,
      mixTip: next ? getMixTipLocal(track, next) : null,
      nextTrack: next ? { title: next.title, artist: next.artist } : null,
      bpmChange: next ? next.bpm - track.bpm : null,
      keyChange: next && track.camelot && next.camelot
        ? (track.camelot === next.camelot ? 'same' : (CAMELOT_NEIGHBORS[track.camelot] || []).includes(next.camelot) ? 'neighbor' : 'distant')
        : null,
    }
  })
}

// Ask Gemini to plan the mix sequence
export async function aiMixPlan({ tracks, genre, style, apiKey }) {
  if (!apiKey || !tracks?.length) return null

  const trackList = tracks.map((t, i) =>
    `${i+1}. "${t.title}" by ${t.artist} — ${t.bpm} BPM, key ${t.key}, camelot ${t.camelot}, energy ${t.energy}/10, genre ${t.genre}`
  ).join('\n')

  const prompt = `You are a world-class DJ with 20 years of experience. Your job is to plan the perfect mix sequence.

Available tracks:
${trackList}

Mix style: ${style || 'progressive build — start calm, peak at 2/3, smooth ending'}
Genre preference: ${genre || 'mixed'}

Create the optimal play order using these DJ principles:
1. Camelot wheel harmonic mixing (stay on same key or move to neighbors)
2. BPM progression (smooth transitions, no jumps >10 BPM unless at breakdown)
3. Energy arc (gradual build to peak, then come down)
4. Genre flow (don't clash incompatible styles abruptly)

Return ONLY this JSON:
{
  "sequence": [
    {
      "position": 1,
      "title": "Track Title",
      "artist": "Artist",
      "mixTip": "Specific 1-sentence technique for mixing INTO next track",
      "transitionType": "blend|cut|filter|echo|loop",
      "energyNote": "Why this position works"
    }
  ],
  "setNarrative": "2-3 sentence description of the overall set arc"
}`

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json'
          }
        })
      }
    )
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return parsed
  } catch (e) {
    console.error('AI mix plan error:', e)
    return null
  }
}

// Quality rating for a transition
export function rateTransition(score) {
  if (score >= 80) return { label: 'PERFECT', color: '#00e676' }
  if (score >= 60) return { label: 'GREAT', color: '#76ff03' }
  if (score >= 40) return { label: 'GOOD', color: '#ffd600' }
  if (score >= 20) return { label: 'OK', color: '#ff9100' }
  return { label: 'ROUGH', color: '#ff1744' }
}
