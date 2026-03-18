// mixPlanner.js — Local mix planning

import { staticSuggestions } from './tracks'

export function buildMixPlan(startTrack, count = 5) {
  const plan = [startTrack]
  for (let i = 0; i < count - 1; i++) {
    const suggestions = staticSuggestions({ deckA: plan[plan.length - 1], count: 3 })
    if (suggestions.length === 0) break
    plan.push(suggestions[0])
  }
  return plan
}

export function rateTransition(a, b) {
  const bpmDiff = Math.abs(a.bpm - b.bpm)
  const camelotMatch = a.camelot === b.camelot
  if (bpmDiff <= 2 && camelotMatch) return 'PERFECT'
  if (bpmDiff <= 5) return 'GOOD'
  if (bpmDiff <= 10) return 'OK'
  return 'DIFFICULT'
}
