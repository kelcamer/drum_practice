// The practice log — saved in the browser so it survives a reload.
//
// Time from EVERY riff adds into the same `totalMs`, and that total is what
// drives the level ladder. `riffs` keeps the per-groove breakdown alongside it,
// so you can see which grooves you've actually put the hours into.

const KEY = "groove-library.practice.v1";

const EMPTY = { v: 1, totalMs: 0, riffs: {}, days: {}, sessions: 0 };

/** Local calendar day, not UTC — a 11pm session belongs to that evening. */
export function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw);
    return {
      v: 1,
      totalMs: Number(p.totalMs) || 0,
      riffs: p.riffs && typeof p.riffs === "object" ? p.riffs : {},
      days: p.days && typeof p.days === "object" ? p.days : {},
      sessions: Number(p.sessions) || 0,
    };
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

/** Add one finished session. Returns the new log (never mutates the old one). */
export function addSession(log, riffName, ms) {
  if (!(ms > 0)) return log;
  const k = dayKey();
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

/** Consecutive days practised, counting back from today (or yesterday). */
export function streak(log) {
  const d = new Date();
  if (!log.days[dayKey(d)]) {
    // Today not practised yet doesn't break a streak until tomorrow.
    d.setDate(d.getDate() - 1);
    if (!log.days[dayKey(d)]) return 0;
  }
  let n = 0;
  while (log.days[dayKey(d)]) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Riffs with logged time, most-practised first. */
export function ranked(log) {
  return Object.entries(log.riffs)
    .filter(([, ms]) => ms > 0)
    .sort((a, b) => b[1] - a[1]);
}
