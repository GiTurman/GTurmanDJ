// gemini.js — AI integration

export async function getSuggestions(currentTracks, genre, apiKey) {
  if (!apiKey) return null
  const prompt = `DJ set context: ${currentTracks.map(t => `${t.title} by ${t.artist} (${t.bpm} BPM, ${t.camelot})`).join(' | ')}. Genre: ${genre}. Suggest 3 tracks that mix well based on BPM, Camelot key, and energy flow. Return JSON: [{title, artist, genre, bpm, camelot, energy, reason}]`
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    const json = JSON.parse(text.replace(/```json|```/g, ''))
    return json.map(t => ({ ...t, matchScore: 90, mixTip: t.reason }))
  } catch (e) {
    console.error('Gemini error:', e)
    return null
  }
}

export async function getMixTip(trackA, trackB, apiKey) {
  if (!apiKey) return 'Load tracks to get AI tips'
  const prompt = `How to mix ${trackA.title} into ${trackB.title}? Keep it brief.`
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  } catch { return 'BPM match recommended' }
}
