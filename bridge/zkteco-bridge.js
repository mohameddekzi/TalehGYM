/**
 * Taleh GYM — ZKTeco fingerprint door bridge (Node.js)
 * -----------------------------------------------------
 * Runs on a small PC / Raspberry Pi on the same LAN as the ZKTeco terminal.
 * It does two jobs:
 *   1. Real-time: on each fingerprint scan it asks the Taleh GYM API whether
 *      the member's monthly subscription is paid, and opens the door if so.
 *   2. Sync: every few minutes it pulls the allowed-member list and
 *      enables/disables users on the device so the terminal enforces access
 *      even when offline.
 *
 * Configure with env vars, then: npm install && npm start
 */

const ZKLib = require("node-zklib");

const CONFIG = {
  deviceIp: process.env.ZK_IP || "192.168.1.201",
  devicePort: Number(process.env.ZK_PORT || 4370),
  apiBase: process.env.API_BASE || "https://taleh-gym.vercel.app",
  apiKey: process.env.ACCESS_API_KEY || "taleh-zkt-2026",
  syncMs: Number(process.env.SYNC_MS || 5 * 60 * 1000),
};

/** Ask the API to decide (and log a check-in) for one member code. */
async function decideScan(code) {
  const res = await fetch(`${CONFIG.apiBase}/api/access/scan?key=${CONFIG.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** Pull the full allowed/blocked list for device sync. */
async function fetchAccessList() {
  const res = await fetch(`${CONFIG.apiBase}/api/access/list?key=${CONFIG.apiKey}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function main() {
  const zk = new ZKLib(CONFIG.deviceIp, CONFIG.devicePort, 10000, 4000);
  await zk.createSocket();
  console.log(`[bridge] connected to ZKTeco ${CONFIG.deviceIp}:${CONFIG.devicePort}`);

  // ── 1. Real-time scans ─────────────────────────────────────────────
  await zk.getRealTimeLogs(async (log) => {
    // The device user id must be enrolled as the member code (e.g. TG-2026-1001)
    const code = String(log.deviceUserId ?? log.userId ?? "").trim();
    if (!code) return;
    try {
      const d = await decideScan(code);
      if (d.open) {
        console.log(`[bridge] ✅ OPEN  ${d.name} (${code}) — ${d.days_left} day(s) left`);
        await openDoor(zk);
      } else {
        console.log(`[bridge] ⛔ DENY  ${d.name || code} — ${d.reason}`);
      }
    } catch (err) {
      console.error("[bridge] scan error:", err.message);
    }
  });

  // ── 2. Periodic sync (enable paid, disable unpaid) ─────────────────
  async function sync() {
    try {
      const data = await fetchAccessList();
      const allowed = new Set(data.allowed);
      console.log(`[bridge] sync: ${allowed.size}/${data.count} members allowed`);
      // Enable allowed users and disable the rest so the terminal enforces
      // access offline. setUser signature varies by firmware — adjust as needed.
      for (const m of data.members) {
        // await zk.setUser(uid, m.member_code, m.name, "", m.allowed ? 0 : 14 /*disabled*/, 0);
      }
    } catch (err) {
      console.error("[bridge] sync error:", err.message);
    }
  }
  await sync();
  setInterval(sync, CONFIG.syncMs);

  process.on("SIGINT", async () => {
    console.log("\n[bridge] shutting down…");
    try { await zk.disconnect(); } catch {}
    process.exit(0);
  });
}

/**
 * Open the physical door. Many ZKTeco access terminals unlock their built-in
 * relay automatically for an enabled user; if yours is controlled by the
 * bridge, trigger the relay here (device command or a GPIO pin).
 */
async function openDoor(zk) {
  try {
    if (typeof zk.unlock === "function") {
      await zk.unlock(3); // open for 3 seconds
    }
    // Or drive a relay via GPIO on a Raspberry Pi, e.g. with the `onoff` pkg.
  } catch (err) {
    console.error("[bridge] openDoor error:", err.message);
  }
}

main().catch((err) => {
  console.error("[bridge] fatal:", err.message);
  process.exit(1);
});
