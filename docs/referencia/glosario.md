---
sidebar_position: 3
---

# Glosario

Términos técnicos usados en el codebase y la documentación de Xindeler.

---

## A

**Asset ID**
Identificador de un asset del juego, formado por el path del archivo RON relativo a `assets/`, con `/` reemplazado por `.` y sin extensión. Ejemplo: `common.items.weapons.sword.iron_sword`.

**AURORA**
Sistema de IA de NPCs. Cada NPC tiene una mente (`Mind`) con valores, miedos, memoria episódica y relaciones sociales. Corre dentro del servidor como extensión de `rtsim`. Ver [AURORA](/aurora/intro).

---

## B

**Body**
Componente ECS que define la apariencia física de una entidad: especie (`Human`, `Orc`, `Dwarf`...), tipo de cuerpo, y partes que determinan el modelo 3D de vóxeles.

**Buff**
Efecto temporal aplicado a una entidad que modifica sus stats. Puede ser positivo (buff) o negativo (debuff). Definido en `common/src/comp/buff.rs`.

---

## C

**Cargo workspace**
Proyecto Rust con múltiples crates coordinados desde un `Cargo.toml` raíz. Xindeler es un workspace — `cargo build` en la raíz compila todo.

**Chronicle**
Archivo JSONL en `chronicle/` donde el servidor registra eventos del mundo (batallas, muertes, cambios de facción). Se rota automáticamente por tamaño.

**Component (Componente ECS)**
Struct de datos adjunto a una entidad. No tiene lógica — solo datos. Ejemplo: `Health { current: 80.0, maximum: 100.0 }`.

**Chunk**
Unidad de terreno de 32×32×16 bloques. El mundo se divide en chunks que se cargan/descargan dinámicamente según la posición de los jugadores.

---

## E

**ECS (Entity Component System)**
Paradigma de arquitectura de juegos. Las entidades son IDs numéricos; los datos se almacenan en componentes; la lógica vive en sistemas que operan sobre conjuntos de componentes. En Xindeler se usa la crate `specs`.

**Entity (Entidad)**
ID numérico único que representa cualquier objeto del juego: jugador, NPC, ítem en el suelo, proyectil. No tiene datos propios — los datos están en sus componentes.

---

## F

**Facción**
Grupo político/social en el mundo del juego. Los NPCs pertenecen a facciones que tienen relaciones entre sí (aliadas, rivales, neutrales). El estado de facciones persiste en `rtsim`.

---

## L

**LOD (Level of Detail)**
Técnica de renderizado que usa modelos/texturas de menor resolución para objetos lejanos. El cliente de Xindeler aplica LOD a los chunks de terreno y a los modelos de entidades.

**LootSpec**
Tipo RON que define qué ítem(es) dropea una entidad al morir. Puede ser un ítem específico, una tabla con pesos, o nada (`Nothing`).

---

## O

**ORACLE**
Sistema de dirección narrativa del mundo. Genera eventos, gestiona el ecosistema de criaturas, controla el clima y los arcos de historia a largo plazo. Corre dentro del servidor como extensión de `rtsim`. Ver [ORACLE](/oracle/intro).

---

## P

**Poise**
Stat que determina la resistencia a ser aturdido. Si el poise de una entidad llega a cero, queda en estado `Stunned` brevemente. Se recupera con el tiempo.

**Protocol (Protocolo Xindeler)**
Protocolo binario propietario usado para la comunicación entre cliente y servidor. Corre sobre QUIC (Quinn). No es REST ni WebSocket.

---

## Q

**QUIC**
Protocolo de transporte moderno (RFC 9000) sobre UDP. Xindeler lo usa para la comunicación de juego vía la crate Quinn. Ofrece multiplexing de streams y menor latencia que TCP en redes con pérdida de paquetes.

---

## R

**RON (Rusty Object Notation)**
Formato de texto para definir assets del juego (ítems, habilidades, criaturas, recetas). Similar a JSON pero con soporte nativo para tipos Rust. Extensión `.ron`.

**rtsim**
Módulo de simulación del mundo real-time. Mantiene el estado persistente de NPCs, sitios y facciones entre sesiones. Serializa a `rtsim/data.dat` en formato MessagePack.

---

## S

**Site**
Punto de interés generado en el mundo: ciudad, aldea, dungeon, ruinas. Los sites tienen plots (edificios, estructuras) y pueden alojar NPCs persistentes en rtsim.

**SkillSet**
Conjunto de habilidades y niveles de una entidad. Determina qué habilidades puede usar en combate. Se referencia por asset ID en la definición de entidades RON.

**System (Sistema ECS)**
Lógica que opera sobre un conjunto de componentes cada tick. Los sistemas se registran en el dispatcher de `specs` y pueden correr en paralelo cuando no tienen conflictos de datos.

---

## V

**Veloren**
Engine open source de voxel RPG en Rust en el que se basa Xindeler. Xindeler es un fork que extiende Veloren con ORACLE, AURORA, y mecánicas de juego propias.

**Voxygen**
El cliente gráfico de Xindeler (nombre heredado de Veloren). Binario: `cargo run --bin voxygen`.

---

## W

**WorldFact**
Tipo de dato que ORACLE escribe y AURORA puede leer. Representa un hecho verificado del estado del mundo (una facción conquistó un sitio, una criatura mítica fue avistada, etc.). Es el contrato de comunicación entre los dos sistemas.
