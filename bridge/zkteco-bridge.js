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

// Save a fingerprint template to the central database (enrol once).
async function dbStoreTemplate(code, template) {
  await fetch(`${API}/api/access/enroll?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, template }),
  }).catch(() => {});
}
// Read all enrolled templates back from the central database.
async function dbTemplates() {
  const res = await fetch(`${API}/api/access/templates?key=${KEY}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()).members ?? [];
}

/**
 * Enrol-once sync through the CENTRAL DATABASE:
 *  1. read new enrolments (users + templates) from the reception terminal,
 *  2. upload each template to the Taleh GYM database (kept once, forever),
 *  3. push every database template to all door terminals.
 * So a finger is enrolled once, the database owns it, and any terminal can
 * be reset and re-synced without re-enrolling the member.
 */
async function syncEnrolments() {
  const src = connect(ENROLL);
  try {
    await src.createSocket();
    const users = (await src.getUsers())?.data ?? [];
    let templates = [];
    if (typeof src.getTemplates === "function") {
      try { templates = (await src.getTemplates())?.data ?? []; } catch {}
    }
    // 1-2. upload reception enrolments to the central DB
    for (const u of users) {
      const t = templates.find((x) => x.uid === u.uid);
      await dbStoreTemplate(u.userId, t ? JSON.stringify(t) : null);
    }
  } catch (e) {
    console.error("[sync] enroll terminal:", e.message);
  } finally { try { await src.disconnect(); } catch {} }

  // 3. push the central DB enrolments to every door terminal
  let central = [];
  try { central = await dbTemplates(); } catch (e) { console.error("[sync] db:", e.message); }
  for (const door of DOORS) {
    const dst = connect(door);
    try {
      await dst.createSocket();
      let uid = 1;
      for (const m of central) {
        await dst.setUser(uid++, m.member_code, m.name || m.member_code, "", 0, 0);
        if (m.template && typeof dst.setTemplate === "function") {
          try { await dst.setTemplate(JSON.parse(m.template)); } catch {}
        }
      }
      console.log(`[sync] DB → ${door.name}: ${central.length} members`);
    } catch (e) {
      console.error(`[sync] ${door.name}:`, e.message);
    } finally { try { await dst.disconnect(); } catch {} }
  }
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
