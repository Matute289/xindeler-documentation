---
sidebar_position: 1
slug: /
---

# Xindeler Docs

**Xindeler** is an open-source fantasy MMORPG built in Rust. This is the technical documentation — for developers, contributors, and designers who want to understand or contribute to the project.

---

## What's in here?

| Section | Who it's for |
|---------|-----------|
| [**Project**](/proyecto/intro) | Architecture, tech stack, local setup |
| [**Contribution**](/contribucion/como-empezar) | How to make your first PR, guides for adding NPCs, items, and spells |
| [**Game systems**](/sistemas/combate) | Combat, magic, classes, crafting |
| [**ORACLE**](/oracle/intro) | The world director — procedural narrative and ecosystem simulation |
| [**AURORA**](/aurora/intro) | NPC AI — minds with memory, social relationships, and generative dialogue |
| [**Reference**](/referencia/glosario) | Glossary, ECS components, asset formats |

---

## Quick start

Want to contribute? The shortest path:

```bash
git clone https://github.com/Matute289/xindeler
cd xindeler
cargo build
cargo run --bin xindeler-server   # in one terminal
cargo run --bin voxygen            # in another terminal
```

Full guide: [Local Setup](/proyecto/instalacion-local)

---

## The stack in one line

**Rust nightly** · ECS with `specs` · QUIC via Quinn · wgpu for rendering · RON for assets · MessagePack for persistence

---

## What makes Xindeler different

### ORACLE — World director

There are no content designers manually scripting events. ORACLE is an AI system that runs inside the server and directs the world: it generates narrative arcs, controls the creature ecosystem, and manages weather and faction relationships. Every Xindeler server develops its own history.

### AURORA — NPCs with minds

Xindeler's NPCs don't follow fixed scripts. Each one has a mind with its own values, fears, episodic memory of its interactions, and a network of social relationships. A merchant remembers that you robbed them. A guard has loyalties. An old woman tells you something she saw weeks ago. With the optional LLM module, dialogue is generative.

---

## Project repos

| Repo | Description |
|------|-------------|
| [`Matute289/xindeler`](https://github.com/Matute289/xindeler) | Game engine |
| [`Matute289/xindeler-documentation`](https://github.com/Matute289/xindeler-documentation) | This site |
| [`Matute289/xindeler-wiki`](https://github.com/Matute289/xindeler-wiki) | Player wiki |

---

## Community

- **Website** — [xindeler.com](https://xindeler.com)
- **Discord** — [discord.gg/xindeler](https://discord.gg/xindeler)
- **Player wiki** — [wiki.xindeler.com](https://wiki.xindeler.com)
