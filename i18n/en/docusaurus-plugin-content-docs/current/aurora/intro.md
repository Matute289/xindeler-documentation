---
sidebar_position: 1
---

# AURORA — NPC AI

AURORA is the artificial intelligence system that brings Xindeler's NPCs to life. Where [ORACLE](/oracle/intro) directs the world at the macro level, AURORA operates at the micro level: every individual NPC has its own mind, memory, and network of relationships.

---

## The problem it solves

NPCs in most games are simple state machines: if the player is nearby, say a line. If the player attacks, counterattack. They remember nothing, have no opinions of their own, and never change.

AURORA aims for NPCs that feel like real inhabitants of a world: with a personal history, loyalties, fears, and the ability to act according to their own values even when no player is watching.

---

## An NPC's mind

Every NPC with AURORA AI has a `Mind` struct that persists in `rtsim` between sessions:

### Values and personality

Every NPC has a set of values that determine their priorities: loyalty to their faction, love of money, fear of the dark, attachment to their home. These values guide decisions when goals conflict.

### Episodic memory

NPCs remember significant events: a conversation with a player, having been robbed, having witnessed a battle. Memory has **salience** — more relevant or recent events carry more weight. Old, irrelevant memories fade over time.

### Semantic memory

General knowledge about the world that the NPC has accumulated over time: "the Bandits control the north road," "there's a cure for the plague in the eastern ruins." This knowledge can be correct or outdated depending on when it was learned.

### Social network

NPCs have relationships with other NPCs and players: trust, debt, friendship, enmity. A merchant who was scammed by a player will remember it and may alert others in their guild.

---

## How an NPC makes decisions

AURORA uses **GOAP (Goal-Oriented Action Planning)** to decide each NPC's actions. The process is:

1. Evaluate the current state of the world and of the NPC's own mind
2. Consult ORACLE's WorldFacts for global context
3. Generate a plan of actions that satisfies the current goals
4. Execute the next action in the plan

This enables emergent behavior: an NPC who wants to survive and sees that their faction is losing the war might desert, hide, or switch sides — without any designer explicitly scripting it.

---

## Life simulation

AURORA's NPCs have a complete life cycle:

- **Birth and heritage** — NPCs can be born from existing parents, inheriting traits and relationships
- **Aging** — they have an age and eventually die of old age
- **Family** — they can have a spouse, children, siblings, with real relationships
- **Career** — they change roles based on opportunity (a farmer can become a soldier if war breaks out)

---

## Generative dialogue

AURORA has two dialogue modes:

### Tier 1: Baked dialogue

For NPCs without narrative importance: predefined lines that reflect their role, emotional state, and recent memory. Doesn't require an LLM.

### Tier 2: Live LLM dialogue

For NPCs with an important narrative role (faction leaders, key characters in ORACLE arcs): real-time dialogue generation using a local language model (llama.cpp). The LLM receives the NPC's mind, their relevant memories, and the current world state as context.

The result can be synthesized to speech with TTS for NPCs that warrant it.

This module is entirely optional — the game works without an LLM.

---

## How it integrates with ORACLE

AURORA reads the **WorldFacts** that ORACLE writes so that NPCs are aware of the world's macro state. A guard knows their city was conquered. A merchant knows the northern route is dangerous. A priestess knows the cult's narrative arc is in its final phase.

AURORA doesn't write WorldFacts — it only reads them. Information flows in one direction: ORACLE → WorldFacts → AURORA.

---

## Admin control

```
/aurora npc <id> status         — view an NPC's current mind
/aurora npc <id> memory         — view the NPC's memories
/aurora npc <id> relationships  — view its social network
/aurora npc <id> force_action   — force an action manually
```

See [ORACLE↔AURORA Contracts](/aurora/contratos) for the technical detail of the interface between the two systems.
