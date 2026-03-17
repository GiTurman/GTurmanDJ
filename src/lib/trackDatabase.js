// lib/trackDatabase.js
// Curated track database for AI suggestions fallback

export const TRACK_DB = {
  ALL: [
    { title: 'Strobe', artist: 'deadmau5', genre: 'PROGRESSIVE HOUSE', bpm: 128, key: 'F MIN', camelot: '4A', energy: 6 },
    { title: 'One More Time', artist: 'Daft Punk', genre: 'FRENCH HOUSE', bpm: 125, key: 'G MAJ', camelot: '9B', energy: 8 },
    { title: 'Around the World', artist: 'Daft Punk', genre: 'FRENCH HOUSE', bpm: 121, key: 'G MIN', camelot: '6A', energy: 7 },
    { title: 'Strings of Life', artist: 'Derrick May', genre: 'DETROIT TECHNO', bpm: 132, key: 'A MIN', camelot: '8A', energy: 9 },
    { title: 'Finally', artist: 'CeCe Peniston', genre: 'HOUSE', bpm: 124, key: 'C MAJ', camelot: '8B', energy: 8 },
    { title: 'Music Sounds Better', artist: 'Stardust', genre: 'FRENCH HOUSE', bpm: 126, key: 'F MAJ', camelot: '7B', energy: 9 },
    { title: 'Breathe', artist: 'Telepopmusik', genre: 'DEEP HOUSE', bpm: 112, key: 'A MIN', camelot: '8A', energy: 5 },
    { title: 'Show Me Love', artist: 'Robin S', genre: 'HOUSE', bpm: 131, key: 'C MIN', camelot: '5A', energy: 9 },
    { title: 'Windowlicker', artist: 'Aphex Twin', genre: 'ELECTRONICA', bpm: 105, key: 'D MIN', camelot: '7A', energy: 7 },
    { title: 'Inner City Life', artist: 'Goldie', genre: 'DRUM & BASS', bpm: 170, key: 'F# MIN', camelot: '11A', energy: 8 },
    { title: 'Sandstorm', artist: 'Darude', genre: 'TRANCE', bpm: 136, key: 'B MIN', camelot: '10A', energy: 10 },
    { title: 'Blue Monday', artist: 'New Order', genre: 'SYNTH POP', bpm: 130, key: 'D MIN', camelot: '7A', energy: 8 },
    { title: 'Pacific State', artist: '808 State', genre: 'TECHNO', bpm: 128, key: 'E MIN', camelot: '9A', energy: 7 },
    { title: 'Born Slippy', artist: 'Underworld', genre: 'TECHNO', bpm: 138, key: 'A MAJ', camelot: '11B', energy: 10 },
    { title: 'Flat Beat', artist: 'Mr. Oizo', genre: 'FRENCH HOUSE', bpm: 124, key: 'E MIN', camelot: '9A', energy: 8 },
    { title: 'Da Funk', artist: 'Daft Punk', genre: 'FRENCH HOUSE', bpm: 96, key: 'F MIN', camelot: '4A', energy: 7 },
    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', genre: 'ROCK', bpm: 117, key: 'F MIN', camelot: '4A', energy: 9 },
    { title: 'NY State of Mind', artist: 'Nas', genre: 'HIP-HOP', bpm: 94, key: 'D MIN', camelot: '7A', energy: 8 },
    { title: 'C.R.E.A.M.', artist: 'Wu-Tang Clan', genre: 'HIP-HOP', bpm: 88, key: 'A MIN', camelot: '8A', energy: 7 },
    { title: 'Still D.R.E.', artist: 'Dr. Dre ft. Snoop Dogg', genre: 'HIP-HOP', bpm: 93, key: 'D MIN', camelot: '7A', energy: 7 },
    { title: 'Teardrop', artist: 'Massive Attack', genre: 'TRIP-HOP', bpm: 95, key: 'F MAJ', camelot: '7B', energy: 5 },
    { title: 'Unfinished Sympathy', artist: 'Massive Attack', genre: 'TRIP-HOP', bpm: 104, key: 'G MIN', camelot: '6A', energy: 7 },
    { title: 'Music for Airports 1/1', artist: 'Brian Eno', genre: 'AMBIENT', bpm: 72, key: 'C MAJ', camelot: '8B', energy: 2 },
    { title: 'Avril 14th', artist: 'Aphex Twin', genre: 'AMBIENT', bpm: 80, key: 'E MIN', camelot: '9A', energy: 3 },
  ],
  HOUSE: [
    { title: 'Finally', artist: 'CeCe Peniston', genre: 'HOUSE', bpm: 124, key: 'C MAJ', camelot: '8B', energy: 8 },
    { title: 'Music Sounds Better', artist: 'Stardust', genre: 'FRENCH HOUSE', bpm: 126, key: 'F MAJ', camelot: '7B', energy: 9 },
    { title: 'Show Me Love', artist: 'Robin S', genre: 'HOUSE', bpm: 131, key: 'C MIN', camelot: '5A', energy: 9 },
    { title: 'One More Time', artist: 'Daft Punk', genre: 'FRENCH HOUSE', bpm: 125, key: 'G MAJ', camelot: '9B', energy: 8 },
    { title: 'Deep Down', artist: 'Barry Harris', genre: 'DEEP HOUSE', bpm: 120, key: 'D MIN', camelot: '7A', energy: 6 },
    { title: 'Flat Beat', artist: 'Mr. Oizo', genre: 'FRENCH HOUSE', bpm: 124, key: 'E MIN', camelot: '9A', energy: 8 },
    { title: 'Breathe', artist: 'Telepopmusik', genre: 'DEEP HOUSE', bpm: 112, key: 'A MIN', camelot: '8A', energy: 5 },
  ],
  TECHNO: [
    { title: 'Strings of Life', artist: 'Derrick May', genre: 'DETROIT TECHNO', bpm: 132, key: 'A MIN', camelot: '8A', energy: 9 },
    { title: 'Pacific State', artist: '808 State', genre: 'TECHNO', bpm: 128, key: 'E MIN', camelot: '9A', energy: 7 },
    { title: 'Born Slippy', artist: 'Underworld', genre: 'TECHNO', bpm: 138, key: 'A MAJ', camelot: '11B', energy: 10 },
    { title: 'Blue Monday', artist: 'New Order', genre: 'SYNTH POP', bpm: 130, key: 'D MIN', camelot: '7A', energy: 8 },
    { title: 'Windowlicker', artist: 'Aphex Twin', genre: 'ELECTRONICA', bpm: 105, key: 'D MIN', camelot: '7A', energy: 7 },
  ],
  'DRUM & BASS': [
    { title: 'Inner City Life', artist: 'Goldie', genre: 'DRUM & BASS', bpm: 170, key: 'F# MIN', camelot: '11A', energy: 8 },
    { title: 'Brown Paper Bag', artist: 'Roni Size', genre: 'JUNGLE', bpm: 168, key: 'G MIN', camelot: '6A', energy: 9 },
    { title: 'Timeless', artist: 'Goldie', genre: 'DRUM & BASS', bpm: 165, key: 'D MIN', camelot: '7A', energy: 7 },
  ],
  'HIP-HOP': [
    { title: 'NY State of Mind', artist: 'Nas', genre: 'HIP-HOP', bpm: 94, key: 'D MIN', camelot: '7A', energy: 8 },
    { title: 'C.R.E.A.M.', artist: 'Wu-Tang Clan', genre: 'HIP-HOP', bpm: 88, key: 'A MIN', camelot: '8A', energy: 7 },
    { title: 'Still D.R.E.', artist: 'Dr. Dre ft. Snoop Dogg', genre: 'HIP-HOP', bpm: 93, key: 'D MIN', camelot: '7A', energy: 7 },
    { title: 'Nuthin But a G Thang', artist: 'Dr. Dre', genre: 'HIP-HOP', bpm: 95, key: 'D MIN', camelot: '7A', energy: 8 },
  ],
  AMBIENT: [
    { title: 'Music for Airports 1/1', artist: 'Brian Eno', genre: 'AMBIENT', bpm: 72, key: 'C MAJ', camelot: '8B', energy: 2 },
    { title: 'Avril 14th', artist: 'Aphex Twin', genre: 'AMBIENT', bpm: 80, key: 'E MIN', camelot: '9A', energy: 3 },
    { title: 'Teardrop', artist: 'Massive Attack', genre: 'TRIP-HOP', bpm: 95, key: 'F MAJ', camelot: '7B', energy: 5 },
  ],
  TRANCE: [
    { title: 'Sandstorm', artist: 'Darude', genre: 'TRANCE', bpm: 136, key: 'B MIN', camelot: '10A', energy: 10 },
    { title: 'Children', artist: 'Robert Miles', genre: 'DREAM TRANCE', bpm: 138, key: 'D MIN', camelot: '7A', energy: 8 },
    { title: 'We Are', artist: 'Ana Criado', genre: 'TRANCE', bpm: 140, key: 'A MIN', camelot: '8A', energy: 9 },
  ]
};

// Camelot wheel compatibility
const CAMELOT_COMPATIBLE = {
  '1A': ['1A', '12A', '2A', '1B'],
  '2A': ['2A', '1A', '3A', '2B'],
  '3A': ['3A', '2A', '4A', '3B'],
  '4A': ['4A', '3A', '5A', '4B'],
  '5A': ['5A', '4A', '6A', '5B'],
  '6A': ['6A', '5A', '7A', '6B'],
  '7A': ['7A', '6A', '8A', '7B'],
  '8A': ['8A', '7A', '9A', '8B'],
  '9A': ['9A', '8A', '10A', '9B'],
  '10A': ['10A', '9A', '11A', '10B'],
  '11A': ['11A', '10A', '12A', '11B'],
  '12A': ['12A', '11A', '1A', '12B'],
  '1B': ['1B', '12B', '2B', '1A'],
  '2B': ['2B', '1B', '3B', '2A'],
  '3B': ['3B', '2B', '4B', '3A'],
  '4B': ['4B', '3B', '5B', '4A'],
  '5B': ['5B', '4B', '6B', '5A'],
  '6B': ['6B', '5B', '7B', '6A'],
  '7B': ['7B', '6B', '8B', '7A'],
  '8B': ['8B', '7B', '9B', '8A'],
  '9B': ['9B', '8B', '10B', '9A'],
  '10B': ['10B', '9B', '11B', '10A'],
  '11B': ['11B', '10B', '12B', '11A'],
  '12B': ['12B', '11B', '1B', '12A'],
};

export function getStaticSuggestions({ deckA, deckB, genre, count = 5 }) {
  const pool = TRACK_DB[genre] || TRACK_DB.ALL;

  const scored = pool.map(track => {
    let score = 50;

    // BPM score
    const refBpm = deckA?.bpm || deckB?.bpm;
    if (refBpm) {
      const diff = Math.abs(track.bpm - refBpm);
      if (diff <= 2) score += 30;
      else if (diff <= 5) score += 20;
      else if (diff <= 10) score += 10;
      else if (diff <= 15) score += 5;
    }

    // Camelot key score
    const refCamelot = deckA?.camelot || deckB?.camelot;
    if (refCamelot && track.camelot) {
      const compatible = CAMELOT_COMPATIBLE[refCamelot] || [];
      if (track.camelot === refCamelot) score += 20;
      else if (compatible.includes(track.camelot)) score += 12;
    }

    // Don't suggest same track already playing
    if (track.title === deckA?.title || track.title === deckB?.title) score = -1;

    return { ...track, matchScore: Math.min(99, score), mixTip: getMixTip(refBpm, track.bpm) };
  });

  return scored
    .filter(t => t.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, count);
}

function getMixTip(fromBpm, toBpm) {
  if (!fromBpm) return 'Load a track to get mix tips';
  const diff = Math.abs(fromBpm - toBpm);
  if (diff <= 2) return 'Perfect BPM match — straight mix in';
  if (diff <= 5) return 'Use pitch/tempo slider to align BPMs';
  if (diff <= 10) return 'EQ swap on the kick and bass';
  if (diff <= 15) return 'Filter transition — high-pass before mix-in';
  return 'Big BPM jump — use loop or build-up section';
}

export const GENRES = ['ALL', 'HOUSE', 'TECHNO', 'DRUM & BASS', 'HIP-HOP', 'AMBIENT', 'TRANCE', 'TRIP-HOP'];
