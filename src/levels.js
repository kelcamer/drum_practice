// Practice levels.
//
// Every threshold is a round number on purpose — no 53.7 hours. The ladder
// starts in 10-minute increments, then switches to whole hours and repeats the
// same 1 / 1.5 / 2 / 2.5 / 5 / 7.5 shape in each decade:
//
//   10, 20, 30, 40, 50 min
//   1, 2, 3, 4, 5 hr
//   10, 15, 20, 25, 50, 75 hr
//   100, 150, 200, 250, 500, 750 hr
//   1000, 1500, 2000, 2500, 5000, 7500 hr
//   10,000 hr
//
// Totals are cumulative: level 7 means 2 hours logged in all, not 2 more.

const HOURS = [
  1, 2, 3, 4, 5,
  10, 15, 20, 25, 50, 75,
  100, 150, 200, 250, 500, 750,
  1000, 1500, 2000, 2500, 5000, 7500,
  10000,
];

/** Cumulative MINUTES required to reach each level. Index 0 === level 1. */
export const THRESHOLDS = [10, 20, 30, 40, 50, ...HOURS.map((h) => h * 60)];

export const GOAL_MIN = 10000 * 60; // 600,000 — the whole point of the ladder

export const NAMES = [
  "First Sticks",
  "Basement Beginner",
  "Metronome Friend",
  "Steady Hands",
  "Backbeat Believer",
  "Groove Finder",
  "Garage Regular",
  "Pocket Hunter",
  "Fill Slinger",
  "Time Keeper",
  "Ghost Note Whisperer",
  "Limb Independent",
  "Rudiment Runner",
  "Band Practice Ready",
  "Local Gig Drummer",
  "In the Pocket",
  "Odd Time Traveller",
  "Studio Hand",
  "Session Player",
  "Chart Reader",
  "Touring Kit",
  "Festival Slot",
  "Headliner",
  "Clinic Teacher",
  "Groove Architect",
  "Master of Time",
  "Living Legend",
  "Hall of Fame",
  "10,000 Hours",
];

export const MAX_LEVEL = THRESHOLDS.length;

/**
 * Where `ms` of logged practice puts you.
 * Level 0 is the pre-level state: nothing logged yet, level 1 not reached.
 */
export function levelInfo(ms) {
  const mins = ms / 60000;
  let level = 0;
  for (let i = 0; i < THRESHOLDS.length; i += 1) {
    if (mins >= THRESHOLDS[i]) level = i + 1;
  }
  const maxed = level >= MAX_LEVEL;
  const floor = level === 0 ? 0 : THRESHOLDS[level - 1];
  const ceil = maxed ? THRESHOLDS[MAX_LEVEL - 1] : THRESHOLDS[level];
  const span = ceil - floor;
  const pct = maxed ? 100 : Math.max(0, Math.min(100, ((mins - floor) / span) * 100));

  return {
    level,
    maxed,
    name: level === 0 ? "Unlevelled" : NAMES[level - 1],
    nextName: maxed ? null : NAMES[level],
    floorMin: floor,
    ceilMin: ceil,
    pct,
    toNextMin: maxed ? 0 : Math.max(0, ceil - mins),
    goalPct: Math.max(0, Math.min(100, (mins / GOAL_MIN) * 100)),
  };
}

/** "1h 04m" / "12m 30s" / "45s" — compact, no zero-padding noise. */
export function fmtDur(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

/** Running stopwatch readout: mm:ss, or h:mm:ss past an hour. */
export function fmtClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Minutes → a round human label. Thresholds are round, so these stay round. */
export function fmtMins(mins) {
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = mins / 60;
  const shown = Number.isInteger(h) ? h : Math.round(h * 10) / 10;
  return `${shown.toLocaleString()} hr`;
}
