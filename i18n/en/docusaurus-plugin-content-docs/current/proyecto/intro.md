---
sidebar_position: 1
---

# Project Introduction

**Xindeler** is an open-source voxel MMORPG written in Rust, built on an engine derived from [Veloren](https://veloren.net/). This section covers the project from an architecture/infrastructure angle — how the whole system is put together, what technologies make it up, how to run it locally, and how the codebase is organized.

If you're looking for **game systems** documentation (classes, magic, combat, items), that lives under [Game Systems](/sistemas/combate). This Project section is more about "how it's built" than "how it's played."

## Where to Start

- [Architecture](/proyecto/arquitectura) — system overview: client, server, ORACLE/AURORA, and the separate web API.
- [Technologies](/proyecto/tecnologias) — the full technical stack, crate by crate.
- [Local Installation](/proyecto/instalacion-local) — how to clone and run the project for development.
- [File Structure](/proyecto/estructura-de-archivos) — how the repository is organized.
- [Persistence](/proyecto/persistencia) — what gets saved, where, and in what format.

## Client vs. Server vs. Web API

Three components run independently:

1. **The client** (`voxygen`) — the game that runs on the player's machine.
2. **The server** (`xindeler-server`) — a monolithic Rust process that runs the entire world simulation, including ORACLE and AURORA.
3. **The web API** (FastAPI, Python) — a completely separate process that serves the landing page's waitlist and contributor form. It shares no state or database with the game.

Details on each live in [Architecture](/proyecto/arquitectura).
