/**
 * Taleh GYM — ZKTeco bridge (Node.js) — ENROLL ONCE, TWO TERMINALS, ONE DATABASE
 * ------------------------------------------------------------------------------
 * Two ZKTeco terminals, one shared system:
 *   • ENROLL  — the registration desk terminal where Staff enrol a member's
 *               finger ONCE (device User ID = the member code, e.g. TG-2026-1007).
 *   • DOORS[] — the entrance terminal(s) that open the gym door.
 *
 * This bridge does two jobs:
 *   1. SYNC enrolment: it copies every user (and fingerprint template, where the
 *      firmware/library supports it) from the ENROLL terminal to each DOOR, so a
 *      finger registered once at reception also works at the door — no re-enrol.
 *   2. ACCESS: on each door scan it asks the central Taleh GYM API whether the
 *      member's monthly payment is current, and opens the door if so.
 *
 * Every terminal shares ONE central database (the Taleh GYM API / dashboard).
 *   npm install && npm start
 */

const ZKLib = require("node-zklib");

const API = process.env.API_BASE || "https://taleh-gym.vercel.app";
const KEY = process.env.ACCESS_API_KEY || "taleh-zkt-2026";
const SYNC_MS = Number(process.env.SYNC_MS || 2 * 60 * 1000);

// The registration-desk terminal (Staff enrol fingers here, ONCE)
const ENROLL = process.env.ZK_ENROLL
  ? JSON.parse(process.env.ZK_ENROLL)
  : { name: "Reception (enroll)", ip: "192.168.1.201", port: 4370 };

// The door terminal(s) that enrolments are pushed to and that open the gym
const DOORS = process.env.ZK_DOORS
  ? JSON.parse(process.env.ZK_DOORS)
  : [{ name: "Main Door", ip: "192.168.1.202", port: 4370 }];

function connect(d) { return new ZKLib(d.ip, d.port || 4370, 10000, 4000); }

async function decideScan(code, device) {
  const res = await fetch(`${API}/api/access/scan?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, device }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/**
 * Copy enrolments from the reception terminal to every door terminal so a
 * finger enrolled once is recognised everywhere. User records always sync;
 * fingerprint templates sync when the library/firmware exposes them.
 */
async function syncEnrolments() {
  const src = connect(ENROLL);
  try {
    await src.createSocket();
    const users = (await src.getUsers())?.data ?? [];
    // Pull templates if this firmware/library build supports it
    let templates = [];
    if (typeof src.getTemplates === "function") {
      try { templates = (await src.getTemplates())?.data ?? []; } catch {}
    }
    for (const door of DOORS) {
      const dst = connect(door);
      try {
        await dst.createSocket();
        for (const u of users) {
          await dst.setUser(u.uid, u.userId, u.name, u.password || "", u.role || 0, u.cardno || 0);
          const t = templates.find((x) => x.uid === u.uid);
          if (t && typeof dst.setTemplate === "function") {
            try { await dst.setTemplate(t); } catch {}
          }
        }
        console.log(`[sync] ${ENROLL.name} → ${door.name}: ${users.length} users`);
      } catch (e) {
        console.error(`[sync] ${door.name} failed:`, e.message);
      } finally { try { await dst.disconnect(); } catch {} }
    }
  } catch (e) {
    console.error("[sync] enroll terminal failed:", e.message);
  } finally { try { await src.disconnect(); } catch {} }
}

/** Watch a door terminal and open it for paid members in real time. */
async function watchDoor(door) {
  const zk = connect(door);
  await zk.createSocket();
  console.log(`[${door.name}] watching (${door.ip})`);
  await zk.getRealTimeLogs(async (log) => {
    const code = String(log.deviceUserId ?? log.userId ?? "").trim();
    if (!code) return;
    try {
      const d = await decideScan(code, door.name);
      if (d.open) {
        console.log(`[${door.name}] ✅ OPEN  ${d.name} (${d.days_left} days left)`);
        if (typeof zk.unlock === "function") await zk.unlock(3);
      } else {
        console.log(`[${door.name}] ⛔ DENY  ${d.name || code} — ${d.reason}`);
      }
    } catch (err) { console.error(`[${door.name}] scan error:`, err.message); }
  });
  return zk;
}

async function main() {
  await syncEnrolments();                 // enroll-once → all doors
  const zks = [];
  for (const door of DOORS) {
    try { zks.push(await watchDoor(door)); }
    catch (e) { console.error(`[${door.name}] connect failed:`, e.message); }
  }
  setInterval(syncEnrolments, SYNC_MS);    // keep new enrolments in sync

  process.on("SIGINT", async () => {
    for (const zk of zks) { try { await zk.disconnect(); } catch {} }
    process.exit(0);
  });
}

main().catch((err) => { console.error("[bridge] fatal:", err.message); process.exit(1); });
