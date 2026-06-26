# 015 — AURORA: social-graph + life-simulation + economia

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 5

## aurora/social-graph.md
- EdgeKind enum: Kinship, Friendship, Romance, Rivalry, Debt, Mentor, Enemy
- Ego-centric queries: dado un NPC, "¿quién le debe un favor?", "¿quién es su enemigo?"
- Cómo se crean/modifican relaciones: eventos, interacciones, tiempo
- Grafo dirigido (asimétrico): A puede amar a B, B puede ser indiferente a A

## aurora/life-simulation.md
- Birth: NPCs nacen en sitios con demografía activa
- Aging: los NPCs envejecen, cambian de rol (niño → adulto → anciano)
- Death: causas (vejez, combate, hambre, enfermedad)
- Family formation: el grafo social genera familias
- Heritage: hijos heredan assets, relaciones, deudas

## aurora/economia.md
- SiteEconomy: cada settlement tiene oferta/demanda de bienes
- price_mult dinámico: el precio sube cuando hay escasez, baja con abundancia
- Merchant routes: NPCs mercaderes siguen rutas calculadas por precio diferencial
- Cómo ORACLE puede disrumpir una ruta (evento de bandoleros, guerra, etc.)
