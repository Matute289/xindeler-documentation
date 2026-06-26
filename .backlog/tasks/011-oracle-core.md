# 011 — ORACLE core: intro + arquitectura + world-state

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 4

## Fuente
Los specs de ORACLE están en `Matute289/xindeler-design` (repo privado).
Antes de escribir estos docs, leer:
- `xindeler-design/systems/oracle/` (spec completo ~80 KB)

## oracle/intro.md
- Qué es ORACLE: el World Director autónomo
- Su rol en el juego: dirige eventos globales, narrativa, ecosistema
- Metáfora: el DM invisible del servidor
- Corre como extensión del `rtsim` subsystem, dentro del server process
- No es un microservicio — es un módulo Rust

## oracle/arquitectura.md
- Placement en rtsim: cómo se integra en el ECS tick
- Módulos: EventEngine, NarrativeLayer, EcosystemSim, LLMProposer
- Threading: LLMProposer corre en thread separado, resto en el tick principal
- Kill-switch y circuit breaker para auto-deshabilitarse si hay errores

## oracle/world-state.md
- WorldGraph: nodos de tipo Region, Settlement, FactionNode, ResourceNode
- Cómo ORACLE lee el estado del mundo
- Cómo escribe WorldFacts al contrato ORACLE↔AURORA
- Snapshot del estado vs estado en tiempo real
