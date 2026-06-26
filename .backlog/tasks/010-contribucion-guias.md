# 010 — Guías de contribución: agregar NPC, hechizo, item

**Estado:** `[ ]` Pendiente  
**Prioridad:** Media  
**Sprint:** 3

## contribucion/agregar-npc.md
Guía paso a paso para agregar un NPC nuevo:
1. Crear el archivo de entidad RON en `assets/common/npc/`
2. Registrar en el entity list
3. Asignarle comportamiento en rtsim (AURORA integration)
4. Definir su loot table si aplica
5. Testing: levantar el servidor y verificar spawn

## contribucion/agregar-hechizo.md
1. Definir `SpellDef` en `assets/common/abilities/`
2. Registrar en `compendium.ron`
3. Implementar `CharacterAbility` si tiene lógica custom en Rust
4. Agregar al skill tree de la clase correspondiente
5. Balance: energía, cooldown, daño/healing
6. Testing: equipar y usar en partida local

## contribucion/agregar-item.md
1. Crear el archivo RON del item en `assets/common/items/`
2. Agregar la receta si es crafteable (en recipe_book_manifest)
3. Agregar a loot tables si droppea de criaturas
4. Definir restricciones (clase/raza/nivel si aplica)
5. Asignar imagen/ícono
6. Testing: `/give` admin command para obtenerlo
