/**
 * Taleh GYM — ZKTeco door bridge (Node.js) — MULTI-DEVICE
 * -------------------------------------------------------
 * Connects one OR MORE ZKTeco fingerprint terminals (e.g. two gym doors)
 * to the Taleh GYM access-control API. Every terminal shares the same
 * member database and payment rules — the decision is central.
 *
 * Configure the devices below (or via the ZK_DEVICES env var as JSON),
 * then: npm install && npm start
 */

const ZKLib = require("node-zklib");

const API = process.env.API_BASE || "https://taleh-gym.vercel.app";
const KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";
const SYNC_MS = Number(process.env.SYNC_MS || 5 * 60 * 1000);

// Add as many terminals as you have. name = which door/area it guards.
const DEVICES = process.env.ZK_DEVICES
  ? JSON.parse(process.env.ZK_DEVICES)
  : [
      { name: "Main Door", ip: "192.168.1.201", port: 4370 },
      { name: "Gym Floor", ip: "192.168.1.202", port: 4370 },
    ];

async function decideScan(code, device) {
  const res = await fetch(`${API}/api/access/scan?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, device }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchAccessList() {
  const res = await fetch(`${API}/api/access/list?key=${KEY}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** Connect one terminal and watch it in real time. */
async function startDevice(dev) {
  const zk = new ZKLib(dev.ip, dev.port || 4370, 10000, 4000);
  await zk.createSocket();
  console.log(`[${dev.name}] connected (${dev.ip})`);

  await zk.getRealTimeLogs(async (log) => {
    const code = String(log.deviceUserId ?? log.userId ?? "").trim();
    if (!code) return;
    try {
      const d = await decideScan(code, dev.name);
      if (d.open) {
        console.log(`[${dev.name}] ✅ OPEN  ${d.name} (${d.days_left} days left)`);
        if (typeof zk.unlock === "function") await zk.unlock(3);
      } else {
        console.log(`[${dev.name}] ⛔ DENY  ${d.name || code} — ${d.reason}`);
      }
    } catch (err) {
      console.error(`[${dev.name}] scan error:`, err.message);
    }
  });

  return zk;
}

async function main() {
  const zks = [];
  for (const dev of DEVICES) {
    try {
      zks.push(await startDevice(dev));
    } catch (err) {
      console.error(`[${dev.name}] connect failed:`, err.message);
    }
  }

  // Shared sync so every terminal enforces access offline too
  async function sync() {
    try {
      const data = await fetchAccessList();
      console.log(`[sync] ${data.allowed.length}/${data.count} members allowed`);
      // Enable allowed / disable the rest on EACH device (adjust per firmware)
      // for (const zk of zks) for (const m of data.members) { ... }
    } catch (err) {
      console.error("[sync] error:", err.message);
    }
  }
  await sync();
  setInterval(sync, SYNC_MS);

  process.on("SIGINT", async () => {
    console.log("\n[bridge] shutting down…");
    for (const zk of zks) { try { await zk.disconnect(); } catch {} }
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[bridge] fatal:", err.message);
  process.exit(1);
});
