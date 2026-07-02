---
sidebar_position: 1
---

# Game protocol

How Xindeler's client and server communicate.

---

## Not REST, not WebSocket

Game communication uses a **proprietary binary protocol over QUIC** — not HTTP, not REST, not WebSocket. Trying to connect to the game port with an HTTP client won't work.

The project's only REST API is FastAPI on port 8010, which only serves the waitlist and the contributor form — it has no access to game state.

---

## QUIC and Quinn

The transport protocol is [QUIC (RFC 9000)](https://www.rfc-editor.org/rfc/rfc9000), implemented in Rust with the [Quinn](https://github.com/quinn-rs/quinn) crate.

QUIC runs over UDP and offers:
- **Stream multiplexing** — multiple logical channels over a single connection without head-of-line blocking
- **Fast reconnection** — 0-RTT handshake for reconnections
- **Built-in TLS 1.3** — mandatory transport encryption
- **Better behavior on lossy networks** — unlike TCP, losing a packet on one stream doesn't block the others

The server listens on port **14004** by default.

---

## Message structure

Messages are serialized with `bincode` over the QUIC streams. There are two main stream types:

### Reliable messages (QUIC streams)

For important events that must arrive in order: inventory, chat, commands, login, game state changes. These use guaranteed QUIC streams.

```rust
// Client-to-server messages (simplified)
enum ClientMsg {
    Register { username, password },
    ChatMsg { msg },
    ControllerInputs { inputs },
    SwapEquipment { slots },
    DropItem { slot },
    // ...
}

// Server-to-client messages
enum ServerMsg {
    StateAnswer { answer },
    Notification { notification },
    ChatMsg { msg },
    CreateEntity { entity, components },
    DeleteEntity { entity },
    UpdateComponent { entity, component },
    // ...
}
```

### Position updates (QUIC datagrams)

For frequent entity position and orientation updates, which can be safely dropped if a newer one arrives. These use unreliable QUIC datagrams for lower latency.

---

## Entity synchronization

The server doesn't send the state of every entity in the world to every client. It only sends the entities within the player's **presence range** (a radius of chunks around their position).

Synchronization protocol:
1. An entity enters the range → the server sends `CreateEntity` with all its components
2. A component changes → the server sends `UpdateComponent` with the diff
3. The entity leaves the range → the server sends `DeleteEntity`

The components that get synchronized are only the ones the client needs to render and simulate locally: `Pos`, `Vel`, `Ori`, `Body`, `Health`, `CharacterState`, etc. Internal server components (AI, an NPC's full inventory) are not synchronized.

---

## Login and authentication

On a local server (development), any username/password combination works — the server creates the account if it doesn't exist.

In production, the server can be configured to use external authentication. The flow is:

```
Client → Register { username, password }
Server → StateAnswer::Accepted / Rejected
Client → connected, receives the initial world state
```

---

## Implementation

If you need to connect to the server from outside the official client (debug tools, test bots), the workspace's `client` crate exposes the connection API:

```rust
use client::Client;

let client = Client::new(
    ConnectionArgs::Tcp { hostname: "localhost", port: 14004 },
    None,  // shared tokio runtime
).await?;
```

The `common_net` crate defines all message types shared between client and server.
