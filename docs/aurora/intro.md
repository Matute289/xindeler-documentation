---
sidebar_position: 1
---

# AURORA — IA de NPCs

AURORA es el sistema de inteligencia artificial que da vida a los NPCs de Xindeler. Donde [ORACLE](/oracle/intro) dirige el mundo a nivel macro, AURORA opera a nivel micro: cada NPC individual tiene su propia mente, memoria, y red de relaciones.

---

## El problema que resuelve

Los NPCs de la mayoría de los juegos son máquinas de estado simples: si el jugador está cerca, decir frase. Si el jugador ataca, contraatacar. No recuerdan nada, no tienen opiniones propias, no cambian.

AURORA apunta a NPCs que parezcan habitantes reales de un mundo: con historia personal, lealtades, miedos, y la capacidad de actuar de acuerdo a sus valores aunque no haya ningún jugador mirando.

---

## La mente de un NPC

Cada NPC con IA AURORA tiene un struct `Mind` que persiste en `rtsim` entre sesiones:

### Valores y personalidad

Cada NPC tiene un conjunto de valores que determinan sus prioridades: lealtad a la facción, amor al dinero, miedo a la oscuridad, apego a su hogar. Estos valores guían las decisiones cuando hay conflicto de objetivos.

### Memoria episódica

Los NPCs recuerdan eventos significativos: una conversación con un jugador, haber sido robados, haber visto una batalla. La memoria tiene **salience** — los eventos más relevantes o recientes pesan más. Los recuerdos viejos e irrelevantes se desvanecen con el tiempo.

### Memoria semántica

Conocimiento general del mundo que el NPC fue acumulando: "los Banidos controlan el camino norte", "hay una cura para la plaga en las ruinas del este". Este conocimiento puede ser correcto o desactualizado según cuándo lo aprendió.

### Red social

Los NPCs tienen relaciones con otros NPCs y jugadores: confianza, deuda, amistad, enemistad. Un comerciante que fue estafado por un jugador lo recordará y puede alertar a otros de su gremio.

---

## Cómo toma decisiones un NPC

AURORA usa **GOAP (Goal-Oriented Action Planning)** para decidir las acciones de cada NPC. El proceso es:

1. Evaluar el estado actual del mundo y la propia mente
2. Consultar los WorldFacts de ORACLE para contexto global
3. Generar un plan de acciones que satisfaga los objetivos actuales
4. Ejecutar la siguiente acción del plan

Esto permite comportamientos emergentes: un NPC que quiere sobrevivir y ve que su facción está perdiendo la guerra puede desertar, esconderse, o cambiar de bando — sin que ningún diseñador lo programara explícitamente.

---

## Simulación de vida

Los NPCs de AURORA tienen un ciclo de vida completo:

- **Nacimiento y herencia** — los NPCs pueden nacer de padres existentes, heredando rasgos y relaciones
- **Envejecimiento** — tienen una edad y eventualmente mueren de vejez
- **Familia** — pueden tener cónyuge, hijos, hermanos con relaciones reales
- **Carrera** — cambian de rol según las oportunidades (un granjero puede convertirse en soldado si estalla una guerra)

---

## Diálogo generativo

AURORA tiene dos modos de diálogo:

### Tier 1: Diálogo baked

Para NPCs sin importancia narrativa: frases predefinidas que reflejan su rol, estado emocional y memoria reciente. No requiere LLM.

### Tier 2: Diálogo LLM en vivo

Para NPCs con rol narrativo importante (líderes de facción, personajes clave de arcos ORACLE): generación de diálogo en tiempo real usando un modelo de lenguaje local (llama.cpp). El LLM recibe como contexto la mente del NPC, sus recuerdos relevantes, y el estado actual del mundo.

El resultado puede ser sintetizado a voz con TTS para NPCs que lo justifiquen.

Este módulo es completamente opcional — el juego funciona sin LLM.

---

## Cómo se integra con ORACLE

AURORA lee los **WorldFacts** que escribe ORACLE para que los NPCs sean conscientes del estado macro del mundo. Un guardia sabe que su ciudad fue conquistada. Un comerciante sabe que la ruta al norte es peligrosa. Una sacerdotisa sabe que el arco narrativo del culto está en su fase final.

AURORA no escribe WorldFacts — solo los lee. El flujo de información es unidireccional: ORACLE → WorldFacts → AURORA.

---

## Control de admin

```
/aurora npc <id> status         — ver la mente actual de un NPC
/aurora npc <id> memory         — ver los recuerdos del NPC
/aurora npc <id> relationships  — ver su red social
/aurora npc <id> force_action   — forzar una acción manualmente
```

Ver [Contratos ORACLE↔AURORA](/aurora/contratos) para el detalle técnico de la interfaz entre los dos sistemas.
