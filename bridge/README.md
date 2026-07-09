# Taleh GYM — ZKTeco Door Bridge (Node.js)

Connects a ZKTeco fingerprint terminal to the Taleh GYM access-control API so
the door only opens for members whose **monthly subscription is paid**.

## How it works
1. A member scans their fingerprint at the door.
2. The bridge sends the member code to `POST /api/access/scan`.
3. The API checks the member's status + latest monthly payment and replies
   `{ open: true|false }`. If `true`, the bridge opens the door and a
   fingerprint check-in is logged automatically.
4. Every few minutes the bridge also syncs the allowed list to the device so
   it can enforce access even if the internet drops.

## Requirements
- Node.js 18+ on a PC / Raspberry Pi on the **same LAN** as the terminal.
- Members enrolled on the device with their **member code** (e.g. `TG-2026-1001`)
  as the device user id.

## Setup
```bash
cd bridge
npm install

# configure
export ZK_IP=192.168.1.201        # terminal IP
export ZK_PORT=4370
export API_BASE=https://taleh-gym.vercel.app
export ACCESS_API_KEY=taleh-zkt-2026

npm start
```

## API endpoints used
| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/access/scan` | Real-time door decision + check-in log |
| GET | `/api/access/check?code=` | Single member decision |
| GET | `/api/access/list` | Full allowed/blocked list for device sync |

Auth via `?key=` or the `x-api-key` header.

> Door-relay control and `setUser` enable/disable calls vary by device model
> and firmware — adjust `openDoor()` and the sync loop in `zkteco-bridge.js`
> to match your terminal.
