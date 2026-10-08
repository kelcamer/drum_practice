// 50 common drum grooves, plus polyrhythm and tom drills.
//
// Default tempos on the grooves in rotation are set to your current working
// tempo from the practice notes, not the record tempo — push up from there.
//
// lanes keys: k(kick) s(snare) h(hi-hat) r(ride) c(crash) t(high tom) f(floor tom)
// chars per step: '-' rest · 'x' hit · 'X' accent · 'g' ghost (snare) · 'o' open hi-hat
// sub  = subdivisions per beat (4 = sixteenths, 3 = triplets/swing, 2 = eighths)
// beats = beats in the bar. grid length = sub * beats.

const P = (name, cat, bpm, sub, beats, desc, lanes) => ({
  name,
  cat,
  bpm,
  sub,
  beats,
  desc,
  lanes,
});

export const GROOVES = [
  // ---- Rock & Pop ----
  P("Basic Rock Beat", "Rock & Pop", 100, 4, 4, "The first groove every drummer learns. Hi-hat eighths, kick on 1 & 3, snare on 2 & 4.", { h: "x-x-x-x-x-x-x-x-", k: "x-------x-------", s: "----x-------x---" }),
  P("Four on the Floor", "Rock & Pop", 122, 4, 4, "Kick on every quarter note — the relentless pulse behind dance-rock and pop.", { h: "x-x-x-x-x-x-x-x-", k: "x---x---x---x---", s: "----x-------x---" }),
  P("Half-Time Groove", "Rock & Pop", 84, 4, 4, "Snare moves to beat 3, halving the perceived tempo. Huge and heavy.", { h: "x-x-x-x-x-x-x-x-", k: "x---------------", s: "--------x-------" }),
  P("Driving Eighths", "Rock & Pop", 140, 4, 4, "Kick on every eighth note — punk-adjacent forward momentum.", { h: "x-x-x-x-x-x-x-x-", k: "x-x-x-x-x-x-x-x-", s: "----x-------x---" }),
  P("Rock on the Ride", "Rock & Pop", 112, 4, 4, "The basic beat with the ride cymbal instead of hats — opens up the chorus.", { r: "x-x-x-x-x-x-x-x-", k: "x-------x-------", s: "----x-------x---", c: "x---------------" }),
  P("Sixteenth Groove", "Rock & Pop", 92, 4, 4, "Two-handed sixteenth notes on the hats — busier, funk-leaning rock.", { h: "xxxxxxxxxxxxxxxx", k: "x-------x-------", s: "----x-------x---" }),
  P("Stadium Anthem", "Rock & Pop", 128, 4, 4, "Syncopated kick with a crash on 1 — big, arena-sized.", { h: "x-x-x-x-x-x-x-x-", k: "x---x-x-x---x-x-", s: "----x-------x---", c: "x---------------" }),
  P("The 'Money' Beat", "Rock & Pop", 116, 4, 4, "Cousin of the basic beat with an extra kick before beat 3 — heard on countless hits.", { h: "x-x-x-x-x-x-x-x-", k: "x-------x-x-----", s: "----x-------x---" }),
  P("Motown Backbeat", "Rock & Pop", 128, 4, 4, "Snare on every beat under a driving kick — the Motown engine room.", { h: "x-x-x-x-x-x-x-x-", k: "x-------x-------", s: "x---x---x---x---" }),
  P("Tom-Tom Floor Groove", "Rock & Pop", 100, 4, 4, "Kick and snare only, no cymbals — the raw 'floor tom' feel for verses.", { k: "x-------x-------", s: "----x-------x---" }),

  // ---- Funk & Disco ----
  P("Basic Funk", "Funk & Disco", 100, 4, 4, "Syncopated kick against sixteenth hats — the foundation of funk.", { h: "xxxxxxxxxxxxxxxx", k: "x--x----x--x----", s: "----x-------x---" }),
  P("Ghost Note Groove", "Funk & Disco", 94, 4, 4, "Quiet 'ghost' snares fill the gaps between the backbeats — that greasy funk feel.", { h: "x-x-x-x-x-x-x-x-", k: "x--x--x---x-----", s: "g-g-X-g-g-g-X-g-" }),
  P("Funky Drummer", "Funk & Disco", 76, 4, 4, "The most-sampled break in history — accented sixteenths and ghosted snares.", { h: "XxxxXxxxXxxxXxxx", k: "x--x--x----x----", s: "----X--gX-g-X-g-" }),
  P("Syncopated Funk", "Funk & Disco", 74, 4, 4, "Kick pushes and pulls off the beat while the hats keep sixteenth time.", { h: "xxxxxxxxxxxxxxxx", k: "x----x-x--x-x---", s: "----x-------x---" }),
  P("Disco", "Funk & Disco", 120, 4, 4, "Four-on-the-floor kick with open hi-hats on the upbeats — the disco lift.", { h: "x-o-x-o-x-o-x-o-", k: "x---x---x---x---", s: "----x-------x---" }),
  P("New Orleans Second Line", "Funk & Disco", 90, 4, 4, "Loose, swung street-parade feel with a syncopated bass drum.", { h: "x-x-x-x-x-x-x-x-", k: "x--x---x-x--x---", s: "----x--g----x-g-" }),
  P("Purdie Half-Time Shuffle", "Funk & Disco", 100, 3, 4, "Bernard Purdie's legendary triplet shuffle with ghost notes (simplified).", { h: "xxxxxxxxxxxx", k: "x-----x-----", s: "g-gX-gg-gX-g" }),
  P("Cold Sweat", "Funk & Disco", 60, 4, 4, "James Brown drive — busy kick, tight backbeat, relentless hats.", { h: "xxxxxxxxxxxxxxxx", k: "x--x-x--x--x-x--", s: "----x-------x---" }),

  // ---- Hip-Hop ----
  P("Boom Bap", "Hip-Hop", 120, 4, 4, "The classic '90s boom-bap: fat kick ('boom') and cracking snare ('bap').", { h: "x-x-x-x-x-x-x-x-", k: "x-----x-x-------", s: "----x-------x---" }),
  P("Lo-Fi", "Hip-Hop", 84, 4, 4, "Laid-back, dusty and sparse — the study-beats feel.", { h: "x-x-x-x-x-x-x-x-", k: "x-----x---x-----", s: "----x-------x---" }),
  P("Trap", "Hip-Hop", 140, 4, 4, "Half-time snare on 3 with rapid rolling hi-hats.", { h: "xxxxxxxxxxxxxxxx", k: "x-------x-x-----", s: "--------x-------" }),
  P("Old School", "Hip-Hop", 98, 4, 4, "Straight-ahead boom bap, the breakbeat blueprint.", { h: "x-x-x-x-x-x-x-x-", k: "x-------x-------", s: "----x-------x---" }),
  P("Dilla Feel", "Hip-Hop", 76, 4, 4, "Deliberately 'drunk', off-grid kick placement — the J Dilla wobble (approx).", { h: "x-x-x-x-x-x-x-x-", k: "x------xx--x----", s: "----x-------x---" }),
  P("West Coast Bounce", "Hip-Hop", 70, 4, 4, "Bouncy syncopated kick under a steady backbeat.", { h: "x-x-x-x-x-x-x-x-", k: "x----x-x--x-----", s: "----x-------x---" }),

  // ---- Jazz & Swing ----
  P("Swing Ride", "Jazz & Swing", 150, 3, 4, "The 'spang-a-lang' jazz ride pattern with hi-hat foot on 2 & 4.", { r: "x--x-xx--x-x", h: "---x-----x--" }),
  P("Shuffle Blues", "Jazz & Swing", 108, 3, 4, "Triplet shuffle on the ride — the backbone of blues and swing.", { r: "x-xx-xx-xx-x", k: "x-----x-----", s: "---x-----x--" }),
  P("Jazz Waltz", "Jazz & Swing", 185, 3, 3, "Swung ride in 3/4 — the jazz waltz lilt.", { r: "x--x-xx--", h: "---x-----" }),
  P("Bebop Comping", "Jazz & Swing", 180, 3, 4, "Fast swing ride with sparse kick 'bombs' and snare comps.", { r: "x--x-xx--x-x", k: "x-------x---", s: "-----x------" }),
  P("Brush Ballad", "Jazz & Swing", 72, 3, 4, "Slow, swept swing feel for ballads (hats stand in for brushes).", { r: "x--x-xx--x-x", s: "g--g-gg--g-g" }),

  // ---- Latin & World ----
  P("Bossa Nova", "Latin & World", 80, 4, 4, "Gentle Brazilian groove: steady hats, cross-stick clave, rolling kick.", { h: "x-x-x-x-x-x-x-x-", k: "x--x--x-x--x--x-", s: "--x---x---x---x-" }),
  P("Samba", "Latin & World", 100, 4, 4, "Driving Brazilian carnival feel — busy surdo-style kick.", { h: "xxxxxxxxxxxxxxxx", k: "x-xx-x-xx-x-xx-x", s: "--x--x--x--x--x-" }),
  P("Reggae One Drop", "Latin & World", 80, 4, 4, "The signature reggae move: nothing on beat 1, kick AND snare drop together on 3.", { h: "x-x-x-x-x-x-x-x-", k: "--------x-------", s: "--------x-------" }),
  P("Ska / Rocksteady", "Latin & World", 140, 4, 4, "Hi-hats on the upbeats give ska its skipping bounce.", { h: "--x---x---x---x-", k: "x---x---x---x---", s: "----x-------x---" }),
  P("Songo", "Latin & World", 104, 4, 4, "Modern Afro-Cuban groove blending clave with a funk backbone (approx).", { h: "x-x-x-x-x-x-x-x-", k: "--x-x---x-x-x---", s: "---x--x----x--x-" }),
  P("Cha-Cha-Chá", "Latin & World", 120, 4, 4, "Classic Latin dance pulse with the cha-cha kick and snare.", { h: "x-x-x-x-x-x-x-x-", k: "x---x---x---x-x-", s: "----x-------x---" }),
  P("Afro-Cuban 6/8", "Latin & World", 100, 3, 2, "Rolling 6/8 bell feel — the root of much West African & Cuban rhythm.", { r: "x-xx-x", k: "x-----", s: "---x--" }),
  P("Mozambique", "Latin & World", 108, 4, 4, "Syncopated Cuban carnival groove (simplified for the kit).", { h: "x-x-x-x-x-x-x-x-", k: "x--x--x---x--x--", s: "--x--x--x--x--x-" }),

  // ---- Electronic ----
  P("House", "Electronic", 124, 4, 4, "Four-on-the-floor kick, offbeat open hats, clap on 2 & 4.", { h: "--o---o---o---o-", k: "x---x---x---x---", s: "----x-------x---" }),
  P("Techno", "Electronic", 130, 4, 4, "Machine-tight four-on-the-floor with relentless sixteenth hats.", { h: "xxxxxxxxxxxxxxxx", k: "x---x---x---x---", s: "----x-------x---" }),
  P("Drum & Bass", "Electronic", 174, 4, 4, "Fast half-time break — kick on 1, snare on 3, breakneck hats.", { h: "xxxxxxxxxxxxxxxx", k: "x---------x-----", s: "--------x-------" }),
  P("Amen Break", "Electronic", 138, 4, 4, "The most-sampled breakbeat ever — chopped kick and snare syncopation (approx).", { h: "x-x-x-x-x-x-x-x-", k: "x-x-------x-----", s: "----x--g-x--x-x-" }),
  P("Dubstep", "Electronic", 140, 4, 4, "Half-time skank: snare on 3, sparse kick, space for the wobble.", { h: "x-x-x-x-x-x-x-x-", k: "x-------x-x-----", s: "--------x-------" }),
  P("Breakbeat", "Electronic", 132, 4, 4, "Big-beat chopped groove — syncopated kick and snare with driving hats.", { h: "x-x-x-x-x-x-x-x-", k: "x----x-x--x-----", s: "----x------x-x--" }),

  // ---- Odd Time & Extreme ----
  P("7/8 Groove", "Odd Time & Extreme", 120, 2, 7, "Seven eighth-notes per bar — that lopsided prog-rock limp.", { h: "x-x-x-x-x-x-x-", k: "x---x-x-------", s: "------x-------" }),
  P("5/4 (Take Five)", "Odd Time & Extreme", 170, 2, 5, "Five beats to the bar — the Dave Brubeck classic feel.", { r: "x-x-x-x-x-", k: "x-------x-", s: "----x-----" }),
  P("6/8 Ballad", "Odd Time & Extreme", 120, 3, 2, "Compound 6/8 — two big pulses of three, the power-ballad sway.", { h: "xxxxxx", k: "x-----", s: "---x--" }),
  P("Waltz (3/4)", "Odd Time & Extreme", 150, 2, 3, "One-two-three: kick on the downbeat, backbeats on 2 & 3.", { h: "x-x-x-", k: "x-----", s: "--x-x-" }),
  P("Blast Beat", "Odd Time & Extreme", 180, 2, 4, "Extreme-metal machine gun — kick and snare alternate at full speed.", { h: "xxxxxxxx", k: "x-x-x-x-", s: "-x-x-x-x" }),
  P("Punk d-Beat", "Odd Time & Extreme", 170, 4, 4, "The relentless hardcore-punk engine — pounding eighths, driving snare.", { h: "x-x-x-x-x-x-x-x-", k: "x-x-x-x-x-x-x-x-", s: "----x-------x---" }),
  P("Train Beat", "Odd Time & Extreme", 120, 4, 4, "Country/rockabilly 'freight train' — steady chugging snare (brush feel).", { s: "x-xxx-xxx-xxx-xx", k: "x-------x-------" }),
  P("Bo Diddley", "Odd Time & Extreme", 130, 4, 4, "The famous hambone clave rhythm that launched a thousand rock songs.", { h: "x-x-x-x-x-x-x-x-", k: "x--x--x-----x-x-", s: "------------x---" }),
  // ---- Polyrhythms & Toms ----
  // Learn each one limb at a time: lock the steady pulse, then lay the other on top.
  P("3 over 2 (Hemiola)", "Polyrhythms & Toms", 70, 3, 4, "Kick on every beat, ride on every other triplet — three ride notes float over every two kicks. Count the kick, feel the ride.", { r: "x-x-x-x-x-x-", k: "x--x--x--x--", h: "---x-----x--" }),
  P("2 over 3 Waltz", "Polyrhythms & Toms", 90, 2, 3, "Kick walks 1-2-3 while the floor tom splits the bar in two — the 3/4-vs-6/8 tug of war.", { h: "xxxxxx", k: "x-x-x-", f: "x--x--" }),
  P("3 over 4", "Polyrhythms & Toms", 66, 3, 4, "Kick on all four beats, floor tom spaced evenly three times across the bar. The classic 'pass the gold' brain-bender.", { k: "x--x--x--x--", f: "x---x---x---", h: "---x-----x--" }),
  P("4 over 3", "Polyrhythms & Toms", 72, 4, 3, "Flip it: kick holds three beats while the high tom lands every three sixteenths — four even notes across the bar.", { k: "x---x---x---", t: "x--x--x--x--", h: "--x---x---x-" }),
  P("Tresillo 3-3-2", "Polyrhythms & Toms", 92, 4, 4, "Kick in groups of 3+3+2 sixteenths under a straight backbeat — the Afro-Cuban cell hiding inside reggaeton, pop and funk.", { h: "x-x-x-x-x-x-x-x-", k: "x--x--x-x--x--x-", s: "----x-------x---" }),
  P("Bembé 12/8 (3 against 4)", "Polyrhythms & Toms", 84, 3, 4, "West African bell on the ride, kick on the four big pulses, floor tom carving three across them — polyrhythm as a real groove.", { r: "x-x-xx-x-x-x", k: "x--x--x--x--", f: "x---x---x---" }),
  P("Paradiddle Groove", "Polyrhythms & Toms", 76, 4, 4, "RLRR LRLL split between hat (right) and snare (left), accents on 2 & 4. Builds the independence the Dilla feel asks for.", { h: "x-xx-x--x-xx-x--", s: "-g--X-gg-g--X-gg", k: "x-------x-------" }),
  P("Floor Tom Groove", "Polyrhythms & Toms", 96, 4, 4, "Right hand moves from hat to floor tom — big, rumbling indie-rock pulse with a high-tom pickup at the end.", { f: "x-x-x-x-x-x-x-x-", k: "x-------x-x-----", s: "----x-------x---", t: "--------------x-" }),
  P("Jungle Toms", "Polyrhythms & Toms", 110, 4, 4, "Gene Krupa's 'Sing, Sing, Sing' tom-tom stomp (approx) — floor and high tom trading over four on the floor.", { k: "x---x---x---x---", f: "X---x---X---x---", t: "------x-------xx" }),
  P("Around the Kit", "Polyrhythms & Toms", 70, 4, 4, "Sixteenth fill down the kit: snare, high tom, floor tom, then land it with kick and crash. Loop it until it's smooth.", { s: "xxxx------------", t: "----xxxx--------", f: "--------xxxx----", k: "------------x-x-", c: "x---------------" }),
];


export const LANES = [
  ["crash", "c", "Crash"],
  ["ride", "r", "Ride"],
  ["hat", "h", "Hi-Hat"],
  ["tom", "t", "Hi Tom"],
  ["snare", "s", "Snare"],
  ["floor", "f", "Floor"],
  ["kick", "k", "Kick"],
];

// Toms only get a row when the groove uses them, so the original grooves
// keep their familiar five-lane grid.
export const OPTIONAL_LANES = ["tom", "floor"];

/** The lanes to draw for a groove. */
export function visibleLanes(pat) {
  return LANES.filter(([id, key]) => !OPTIONAL_LANES.includes(id) || pat.lanes[key]);
}

function norm(str, len) {
  if (!str) return "-".repeat(len);
  if (str.length < len) return str + "-".repeat(len - str.length);
  return str.slice(0, len);
}

/** Expand a groove's lane strings into per-step char arrays keyed by lane id. */
export function laneCells(pat) {
  const len = pat.sub * pat.beats;
  const out = {};
  LANES.forEach(([id, key]) => {
    out[id] = norm(pat.lanes[key] || "", len).split("");
  });
  return out;
}

/** The spoken count label for step i given subdivisions-per-beat `sub`. */
export function countLabel(i, sub) {
  const pos = i % sub;
  if (pos === 0) return String(i / sub + 1);
  if (sub === 4) return pos === 1 ? "e" : pos === 2 ? "&" : "a";
  if (sub === 3) return pos === 1 ? "&" : "a";
  if (sub === 2) return "&";
  return "·";
}

/** Map a lane char to {voice, vel} or null for a rest. */
export function charToVoice(laneId, ch) {
  if (ch === "-" || ch === " ") return null;
  if (laneId === "hat") {
    if (ch === "o") return { v: "openhat", vel: 0.9 };
    if (ch === "X") return { v: "hat", vel: 1.0 };
    return { v: "hat", vel: 0.7 };
  }
  if (laneId === "snare") {
    if (ch === "g") return { v: "snare", vel: 0.32 };
    if (ch === "X") return { v: "snare", vel: 1.0 };
    return { v: "snare", vel: 0.85 };
  }
  const vel = ch === "X" ? 1.0 : ch === "g" ? 0.4 : 0.9;
  return { v: laneId, vel };
}
