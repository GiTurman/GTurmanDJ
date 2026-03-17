// lib/geminiService.js
// Google AI Studio (Gemini) integration for track recommendations

import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Get AI track suggestions based on currently playing tracks and genre
 */
export async function getAISuggestions({ deckA, deckB, genre, apiKey, count = 5 }) {
  if (!apiKey) throw new Error('Google AI Studio API key required');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt({ deckA, deckB, genre, count });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.8,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                genre: { type: Type.STRING },
                bpm: { type: Type.NUMBER },
                key: { type: Type.STRING },
                camelot: { type: Type.STRING },
                energy: { type: Type.NUMBER },
                matchScore: { type: Type.NUMBER },
                mixTip: { type: Type.STRING },
              },
              required: ["title", "artist", "genre", "bpm", "key", "camelot", "energy", "matchScore", "mixTip"],
            },
          },
        },
        required: ["suggestions"],
      },
    },
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    const parsed = JSON.parse(text);
    return parsed.suggestions || [];
  } catch {
    return [];
  }
}

function buildPrompt({ deckA, deckB, genre, count }) {
  const deckInfo = [];
  if (deckA?.title) deckInfo.push(`Deck A: "${deckA.title}" by ${deckA.artist} (${deckA.genre}, ${deckA.bpm} BPM, Key: ${deckA.key})`);
  if (deckB?.title) deckInfo.push(`Deck B: "${deckB.title}" by ${deckB.artist} (${deckB.genre}, ${deckB.bpm} BPM, Key: ${deckB.key})`);

  return `You are an expert DJ assistant with deep knowledge of electronic music, beatmatching, and harmonic mixing (Camelot wheel).

Currently playing:
${deckInfo.join('\n') || 'No tracks loaded yet'}

Genre filter: ${genre || 'ALL'}

Task: Suggest ${count} tracks that would mix well with the currently playing tracks. Consider:
1. BPM compatibility (within ±10 BPM for smooth transition, or halftime/double-time)
2. Key compatibility (Camelot wheel — same key, adjacent keys, or relative major/minor)
3. Energy level flow (building energy or coming down)
4. Genre compatibility and crowd energy
5. Harmonic mixing rules

Return ONLY valid JSON. Use real, well-known tracks from the music world.`;
}

/**
 * Get AI mix tip for a specific track transition
 */
export async function getMixTip({ fromTrack, toTrack, apiKey }) {
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a DJ. Give a 1-sentence tip for mixing from "${fromTrack.title}" (${fromTrack.bpm} BPM, ${fromTrack.key}) into "${toTrack.title}" (${toTrack.bpm} BPM, ${toTrack.key}). Be specific about technique (EQ swap, filter, loop, etc). Max 20 words.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { temperature: 0.7 },
  });

  return response.text?.trim() || null;
}

/**
 * Auto-generate a full mix set from a starting track
 */
export async function generateMixSet({ seedTrack, genre, length = 6, apiKey }) {
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Build a DJ set of ${length} tracks starting from "${seedTrack.title}" by ${seedTrack.artist} (${seedTrack.genre}, ${seedTrack.bpm} BPM).
Genre: ${genre || 'MIXED'}
Create a flowing set with proper energy arc (build, peak, comedown).`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.9,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          set: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                genre: { type: Type.STRING },
                bpm: { type: Type.NUMBER },
                key: { type: Type.STRING },
                camelot: { type: Type.STRING },
                energy: { type: Type.NUMBER },
                matchScore: { type: Type.NUMBER },
                mixTip: { type: Type.STRING },
              },
              required: ["title", "artist", "genre", "bpm", "key", "camelot", "energy", "matchScore", "mixTip"],
            },
          },
        },
        required: ["set"],
      },
    },
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    const parsed = JSON.parse(text);
    return parsed.set || [];
  } catch {
    return [];
  }
}
