// The practice log — saved in the browser so it survives a reload.
//
// Time from EVERY riff adds into the same `totalMs`, and that total is what
// drives the level ladder. `riffs` keeps the per-groove breakdown alongside it,
// so you can see which grooves you've actually put the hours into.

// Never rename this key — it's where everyone's existing hours and levels live.
const KEY = "groove-library.practice.v1";
// The session that's running right now, checkpointed every few seconds so a
// closed tab, a killed phone browser or a dead battery can't eat it.
const ACTIVE_KEY = "groove-library.active.v1";

const EMPTY = { v: 1, totalMs: 0, riffs: {}, days: {}, sessions: 0 };

/** Local calendar day, not UTC — a 11pm session belongs to that evening. */
export function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Coerce anything log-shaped (storage, a backup file) into a clean log. */
function normalize(p) {
  return {
    v: 1,
    totalMs: Number(p.totalMs) || 0,
    riffs: p.riffs && typeof p.riffs === "object" ? p.riffs : {},
    days: p.days && typeof p.days === "object" ? p.days : {},
    sessions: Number(p.sessions) || 0,
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return normalize(JSON.parse(raw));
  } catch {
    // Private mode, disabled storage, corrupt JSON — practising still works,
    // it just won't be remembered.
    return { ...EMPTY };
  }
}

export function save(log) {
  try {
    localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* nothing to do — see load() */
  }
}

/** Ask the browser not to evict our storage (Safari clears idle sites). */
export function persist() {
  try {
    navigator.storage?.persist?.();
  } catch {
    /* best effort */
  }
}

/**
 * Add one finished session. Returns the new log (never mutates the old one).
 * `when` is the day it counts toward — defaults to today.
 */
export function addSession(log, riffName, ms, when = new Date()) {
  if (!(ms > 0)) return log;
  const k = dayKey(when);
  return {
    ...log,
    totalMs: log.totalMs + ms,
    riffs: { ...log.riffs, [riffName]: (log.riffs[riffName] || 0) + ms },
    days: { ...log.days, [k]: (log.days[k] || 0) + ms },
    sessions: log.sessions + 1,
  };
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* see load() */
  }
  return { ...EMPTY };
}

// ---- active-session checkpoint ----

export function checkpoint(session) {
  try {
    localStorage.setItem(
      ACTIVE_KEY,
      JSON.stringify({ riff: session.riff, startedAt: session.startedAt, lastSeen: Date.now() })
    );
  } catch {
    /* see load() */
  }
}

export function clearCheckpoint() {
  try {
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* see load() */
  }
}

/**
 * A session that was running when the page last went away and never got
 * banked. Banks it (up to the last checkpoint — the only time we can vouch
 * for) and returns { log, riff, ms }, or null if there was nothing to recover.
 */
export function recover(log) {
  let a;
  try {
    a = JSON.parse(localStorage.getItem(ACTIVE_KEY) || "null");
  } catch {
    a = null;
  }
  clearCheckpoint();
  if (!a || !a.riff || !(a.startedAt > 0) || !(a.lastSeen >= a.startedAt)) return null;
  const ms = a.lastSeen - a.startedAt;
  if (ms < 5000) return null;
  const next = addSession(log, a.riff, ms, new Date(a.startedAt));
  save(next);
  return { log: next, riff: a.riff, ms };
}

// ---- backup ----

export function exportJson(log) {
  return JSON.stringify({ app: "groove-library", exportedAt: new Date().toISOString(), log }, null, 2);
}

/** Parse a backup file. Throws if it isn't one. */
export function importJson(text) {
  const p = JSON.parse(text);
  const raw = p && p.log ? p.log : p;
  if (!raw || typeof raw !== "object" || !("totalMs" in raw)) {
    throw new Error("Not a Groove Library backup");
  }
  return normalize(raw);
}

// ---- weekly streak ----

/** Monday of the week containing `d`, at local midnight. */
function weekStart(d) {
  const w = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  w.setDate(w.getDate() - ((w.getDay() + 6) % 7));
  return w;
}

function practisedInWeek(log, monday) {
  const d = new Date(monday);
  for (let i = 0; i < 7; i += 1) {
    if (log.days[dayKey(d)] > 0) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

/**
 * Consecutive weeks (Monday–Sunday) with any practice, counting back from this
 * week. Not having played yet this week doesn't break it until next Monday.
 */
export function streak(log) {
  const w = weekStart(new Date());
  if (!practisedInWeek(log, w)) {
    w.setDate(w.getDate() - 7);
    if (!practisedInWeek(log, w)) return 0;
  }
  let n = 0;
  while (practisedInWeek(log, w)) {
    n += 1;
    w.setDate(w.getDate() - 7);
  }
  return n;
}

/** Time logged so far this week (Monday onward). */
export function thisWeekMs(log) {
  const d = weekStart(new Date());
  let ms = 0;
  for (let i = 0; i < 7; i += 1) {
    ms += log.days[dayKey(d)] || 0;
    d.setDate(d.getDate() + 1);
  }
  return ms;
}

/** Riffs with logged time, most-practised first. */
export function ranked(log) {
  return Object.entries(log.riffs)
    .filter(([, ms]) => ms > 0)
    .sort((a, b) => b[1] - a[1]);
}
