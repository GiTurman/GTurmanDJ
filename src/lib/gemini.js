// gemini.js — Google AI Studio API

const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function getSuggestions({ deckA, deckB, genre, apiKey, count = 6 }) {
  if (!apiKey) return null

  const playing = []
  if (deckA?.title && deckA.title !== 'Strobe') playing.push(`Deck A: "${deckA.title}" by ${deckA.artist} — ${deckA.genre}, ${deckA.bpm} BPM, key ${deckA.key}`)
  if (deckB?.title && deckB.title !== 'Around the World') playing.push(`Deck B: "${deckB.title}" by ${deckB.artist} — ${deckB.genre}, ${deckB.bpm} BPM, key ${deckB.key}`)

  const prompt = `You are a world-class DJ assistant with expert knowledge of harmonic mixing, BPM matching, and music theory.

Currently loaded tracks:
${playing.length ? playing.join('\n') : 'No tracks loaded yet — suggest popular electronic music tracks'}

Genre preference: ${genre === 'ALL' ? 'Any genre, focus on mixable electronic music' : genre}

Your task: Suggest ${count} real, well-known tracks that would mix perfectly. Apply these DJ rules:
1. BPM within ±8 of loaded tracks (or halftime/doubletime)
2. Camelot wheel compatibility (same number ±1, or same letter)
3. Natural energy flow (don't jump too high/low)
4. Genre compatibility

Return ONLY valid JSON, nothing else:
{
  "suggestions": [
    {
      "title": "Track Title",
      "artist": "Artist Name",
      "genre": "GENRE",
      "bpm": 128,
      "key": "A MIN",
      "camelot": "8A",
      "energy": 7,
      "matchScore": 95,
      "mixTip": "Brief specific mixing tip under 12 words"
    }
  ]
}`

  try {
    const res = await fetch(`${URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return parsed.suggestions || null
  } catch (e) {
    console.error('Gemini error:', e)
    return null
  }
}

export async function getMixTip({ from, to, apiKey }) {
  if (!apiKey) return null
  const prompt = `DJ tip for mixing "${from.title}" (${from.bpm}BPM, ${from.key}) → "${to.title}" (${to.bpm}BPM, ${to.key}). One sentence, max 10 words, specific technique.`
  try {
    const res = await fetch(`${URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 80 }
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch { return null }
}
