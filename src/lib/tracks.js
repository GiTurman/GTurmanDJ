// tracks.js — Static track database + Camelot matching

const CAMELOT = {
  '1A':['1A','12A','2A','1B'], '2A':['2A','1A','3A','2B'], '3A':['3A','2A','4A','3B'],
  '4A':['4A','3A','5A','4B'], '5A':['5A','4A','6A','5B'], '6A':['6A','5A','7A','6B'],
  '7A':['7A','6A','8A','7B'], '8A':['8A','7A','9A','8B'], '9A':['9A','8A','10A','9B'],
  '10A':['10A','9A','11A','10B'],'11A':['11A','10A','12A','11B'],'12A':['12A','11A','1A','12B'],
  '1B':['1B','12B','2B','1A'], '2B':['2B','1B','3B','2A'], '3B':['3B','2B','4B','3A'],
  '4B':['4B','3B','5B','4A'], '5B':['5B','4B','6B','5A'], '6B':['6B','5B','7B','6A'],
  '7B':['7B','6B','8B','7A'], '8B':['8B','7B','9B','8A'], '9B':['9B','8B','10B','9A'],
  '10B':['10B','9B','11B','10A'],'11B':['11B','10B','12B','11A'],'12B':['12B','11B','1B','12A'],
}

const DB = [
  // House
  { title:'Finally', artist:'CeCe Peniston', genre:'HOUSE', bpm:124, key:'C MAJ', camelot:'8B', energy:8 },
  { title:'Show Me Love', artist:'Robin S', genre:'HOUSE', bpm:131, key:'C MIN', camelot:'5A', energy:9 },
  { title:'Music Sounds Better With You', artist:'Stardust', genre:'FRENCH HOUSE', bpm:126, key:'F MAJ', camelot:'7B', energy:9 },
  { title:'One More Time', artist:'Daft Punk', genre:'FRENCH HOUSE', bpm:125, key:'G MAJ', camelot:'9B', energy:8 },
  { title:'Da Funk', artist:'Daft Punk', genre:'FRENCH HOUSE', bpm:96, key:'F MIN', camelot:'4A', energy:7 },
  { title:'Flat Beat', artist:'Mr. Oizo', genre:'FRENCH HOUSE', bpm:124, key:'E MIN', camelot:'9A', energy:8 },
  { title:'Breathe', artist:'Telepopmusik', genre:'DEEP HOUSE', bpm:112, key:'A MIN', camelot:'8A', energy:5 },
  { title:'Deep Down', artist:'Barry Harris', genre:'DEEP HOUSE', bpm:120, key:'D MIN', camelot:'7A', energy:6 },
  { title:'I Feel Love', artist:'Donna Summer', genre:'DISCO HOUSE', bpm:122, key:'E MIN', camelot:'9A', energy:9 },
  { title:'Good Life', artist:'Inner City', genre:'HOUSE', bpm:122, key:'C MAJ', camelot:'8B', energy:8 },
  // Techno
  { title:'Strings of Life', artist:'Derrick May', genre:'DETROIT TECHNO', bpm:132, key:'A MIN', camelot:'8A', energy:9 },
  { title:'Pacific State', artist:'808 State', genre:'TECHNO', bpm:128, key:'E MIN', camelot:'9A', energy:7 },
  { title:'Born Slippy', artist:'Underworld', genre:'TECHNO', bpm:138, key:'A MAJ', camelot:'11B', energy:10 },
  { title:'Blue Monday', artist:'New Order', genre:'SYNTH', bpm:130, key:'D MIN', camelot:'7A', energy:8 },
  { title:'Windowlicker', artist:'Aphex Twin', genre:'ELECTRONICA', bpm:105, key:'D MIN', camelot:'7A', energy:7 },
  { title:'Chlorine', artist:'Twenty One Pilots', genre:'ALTERNATIVE', bpm:130, key:'C# MIN', camelot:'6A', energy:7 },
  // Progressive House
  { title:'Strobe', artist:'deadmau5', genre:'PROGRESSIVE HOUSE', bpm:128, key:'F MIN', camelot:'4A', energy:6 },
  { title:'Ghosts n Stuff', artist:'deadmau5', genre:'PROGRESSIVE HOUSE', bpm:128, key:'D MIN', camelot:'7A', energy:8 },
  { title:'Sandstorm', artist:'Darude', genre:'TRANCE', bpm:136, key:'B MIN', camelot:'10A', energy:10 },
  { title:'Children', artist:'Robert Miles', genre:'DREAM TRANCE', bpm:138, key:'D MIN', camelot:'7A', energy:8 },
  { title:'Adagio for Strings', artist:'Tiësto', genre:'TRANCE', bpm:140, key:'F MIN', camelot:'4A', energy:9 },
  { title:'Around the World', artist:'Daft Punk', genre:'FRENCH HOUSE', bpm:121, key:'G MIN', camelot:'6A', energy:7 },
  // Drum & Bass
  { title:'Inner City Life', artist:'Goldie', genre:'DRUM & BASS', bpm:170, key:'F# MIN', camelot:'11A', energy:8 },
  { title:'Brown Paper Bag', artist:'Roni Size', genre:'DRUM & BASS', bpm:168, key:'G MIN', camelot:'6A', energy:9 },
  { title:'Timeless', artist:'Goldie', genre:'DRUM & BASS', bpm:165, key:'D MIN', camelot:'7A', energy:7 },
  { title:'9 Samurai', artist:'Shy FX', genre:'JUNGLE', bpm:172, key:'A MIN', camelot:'8A', energy:9 },
  // Hip-Hop
  { title:'NY State of Mind', artist:'Nas', genre:'HIP-HOP', bpm:94, key:'D MIN', camelot:'7A', energy:8 },
  { title:"C.R.E.A.M.", artist:'Wu-Tang Clan', genre:'HIP-HOP', bpm:88, key:'A MIN', camelot:'8A', energy:7 },
  { title:'Still D.R.E.', artist:'Dr. Dre ft. Snoop Dogg', genre:'HIP-HOP', bpm:93, key:'D MIN', camelot:'7A', energy:7 },
  { title:'HUMBLE.', artist:'Kendrick Lamar', genre:'HIP-HOP', bpm:150, key:'G# MIN', camelot:'1A', energy:9 },
  { title:'Sicko Mode', artist:'Travis Scott', genre:'HIP-HOP', bpm:155, key:'B MIN', camelot:'10A', energy:9 },
  // Ambient / Trip-Hop
  { title:'Teardrop', artist:'Massive Attack', genre:'TRIP-HOP', bpm:95, key:'F MAJ', camelot:'7B', energy:5 },
  { title:'Unfinished Sympathy', artist:'Massive Attack', genre:'TRIP-HOP', bpm:104, key:'G MIN', camelot:'6A', energy:7 },
  { title:'Music for Airports', artist:'Brian Eno', genre:'AMBIENT', bpm:72, key:'C MAJ', camelot:'8B', energy:2 },
  { title:'Avril 14th', artist:'Aphex Twin', genre:'AMBIENT', bpm:80, key:'E MIN', camelot:'9A', energy:3 },
]

function tipFor(fromBpm, toBpm) {
  if (!fromBpm) return 'Load a track first'
  const d = Math.abs(fromBpm - toBpm)
  if (d <= 2) return 'Perfect BPM match — blend directly'
  if (d <= 5) return 'Nudge pitch ±2% to lock BPMs'
  if (d <= 10) return 'EQ swap: cut lows on old, boost new'
  if (d <= 15) return 'High-pass filter transition works well'
  return 'Use loop on breakdown to smooth jump'
}

export function staticSuggestions({ deckA, deckB, genre, count = 6 }) {
  const refBpm = deckA?.bpm || deckB?.bpm
  const refCamelot = deckA?.camelot || deckB?.camelot
  const pool = genre === 'ALL' ? DB : DB.filter(t => t.genre.includes(genre) || t.genre === genre)

  const scored = (pool.length >= 3 ? pool : DB).map(t => {
    if (t.title === deckA?.title || t.title === deckB?.title) return null
    let score = 50
    if (refBpm) {
      const d = Math.abs(t.bpm - refBpm)
      if (d <= 2) score += 30
      else if (d <= 5) score += 22
      else if (d <= 10) score += 14
      else if (d <= 20) score += 6
    }
    if (refCamelot && t.camelot) {
      const compat = CAMELOT[refCamelot] || []
      if (t.camelot === refCamelot) score += 20
      else if (compat.includes(t.camelot)) score += 12
    }
    return { ...t, matchScore: Math.min(99, score), mixTip: tipFor(refBpm, t.bpm) }
  }).filter(Boolean)

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, count)
}

export const GENRES = ['ALL', 'HOUSE', 'TECHNO', 'TRANCE', 'DRUM & BASS', 'HIP-HOP', 'AMBIENT', 'TRIP-HOP']
