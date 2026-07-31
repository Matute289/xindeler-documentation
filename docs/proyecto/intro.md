---
sidebar_position: 1
---

# Introducción al Proyecto

**Xindeler** es un MMORPG de vóxeles de código abierto, escrito en Rust, construido sobre un motor derivado de [Veloren](https://veloren.net/). Esta sección cubre el proyecto desde el ángulo de arquitectura e infraestructura — cómo está armado el sistema completo, qué tecnologías lo componen, cómo levantarlo localmente y cómo está organizado el código.

Si buscás documentación de **sistemas de juego** (clases, magia, combate, items), esa vive en la sección [Sistemas de Juego](/sistemas/combate). Esta sección de Proyecto es más sobre el "cómo está construido" que sobre el "cómo se juega".

## Por dónde empezar

- [Arquitectura](/proyecto/arquitectura) — vista general del sistema: cliente, servidor, ORACLE/AURORA, y la API web separada.
- [Tecnologías](/proyecto/tecnologias) — el stack técnico completo, crate por crate.
- [Instalación local](/proyecto/instalacion-local) — cómo clonar y correr el proyecto para desarrollo.
- [Estructura de archivos](/proyecto/estructura-de-archivos) — cómo está organizado el repositorio.
- [Persistencia](/proyecto/persistencia) — qué se guarda, dónde, y en qué formato.

## Cliente vs. servidor vs. API web

Tres componentes corren de forma independiente:

1. **El cliente** (`voxygen`) — el juego que corre en la máquina del jugador.
2. **El servidor** (`xindeler-server`) — un proceso Rust monolítico que corre toda la simulación del mundo, incluyendo ORACLE y AURORA.
3. **La API web** (FastAPI, Python) — un proceso completamente aparte que atiende la lista de espera y el formulario de contribuidores de la landing. No comparte estado ni base de datos con el juego.

El detalle de cada uno está en [Arquitectura](/proyecto/arquitectura).
