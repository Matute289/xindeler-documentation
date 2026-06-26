---
sidebar_position: 3
---

# Tecnologías

Stack técnico de Xindeler. Todas las dependencias son open source.

## Lenguaje

### Rust (nightly)

El juego y el servidor están escritos 100% en Rust. Se usa el canal **nightly** porque el proyecto depende de features del compilador que aún no se estabilizaron (principalmente `portable_simd` y algunas macros procedurales).

El canal exacto requerido está fijado en `rust-toolchain.toml` en la raíz del repo.

---

## Servidor

### specs — ECS

[specs](https://github.com/amethyst/specs) es el framework de Entity Component System. Permite paralelizar sistemas automáticamente usando `rayon` cuando sus conjuntos de componentes no se solapan.

### Quinn — QUIC transport

[Quinn](https://github.com/quinn-rs/quinn) implementa el protocolo QUIC (RFC 9000) en Rust. El protocolo de juego corre sobre QUIC en lugar de TCP porque:
- Multiplexing de streams sin head-of-line blocking
- Reconexión más rápida ante pérdida de paquetes
- Mejor comportamiento en redes móviles y con NAT

### MessagePack — Persistencia

El estado del mundo (`rtsim/data.dat`) se serializa con [MessagePack](https://msgpack.org/) vía la crate `rmp-serde`. Es un formato binario compacto y rápido, compatible con `serde`. No hay base de datos relacional.

### RON — Assets y configuración

[RON (Rusty Object Notation)](https://github.com/ron-rs/ron) es el formato de texto para definir ítems, habilidades, criaturas, recetas y configuración del servidor. Es similar a JSON pero con soporte nativo para tipos Rust (enums con variantes, structs con nombres de campo).

Ejemplo de un ítem en RON:
```ron
ItemDef(
    name: "Espada de Hierro",
    kind: Sword(
        equip_slot: Mainhand,
        power: 12.0,
        speed: 1.2,
    ),
    quality: Common,
)
```

---

## Cliente (Voxygen)

### wgpu — Renderizado

[wgpu](https://wgpu.rs/) es una abstracción de GPU que implementa el estándar WebGPU. Soporta múltiples backends:

| Sistema operativo | Backend |
|-------------------|---------|
| Linux | Vulkan |
| macOS | Metal |
| Windows | DirectX 12 / Vulkan |
| Fallback | OpenGL (vía `WGPU_BACKEND=gl`) |

El pipeline de renderizado renderiza chunks de vóxeles con LOD (nivel de detalle) dinámico.

### egui — UI

[egui](https://github.com/emilk/egui) maneja la interfaz de usuario del cliente: HUD, inventario, menús, ventanas de diálogo. Es una UI inmediata (immediate mode) — no hay árbol de widgets persistente.

### rodio / CPAL — Audio

El sistema de audio usa [rodio](https://github.com/RustAudio/rodio) sobre [CPAL](https://github.com/RustAudio/cpal) para reproducción de música ambiental, efectos de sonido y en el futuro las voces generadas por AURORA.

---

## Web (proceso separado)

### FastAPI (Python)

El proceso web está escrito en Python con [FastAPI](https://fastapi.tiangolo.com/). Expone tres endpoints REST para la lista de espera, el formulario de contribuidores, y el estado del servidor. No tiene acceso al estado del juego — consulta el servidor de juego vía un endpoint de status interno.

---

## DevOps

| Herramienta | Uso |
|-------------|-----|
| GitHub Actions | CI (build + clippy + tests) y CD (rsync al VPS) |
| rsync | Deploy de assets estáticos al VPS |
| nginx | Reverse proxy para los sitios web (landing, wiki, docs) |
| certbot | Certificados TLS automáticos |

---

## Dependencias notables

| Crate | Propósito |
|-------|-----------|
| `serde` | Serialización/deserialización |
| `tokio` | Runtime async para el servidor |
| `rayon` | Paralelismo de datos (sistemas ECS) |
| `vek` | Tipos matemáticos (Vec2, Vec3, Mat4) |
| `image` | Carga de texturas |
| `tracing` | Logging estructurado |
