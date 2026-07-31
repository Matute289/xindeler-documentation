---
sidebar_position: 2
---

# FastAPI Web

A standalone Python process (`/srv/xindeler/waitlist-api/main.py`, port 8010) exposes a minimal REST API for the landing page and the rest of the public sites. It runs as a systemd service (`xindeler-waitlist.service`) and **shares no database with the game** — it has no access to the game server's state or the Xindeler protocol.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/waitlist/count` | Number of entries on the waitlist |
| `POST /api/waitlist` | Registers an email on the waitlist |
| `POST /api/contribute` | Contributor form submission |
| `GET /api/status` | Game server status (online/offline), cached 30s |

## `POST /api/waitlist` behavior

- Saves the entry to a CSV, rate-limited at the nginx layer.
- Sends an HTML auto-reply email to the person who signed up.
- If the email matches an existing contributor, also fires an immediate notification to the owner.
- **Silent deduplication:** if the email is already in the CSV, the response is 200 without saving again or resending the email — this avoids spamming from client-side retries without revealing whether an email is already registered.

## `POST /api/contribute` behavior

- Saves the entry to a separate CSV (`contributors.csv`).
- Sends an acknowledgment email to the contributor.
- Fires an immediate notification to the owner.

## `GET /api/status` behavior

Checks whether the game server (port 14004, Xindeler protocol over QUIC — see [Architecture](/proyecto/arquitectura)) is accepting connections. The response is cached for 30 seconds so the landing page doesn't hammer the game port on every request.

## Persistence and credentials

- Both CSVs (`waitlist.csv`, `contributors.csv`) live outside the web root, with restricted permissions (chmod 600).
- SMTP credentials for sending emails live in a separate environment file (chmod 600), never in the repo.
- There's no relational database — all of this API's state is plain CSV.

## Rate limiting

nginx applies rate limiting at the proxy layer (a dedicated zone, ~1 request/minute per IP) before the request ever reaches the FastAPI process — abuse protection lives in the infrastructure layer, not in the Python code.
