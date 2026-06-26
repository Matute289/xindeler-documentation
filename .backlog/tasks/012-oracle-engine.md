# 012 — ORACLE: event-engine + narrative + ecosystem

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 4

## oracle/event-engine.md
- Lifecycle de un evento: Proposed → Approved → Active → Resolved
- Clases de eventos: war, trade_route_disruption, monster_surge, natural_disaster, political_shift
- Pacing: límite de eventos simultáneos por región/mundo
- Anti-chaos: no dos eventos de guerra simultáneos en la misma región
- Cómo se proponen eventos (LLM proposer vs reglas hardcoded)

## oracle/narrative.md
- Arc templates: conflict, exploration, tragedy, triumph
- LLM layer: genera flavor text, NPC dialogue hints, event descriptions
- Canon validation: el LLM no puede inventar lore que contradiga xindeler-design
- Integración con AURORA: eventos ORACLE disparan reacciones en NPCs via WorldFacts

## oracle/ecosystem.md
- Monster population simulation: Lotka-Volterra equations adaptadas
- Population drift: razones ambientales, eventos
- Variantes de criaturas: regional adaptation
- Spawn rules: density caps, region affinity
