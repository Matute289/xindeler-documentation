---
sidebar_position: 1
---

# ORACLE — Director del mundo

ORACLE es el sistema de inteligencia artificial que dirige el mundo de Xindeler a nivel macro. No controla NPCs individuales — eso es trabajo de [AURORA](/aurora/intro). ORACLE controla el mundo mismo: qué eventos ocurren, cómo evolucionan las facciones, qué arcos narrativos se desarrollan, cómo se comporta el ecosistema de criaturas.

---

## El problema que resuelve

En un MMORPG tradicional, el mundo es estático. Los dragones reaparecen en el mismo cueva cada hora. Las facciones siempre están en guerra porque alguien lo escribió así. Los eventos de temporada son los mismos cada año.

Xindeler apunta a un mundo que **cambia con o sin jugadores**. Una facción puede conquistar un territorio mientras los jugadores duermen. Una plaga de criaturas puede diezmar una región si nadie interviene. Un personaje importante puede morir de vejez y ser sucedido por su heredero.

ORACLE es el motor de ese cambio.

---

## Qué hace ORACLE

### Narrativa procedural

ORACLE genera y gestiona **arcos narrativos** a largo plazo: una guerra entre facciones, el ascenso de un culto, la corrupción de un bosque. Cada arco tiene fases, condiciones de avance y múltiples desenlaces posibles según las acciones de los jugadores y los eventos del mundo.

### Simulación del ecosistema

El mundo tiene una simulación de poblaciones de criaturas basada en dinámicas predador-presa (modelo Lotka-Volterra). Si los jugadores cazan demasiados lobos, los ciervos se superpoblan y arrasan los cultivos de las aldeas. ORACLE monitorea estos balances y genera eventos cuando se rompen.

### Astronomía y ciclos naturales

ORACLE gestiona el estado astronómico del mundo: posición del sol y las lunas, estaciones, mareas de energía mágica. Estos ciclos afectan el comportamiento de criaturas, la disponibilidad de recursos, y algunas mecánicas de magia.

### Eventos del mundo

ORACLE genera eventos que los jugadores pueden descubrir y en los que pueden participar: aparición de un dragón anciano, conflicto entre gremios, hambruna en una región. Los eventos tienen escala (local, regional, mundial) y duración variable.

---

## Cómo funciona dentro del servidor

ORACLE corre como un módulo dentro del servidor, integrado en el ciclo de `rtsim`. No es un proceso separado ni una llamada a una API externa — es código Rust que se ejecuta en el mismo proceso que el juego.

```
Servidor (proceso único)
├── ECS (specs) — tick a tick: física, combate, movimiento
└── rtsim — simulación lenta (segundos/minutos de escala)
    ├── ORACLE — estado del mundo, eventos, narrativa
    └── AURORA — mente de cada NPC
```

ORACLE opera en una escala de tiempo diferente al ECS. El ECS procesa ticks de juego (decenas por segundo). ORACLE procesa eventos del mundo en una escala de segundos a horas reales.

---

## El contrato con AURORA

ORACLE y AURORA se comunican a través de **WorldFacts** — hechos verificados del estado del mundo que ORACLE escribe y AURORA puede leer de forma asíncrona.

Ejemplos de WorldFacts:
- `FactionConqueredSite { faction: Bandit, site: IronholmVillage }`
- `CreatureExtinct { species: Wolf, region: NorthForest }`
- `NarrativeArcAdvanced { arc: BanditRise, phase: 3 }`

Los NPCs con IA AURORA pueden reaccionar a estos hechos en su comportamiento y diálogo — sin que ORACLE necesite conocer a cada NPC individualmente.

---

## Control de admin

ORACLE se controla desde el servidor vía comandos de chat de admin:

```
/oracle status              — estado actual del director
/oracle pause               — pausar la generación de eventos
/oracle event <tipo>        — forzar un evento manualmente
/oracle arc list            — ver arcos narrativos activos
```

Ver [Administración de ORACLE](/oracle/admin) para la referencia completa.

---

## Integración LLM (opcional)

ORACLE incluye una capa de integración con modelos de lenguaje para la generación de narrativa. En modo offline (sin LLM), usa plantillas predefinidas. Con un servidor llama.cpp local configurado, puede generar descripciones de eventos, nombres de personajes y texto narrativo dinámico.

Esta capa es opcional y no afecta la mecánica del juego — solo el texto de descripción de eventos.
