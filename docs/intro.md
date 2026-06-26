---
sidebar_position: 1
slug: /
---

# Xindeler Docs

**Xindeler** es un MMORPG de fantasía open source construido en Rust. Esta es la documentación técnica — para developers, contributors, y diseñadores que quieren entender o contribuir al proyecto.

---

## ¿Qué encontrás acá?

| Sección | Para quién |
|---------|-----------|
| [**Proyecto**](/proyecto/intro) | Arquitectura, stack tecnológico, instalación local |
| [**Contribución**](/contribucion/como-empezar) | Cómo hacer tu primer PR, guías para agregar NPCs, ítems y hechizos |
| [**Sistemas de juego**](/sistemas/combate) | Combate, magia, clases, crafting |
| [**ORACLE**](/oracle/intro) | El director del mundo — narrativa procedural y simulación del ecosistema |
| [**AURORA**](/aurora/intro) | IA de NPCs — mentes con memoria, relaciones sociales y diálogo generativo |
| [**Referencia**](/referencia/glosario) | Glosario, componentes ECS, formatos de assets |

---

## Empezar rápido

¿Querés contribuir? El camino más corto:

```bash
git clone https://github.com/Matute289/xindeler
cd xindeler
cargo build
cargo run --bin xindeler-server   # en una terminal
cargo run --bin voxygen            # en otra terminal
```

Guía completa: [Instalación local](/proyecto/instalacion-local)

---

## El stack en una línea

**Rust nightly** · ECS con `specs` · QUIC con Quinn · wgpu para renderizado · RON para assets · MessagePack para persistencia

---

## Lo que hace a Xindeler diferente

### ORACLE — Director del mundo

No hay diseñadores de contenido haciendo eventos manualmente. ORACLE es un sistema de IA que corre dentro del servidor y dirige el mundo: genera arcos narrativos, controla el ecosistema de criaturas, gestiona el clima y las relaciones entre facciones. Cada servidor de Xindeler tiene una historia propia.

### AURORA — NPCs con mente

Los NPCs de Xindeler no siguen scripts fijos. Cada uno tiene una mente con valores propios, miedos, memoria episódica de sus interacciones, y una red de relaciones sociales. Un comerciante recuerda que lo robaste. Un guardia tiene lealtades. Una anciana te cuenta algo que vio hace semanas. Con el módulo LLM opcional, el diálogo es generativo.

---

## Repos del proyecto

| Repo | Descripción |
|------|-------------|
| [`Matute289/xindeler`](https://github.com/Matute289/xindeler) | Engine del juego |
| [`Matute289/xindeler-documentation`](https://github.com/Matute289/xindeler-documentation) | Este sitio |
| [`Matute289/xindeler-wiki`](https://github.com/Matute289/xindeler-wiki) | Wiki para jugadores |

---

## Comunidad

- **Discord** — [discord.gg/xindeler](https://discord.gg/xindeler)
- **Wiki de jugadores** — [wiki.xindeler.greenmountain.dev](https://wiki.xindeler.greenmountain.dev)
