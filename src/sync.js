// Optional GitHub Gist auto-sync.
//
// Stores the user's Personal Access Token (`gist` scope) and Gist ID only in
// this browser's localStorage — never in the repo. When connected, progress
// syncs automatically to a private Gist (`groove-library-practice.json`).

import { exportJson, importJson } from "./practice.js";

const SYNC_KEY = "groove-library.sync.v1";
const GIST_FILE = "groove-library-practice.json";
const GIST_DESC = "Groove Library practice log (auto-synced)";
const API = "https://api.github.com/gists";

export function loadSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return { token: "", gistId: "", lastSyncedAt: 0 };
    const p = JSON.parse(raw);
    return {
      token: typeof p.token === "string" ? p.token.trim() : "",
      gistId: typeof p.gistId === "string" ? p.gistId.trim() : "",
      lastSyncedAt: Number(p.lastSyncedAt) || 0,
    };
  } catch {
    return { token: "", gistId: "", lastSyncedAt: 0 };
  }
}

export function saveSyncConfig(cfg) {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore storage errors */
  }
}

export function clearSyncConfig() {
  try {
    localStorage.removeItem(SYNC_KEY);
  } catch {
    /* ignore */
  }
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function apiFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...headers(token), ...(options.headers || {}) },
  });
  if (!res.ok) {
    let msg = `GitHub API ${res.status}`;
    try {
      const err = await res.json();
      if (err?.message) msg = err.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

async function findOrCreateGist(token, localLog) {
  const list = await apiFetch(`${API}?per_page=100`, token);
  const existing = list.find((g) => g.files && g.files[GIST_FILE]);
  if (existing) {
    return { gistId: existing.id, gist: existing, created: false };
  }
  const created = await apiFetch(API, token, {
    method: "POST",
    body: JSON.stringify({
      description: GIST_DESC,
      public: false,
      files: { [GIST_FILE]: { content: exportJson(localLog) } },
    }),
  });
  return { gistId: created.id, gist: created, created: true };
}

function parseGistLog(gist) {
  const content = gist?.files?.[GIST_FILE]?.content;
  if (!content) return null;
  try {
    return importJson(content);
  } catch {
    return null;
  }
}

function logsMatch(a, b) {
  if (!a || !b) return false;
  return (
    a.totalMs === b.totalMs &&
    a.sessions === b.sessions &&
    Object.keys(a.riffs || {}).length === Object.keys(b.riffs || {}).length
  );
}

/**
 * Two-way sync with the user's private GitHub Gist.
 * - If remote has more total practice time, returns `{ status: "pulled", log: remote, gistId }`.
 * - Otherwise pushes local if different and returns `{ status: "synced", gistId }`.
 */
export async function syncWithGitHub(localLog) {
  const cfg = loadSyncConfig();
  if (!cfg.token) return { status: "disconnected" };

  let gistId = cfg.gistId;
  let gist = null;

  if (!gistId) {
    const res = await findOrCreateGist(cfg.token, localLog);
    gistId = res.gistId;
    gist = res.gist;
  } else {
    try {
      gist = await apiFetch(`${API}/${gistId}`, cfg.token);
    } catch (e) {
      // Gist may have been deleted — try finding or recreating it once.
      if (String(e.message).toLowerCase().includes("not found")) {
        const res = await findOrCreateGist(cfg.token, localLog);
        gistId = res.gistId;
        gist = res.gist;
      } else {
        throw e;
      }
    }
  }

  const remote = parseGistLog(gist);
  const now = Date.now();

  if (remote && remote.totalMs > localLog.totalMs) {
    saveSyncConfig({ token: cfg.token, gistId, lastSyncedAt: now });
    return { status: "pulled", log: remote, gistId, lastSyncedAt: now };
  }

  if (!logsMatch(localLog, remote)) {
    await apiFetch(`${API}/${gistId}`, cfg.token, {
      method: "PATCH",
      body: JSON.stringify({
        files: { [GIST_FILE]: { content: exportJson(localLog) } },
      }),
    });
  }

  saveSyncConfig({ token: cfg.token, gistId, lastSyncedAt: now });
  return { status: "synced", gistId, lastSyncedAt: now };
}
