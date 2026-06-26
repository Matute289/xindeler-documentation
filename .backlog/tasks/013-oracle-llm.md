# 013 — ORACLE: llm-integration + admin + anti-chaos

**Estado:** `[ ]` Pendiente  
**Prioridad:** Media  
**Sprint:** 4

## oracle/llm-integration.md
- HTTP trait: interfaz abstracta sobre el LLM (permite cambiar de proveedor)
- llama.cpp local vs API remota: cómo elegir según el VPS
- LLMProposer thread: corre async, propone eventos, world director los valida o rechaza
- Fallback: si LLM falla, el sistema funciona con solo las reglas hardcoded

## oracle/admin.md
Admin commands disponibles via chat del servidor:
- `/oracle status` — estado actual, eventos activos, carga LLM
- `/oracle pause` — pausa ORACLE (sin desactivar el server)
- `/oracle resume` — reactiva
- `/oracle event propose <tipo> <region>` — forzar un evento (admin use)
- `/oracle log tail` — últimos eventos del JSONL chronicle

## oracle/anti-chaos.md
- Circuit breaker: si ORACLE produce > N errores en M minutos, se auto-deshabilita
- Auto-rollback: si un evento causa > X player complaints (métrica), se revierte
- Canary metrics: qué métricas monitorea para detectar problemas
- Kill-switch: flag en el config que desactiva completamente ORACLE
