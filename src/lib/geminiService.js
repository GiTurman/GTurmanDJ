const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function getAISuggestions({ deckA, deckB, genre, apiKey, count = 5 }) {
  if (!apiKey) throw new Error('API key required');

  const deckInfo = [];
  if (deckA?.title) deckInfo.push(`Deck A: "${deckA.title}" by ${deckA.artist} (${deckA.genre}, ${deckA.bpm} BPM, Key: ${deckA.key})`);
  if (deckB?.title) deckInfo.push(`Deck B: "${deckB.title}" by ${deckB.artist} (${deckB.genre}, ${deckB.bpm} BPM, Key: ${deckB.key})`);

  const prompt = `You are an expert DJ assistant. Currently playing:\n${deckInfo.join('\n') || 'No tracks'}\nGenre filter: ${genre || 'ALL'}\n\nSuggest ${count} real tracks that mix well. Consider BPM (+-10), Camelot key, energy flow.\n\nReturn ONLY this JSON, no other text:\n{"suggestions":[{"title":"","artist":"","genre":"","bpm":128,"key":"C MAJ","camelot":"8B","energy":7,"matchScore":90,"mixTip":"Short tip"}]}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024, responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return parsed.suggestions || [];
  } catch { return []; }
}

export async function getMixTip({ fromTrack, toTrack, apiKey }) {
  if (!apiKey) return null;
  const prompt = `One sentence DJ tip (max 12 words) for mixing from "${fromTrack.title}" (${fromTrack.bpm}BPM) into "${toTrack.title}" (${toTrack.bpm}BPM). Specific technique only.`;
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 60 } })
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export async function generateMixSet({ seedTrack, genre, length = 6, apiKey }) {
  if (!apiKey) return [];
  const prompt = `DJ set of ${length} real tracks starting from "${seedTrack.title}" (${seedTrack.bpm}BPM). Genre: ${genre || 'MIXED'}. Energy arc: build/peak/comedown.\nReturn ONLY JSON: {"set":[{"title":"","artist":"","genre":"","bpm":0,"key":"","camelot":"","energy":0,"matchScore":0,"mixTip":""}]}`;
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 1500, responseMimeType: 'application/json' } })
  });
  if (!response.ok) return [];
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  try { return JSON.parse(text?.replace(/```json|```/g, '').trim()).set || []; } catch { return []; }
}