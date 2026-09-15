import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { play, resume, now, KIT, KEYMAP } from "./audio.js";
import {
  GROOVES,
  LANES,
  laneCells,
  countLabel,
  charToVoice,
} from "./grooves.js";
import {
  levelInfo,
  fmtDur,
  fmtClock,
  fmtMins,
  THRESHOLDS,
  NAMES,
  MAX_LEVEL,
  GOAL_MIN,
} from "./levels.js";
import {
  load as loadLog,
  save as saveLog,
  addSession,
  reset as resetLog,
  streak as streakOf,
  ranked,
} from "./practice.js";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;
const clamp = (v) => Math.max(40, Math.min(220, Math.round(v)));

export default function App() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempoState] = useState(GROOVES[0].bpm);
  const [swing, setSwing] = useState(false);

  // ---- practice logging ----
  const [log, setLog] = useState(loadLog);
  const [session, setSession] = useState(null); // { riff, startedAt } while practising
  const [elapsed, setElapsed] = useState(0);
  const [award, setAward] = useState(null); // level-up banner
  const [showLog, setShowLog] = useState(false);

  const pat = GROOVES[idx];
  const cells = useMemo(() => laneCells(pat), [pat]);
  const gridLen = pat.sub * pat.beats;

  const rootRef = useRef(null);

  // runtime the scheduler reads (kept in sync with state)
  const rt = useRef({
    cells,
    gridLen,
    sub: pat.sub,
    tempo,
    swing,
    playing: false,
  });
  useEffect(() => {
    rt.current.cells = cells;
    rt.current.gridLen = gridLen;
    rt.current.sub = pat.sub;
  }, [cells, gridLen, pat.sub]);
  useEffect(() => {
    rt.current.tempo = tempo;
  }, [tempo]);
  useEffect(() => {
    rt.current.swing = swing;
  }, [swing]);

  const sc = useRef({ curStep: 0, nextTime: 0, timer: null, q: [], raf: 0 });

  const flash = useCallback((drum) => {
    const root = rootRef.current;
    if (!root) return;
    const p = root.querySelector(`.pad[data-d="${drum}"]`);
    if (!p) return;
    p.classList.add("lit");
    setTimeout(() => p.classList.remove("lit"), 120);
  }, []);

  const setPlayhead = useCallback((step) => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll(".cell.play").forEach((c) => c.classList.remove("play"));
    root
      .querySelectorAll(`.cell[data-step="${step}"]`)
      .forEach((c) => c.classList.add("play"));
  }, []);

  const stepDur = useCallback(() => 60 / rt.current.tempo / rt.current.sub, []);
  const swungOffset = useCallback(
    (step) => {
      const s = rt.current;
      if (!s.swing) return 0;
      if (s.sub % 2 === 0 && step % 2 === 1) return stepDur() * 0.33;
      return 0;
    },
    [stepDur]
  );

  const scheduler = useCallback(() => {
    const s = sc.current;
    const r = rt.current;
    while (s.nextTime < now() + SCHEDULE_AHEAD) {
      const step = s.curStep;
      const time = s.nextTime + swungOffset(step);
      const hits = [];
      LANES.forEach(([id]) => {
        const ch = r.cells[id][step];
        const vc = charToVoice(id, ch);
        if (vc) {
          play(vc.v, time, vc.vel);
          hits.push(id);
        }
      });
      s.q.push({ step, time, hits });
      s.nextTime += stepDur();
      s.curStep = (s.curStep + 1) % r.gridLen;
    }
  }, [stepDur, swungOffset]);

  const draw = useCallback(() => {
    if (!rt.current.playing) return;
    const s = sc.current;
    const ct = now();
    while (s.q.length && s.q[0].time <= ct) {
      const n = s.q.shift();
      setPlayhead(n.step);
      n.hits.forEach(flash);
    }
    s.raf = requestAnimationFrame(draw);
  }, [setPlayhead, flash]);

  const start = useCallback(() => {
    resume();
    rt.current.playing = true;
    setPlaying(true);
    const s = sc.current;
    s.curStep = 0;
    s.nextTime = now() + 0.08;
    s.q.length = 0;
    clearInterval(s.timer);
    s.timer = setInterval(scheduler, LOOKAHEAD_MS);
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(draw);
  }, [scheduler, draw]);

  const stop = useCallback(() => {
    rt.current.playing = false;
    setPlaying(false);
    const s = sc.current;
    clearInterval(s.timer);
    cancelAnimationFrame(s.raf);
    s.q.length = 0;
    const root = rootRef.current;
    if (root) root.querySelectorAll(".cell.play").forEach((c) => c.classList.remove("play"));
  }, []);

  const toggle = useCallback(() => {
    if (rt.current.playing) stop();
    else start();
  }, [start, stop]);

  const setTempo = useCallback((v) => setTempoState(clamp(v)), []);

  const select = useCallback(
    (i, autoplay) => {
      const n = ((i % GROOVES.length) + GROOVES.length) % GROOVES.length;
      const p = GROOVES[n];
      // update runtime synchronously so the scheduler sees new cells immediately
      rt.current.cells = laneCells(p);
      rt.current.gridLen = p.sub * p.beats;
      rt.current.sub = p.sub;
      setIdx(n);
      setTempo(p.bpm);
      if (autoplay) {
        stop();
        // start on next tick so state/DOM for the new grid is in place
        requestAnimationFrame(() => start());
      }
    },
    [setTempo, start, stop]
  );

  // cleanup on unmount
  useEffect(() => {
    const s = sc.current;
    return () => {
      clearInterval(s.timer);
      cancelAnimationFrame(s.raf);
    };
  }, []);

  const categories = useMemo(() => {
    const seen = [];
    GROOVES.forEach((p) => {
      if (!seen.includes(p.cat)) seen.push(p.cat);
    });
    return seen;
  }, []);

  const padHit = (drum) => {
    resume();
    flash(drum);
    play(drum, now(), 0.95);
  };

  // ---- practice session timer ----
  //
  // Wall-clock deltas, not a counter we increment, so a throttled background
  // tab still logs the real time spent.
  const lvl = useMemo(() => levelInfo(log.totalMs), [log.totalMs]);
  const liveTotal = log.totalMs + elapsed;
  const liveLvl = useMemo(() => levelInfo(liveTotal), [liveTotal]);
  const streak = useMemo(() => streakOf(log), [log]);
  const top = useMemo(() => ranked(log), [log]);
  const riffMs = (log.riffs[pat.name] || 0) + (session?.riff === pat.name ? elapsed : 0);

  useEffect(() => {
    if (!session) return undefined;
    const tick = () => setElapsed(Date.now() - session.startedAt);
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session]);

  const startPractice = useCallback(() => {
    setSession({ riff: pat.name, startedAt: Date.now() });
    setElapsed(0);
    setAward(null);
    if (!rt.current.playing) start();
  }, [pat.name, start]);

  const stopPractice = useCallback(() => {
    if (!session) return;
    const ms = Date.now() - session.startedAt;
    setSession(null);
    setElapsed(0);
    stop();
    // Under 5 seconds is a mis-tap, not a practice session.
    if (ms < 5000) return;
    const before = levelInfo(log.totalMs).level;
    const next = addSession(log, session.riff, ms);
    setLog(next);
    saveLog(next);
    const after = levelInfo(next.totalMs).level;
    setAward({ ms, riff: session.riff, levelled: after > before, level: after });
  }, [session, log, stop]);

  // Switching riffs mid-session banks the time against the riff you were
  // actually playing, then keeps the clock running on the new one.
  const bankAndSwitch = useCallback(
    (i, autoplay) => {
      if (session) {
        const ms = Date.now() - session.startedAt;
        if (ms >= 5000) {
          const next = addSession(log, session.riff, ms);
          setLog(next);
          saveLog(next);
        }
        setSession({ riff: GROOVES[((i % GROOVES.length) + GROOVES.length) % GROOVES.length].name, startedAt: Date.now() });
        setElapsed(0);
      }
      select(i, autoplay);
    },
    [session, log, select]
  );

  // Don't lose a session if the tab closes mid-practice.
  useEffect(() => {
    if (!session) return undefined;
    const onLeave = () => {
      const ms = Date.now() - session.startedAt;
      if (ms >= 5000) saveLog(addSession(log, session.riff, ms));
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [session, log]);

  const clearAll = useCallback(() => {
    setLog(resetLog());
    setSession(null);
    setElapsed(0);
    setAward(null);
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (KEYMAP[k]) {
        resume();
        flash(KEYMAP[k]);
        play(KEYMAP[k], now(), 0.95);
      }
      if (k === " ") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "ArrowRight") bankAndSwitch(idx + 1, true);
      if (e.key === "ArrowLeft") bankAndSwitch(idx - 1, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flash, toggle, bankAndSwitch, idx]);

  return (
    <div className="wrap" ref={rootRef}>
      <header>
        <p className="eyebrow">50 Beats to Know · Hear · See · Learn</p>
        <h1>Groove Library</h1>
        <p className="tag">
          Fifty of the most common drum grooves — pick one, it loops so you can
          hear it, and watch it light up on the grid and the kit. Tap the pads to
          play along.
        </p>
      </header>

      <div className={"level-panel" + (session ? " practising" : "")}>
        <div className="lvl-top">
          <div className="lvl-badge">
            <span className="lvl-k">Level</span>
            <span className="lvl-n">{liveLvl.level}</span>
          </div>
          <div className="lvl-id">
            <div className="lvl-name">{liveLvl.name}</div>
            <div className="lvl-next">
              {liveLvl.maxed
                ? "10,000 hours. The whole ladder, done."
                : `${fmtDur(liveLvl.toNextMin * 60000)} to Level ${liveLvl.level + 1} · ${liveLvl.nextName}`}
            </div>
          </div>
          <div className="lvl-total">
            <span className="lvl-total-n">{fmtDur(liveTotal)}</span>
            <span className="lvl-total-k">logged</span>
          </div>
        </div>

        <div className="lvl-bar">
          <div className="lvl-fill" style={{ width: `${liveLvl.pct}%` }} />
        </div>
        <div className="lvl-scale">
          <span>{liveLvl.level === 0 ? "0 min" : fmtMins(liveLvl.floorMin)}</span>
          <span>{fmtMins(liveLvl.ceilMin)}</span>
        </div>

        <div className="practice-row">
          {session ? (
            <button className="btn practice on" onClick={stopPractice}>
              ■ Stop <span className="clock">{fmtClock(elapsed)}</span>
            </button>
          ) : (
            <button className="btn practice" onClick={startPractice}>
              ● Practice
            </button>
          )}
          <div className="practice-meta">
            {session ? (
              <>
                Logging <b>{session.riff}</b>
              </>
            ) : (
              <>
                <b>{fmtDur(riffMs)}</b> on {pat.name}
              </>
            )}
          </div>
          <div className="streak" title="Days in a row with practice logged">
            🔥 {streak}
            <span className="streak-k">day{streak === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="goal-line">
          <div className="goal-bar">
            <div className="goal-fill" style={{ width: `${Math.max(liveLvl.goalPct, liveTotal > 0 ? 0.4 : 0)}%` }} />
          </div>
          <span className="goal-k">
            {liveLvl.goalPct.toFixed(liveLvl.goalPct < 1 ? 3 : 1)}% of 10,000 hours
          </span>
        </div>

        {award && (
          <div className={"award" + (award.levelled ? " up" : "")}>
            {award.levelled ? (
              <>
                <b>Level {award.level} — {NAMES[award.level - 1]}!</b> Banked{" "}
                {fmtDur(award.ms)} on {award.riff}.
              </>
            ) : (
              <>
                Banked <b>{fmtDur(award.ms)}</b> on {award.riff}.
              </>
            )}
            <button className="award-x" onClick={() => setAward(null)}>
              ×
            </button>
          </div>
        )}
      </div>

      <div className="now">
        <div className="now-top">
          <div className="now-name">{pat.name}</div>
          <div className="now-cat">{pat.cat}</div>
        </div>
        <div className="now-logged">
          {riffMs > 0 ? (
            <>
              <b>{fmtDur(riffMs)}</b> practised on this riff
            </>
          ) : (
            "Not practised yet — hit Practice to start the clock."
          )}
        </div>
        <p className="now-desc">{pat.desc}</p>

        <div className="gridwrap">
          <div
            className="grid"
            style={{ gridTemplateColumns: "72px 1fr" }}
          >
            {/* count row */}
            <div className="rlabel countlabel">Count</div>
            <div
              className="countrow"
              style={{ gridTemplateColumns: `repeat(${gridLen},1fr)` }}
            >
              {Array.from({ length: gridLen }).map((_, i) => (
                <div
                  key={i}
                  className={"ccell" + (i % pat.sub === 0 ? " cbeat" : "")}
                >
                  {countLabel(i, pat.sub)}
                </div>
              ))}
            </div>

            {/* lanes */}
            {LANES.map(([id, , label]) => (
              <Lane
                key={id}
                id={id}
                label={label}
                row={cells[id]}
                sub={pat.sub}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="kit">
        {KIT.map((d) => (
          <div
            key={d.id}
            className="pad"
            data-d={d.id}
            onPointerDown={(e) => {
              e.preventDefault();
              padHit(d.id);
            }}
          >
            <span className="disc" />
            <span className="lbl">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="transport">
        <button className="btn" onClick={toggle}>
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <button className="btn ghost" onClick={() => bankAndSwitch(idx - 1, true)}>
          ‹ Prev
        </button>
        <button className="btn ghost" onClick={() => bankAndSwitch(idx + 1, true)}>
          Next ›
        </button>
        <label className="swing">
          <input
            type="checkbox"
            checked={swing}
            onChange={(e) => setSwing(e.target.checked)}
          />{" "}
          Swing
        </label>
      </div>

      <div className="tempo-panel">
        <div className="tempo-head">
          <span className="tempo-k">Tempo</span>
          <span className="bpm">{tempo}</span>
          <span className="tempo-unit">BPM</span>
        </div>
        <div className="tempo-ctrl">
          <button className="tbtn" onClick={() => setTempo(tempo - 2)}>
            −
          </button>
          <input
            type="range"
            min="40"
            max="220"
            value={tempo}
            onChange={(e) => setTempo(+e.target.value)}
          />
          <button className="tbtn" onClick={() => setTempo(tempo + 2)}>
            +
          </button>
        </div>
        <div className="tempo-presets">
          {[60, 80, 100, 120, 140].map((t) => (
            <button key={t} className="tpreset" onClick={() => setTempo(t)}>
              {t}
            </button>
          ))}
          <button
            className="tpreset"
            id="tReset"
            onClick={() => setTempo(pat.bpm)}
          >
            ↺ Groove's own
          </button>
        </div>
      </div>

      <div className="logbox">
        <button className="logtoggle" onClick={() => setShowLog(!showLog)}>
          {showLog ? "▾" : "▸"} Practice log — {fmtDur(log.totalMs)} across{" "}
          {top.length} riff{top.length === 1 ? "" : "s"} · {log.sessions} session
          {log.sessions === 1 ? "" : "s"}
        </button>

        {showLog && (
          <div className="logbody">
            {top.length === 0 ? (
              <p className="logempty">
                Nothing logged yet. Pick a groove, hit <b>Practice</b>, and the
                clock runs until you hit <b>Stop</b>. Time from every riff adds
                into the same total.
              </p>
            ) : (
              <table className="logtable">
                <thead>
                  <tr>
                    <th>Riff</th>
                    <th>Time</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map(([name, ms]) => (
                    <tr key={name} className={name === pat.name ? "cur" : ""}>
                      <td>{name}</td>
                      <td className="num">{fmtDur(ms)}</td>
                      <td className="share">
                        <span
                          className="sharebar"
                          style={{ width: `${(ms / top[0][1]) * 100}%` }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h4 className="ladder-h">The ladder — 29 levels to 10,000 hours</h4>
            <div className="ladder">
              {THRESHOLDS.map((t, i) => {
                const done = log.totalMs / 60000 >= t;
                const cur = liveLvl.level === i + 1;
                return (
                  <div
                    key={t}
                    className={"rung" + (done ? " done" : "") + (cur ? " cur" : "")}
                  >
                    <span className="rung-n">{i + 1}</span>
                    <span className="rung-name">{NAMES[i]}</span>
                    <span className="rung-t">{fmtMins(t)}</span>
                  </div>
                );
              })}
            </div>

            <button className="resetbtn" onClick={clearAll}>
              Reset practice log
            </button>
          </div>
        )}
      </div>

      <p className="hint">
        Hit <b>Practice</b> to start logging time on the current riff — every
        riff adds into the same total, and that total is your level.{" "}
        Tap <b>Kick / Snare / Hi-Hat / Ride / Crash</b> to play along.{" "}
        <b>Prev / Next</b> (or ← →) walks the whole library. Slow any groove
        down with the tempo panel to learn it, then speed back up.
      </p>

      <div className="lib">
        {categories.map((cat) => (
          <div className="cat" key={cat}>
            <h3>{cat}</h3>
            <div className="chips">
              {GROOVES.map((p, i) =>
                p.cat === cat ? (
                  <button
                    key={i}
                    className={"chip" + (i === idx ? " active" : "")}
                    onClick={() => bankAndSwitch(i, true)}
                  >
                    {p.name}
                    {log.riffs[p.name] > 0 && (
                      <span className="chip-time">{fmtDur(log.riffs[p.name])}</span>
                    )}
                  </button>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Lane({ id, label, row, sub }) {
  return (
    <>
      <div className="rlabel">{label}</div>
      <div
        className={"grow lane-" + id}
        style={{ gridTemplateColumns: `repeat(${row.length},1fr)` }}
      >
        {row.map((ch, i) => {
          const on = ch !== "-" && ch !== " ";
          const cls =
            "cell" +
            (i % sub === 0 ? " beat" : "") +
            (on ? " on" : "") +
            (ch === "X" ? " accent" : "") +
            (ch === "g" ? " ghost" : "");
          return <div key={i} className={cls} data-step={i} />;
        })}
      </div>
    </>
  );
}
