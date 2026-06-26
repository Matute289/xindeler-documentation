# 016 — AURORA: quest-generation + contratos

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 5

## aurora/quest-generation.md
- Need detection: AURORA detecta "necesidades" en NPCs (deuda, amenaza, objetivo bloqueado)
- Quest templates: fetch, escort, eliminate, negotiate, deliver, investigate
- Anti-exploit: misma quest no se puede completar infinitamente; cooldowns; unicidad
- Tier system: quests de NPCs comunes vs. quests de personajes importantes
- Narrativa: el flavor text de la quest viene del LLM tier 2 (o baked si LLM no disponible)

## aurora/contratos.md
El contrato ORACLE↔AURORA:
- **Observation queue**: ORACLE publica WorldFacts, AURORA los consume
- **WorldFact es read-only para AURORA**: AURORA no puede modificar WorldFacts
- WorldFact enum: tipos de facts que ORACLE puede publicar
- Desacoplamiento: si ORACLE está off, AURORA sigue funcionando (sin eventos globales)
- Ejemplo de flujo: `OracleFact::WarDeclared { attacker, defender }` → AURORA actualiza mood de NPCs en ambas facciones
