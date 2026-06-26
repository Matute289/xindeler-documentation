# 005 — proyecto/instalacion-local.md

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 2

## Objetivo
Guía completa para que un contribuidor nuevo pueda clonar, compilar y levantar el servidor+cliente de Xindeler en su máquina local.

## Contenido a cubrir
1. **Requisitos previos**
   - Rust nightly (`rustup toolchain install nightly`)
   - Git LFS (para assets)
   - Dependencias del sistema: `libvulkan`, `libasound`, `cmake` (varían por OS)
   - ~5 GB de espacio en disco para la compilación

2. **Clonar el repo**
   ```bash
   git clone https://github.com/Matute289/xindeler
   cd xindeler
   git lfs pull
   ```

3. **Compilar**
   ```bash
   cargo build           # debug (recomendado en desarrollo)
   cargo build --release # release (más lento de compilar, más rápido de correr)
   ```
   - Tiempos estimados: 10-20 min en primera compilación

4. **Levantar el servidor**
   ```bash
   cargo run --bin veloren-server-cli
   ```

5. **Levantar el cliente**
   ```bash
   cargo run --bin veloren-voxygen
   ```

6. **Conectar al servidor local**
   - En el cliente: servidor `localhost`, puerto `14004`

7. **Troubleshooting común**
   - Error de Vulkan: instalar drivers
   - Error de linking: instalar `build-essential` / `gcc`

## Fuente
Basarse en el `CONTRIBUTING.md` del repo de Veloren upstream + ajustes específicos de Xindeler.
