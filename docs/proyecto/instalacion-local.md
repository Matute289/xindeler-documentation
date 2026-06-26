---
sidebar_position: 4
---

# Instalación local

Guía para compilar y ejecutar Xindeler en tu máquina.

## Requisitos

### Rust nightly

El proyecto requiere Rust nightly por el uso de features experimentales del compilador. Instalá con [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup toolchain install nightly
rustup default nightly
```

### Dependencias del sistema (Linux)

```bash
# Debian / Ubuntu
sudo apt install \
  libxcb-render0-dev libxcb-shape0-dev libxcb-xfixes0-dev \
  libxkbcommon-dev libssl-dev libasound2-dev \
  cmake pkg-config git

# Arch
sudo pacman -S base-devel libxcb libxkbcommon openssl alsa-lib cmake
```

En **macOS** y **Windows** no se requieren dependencias adicionales más allá de Rust y Git.

### GPU

El cliente usa **wgpu** y requiere una GPU con soporte para Vulkan (Linux/Windows) o Metal (macOS). En Windows también funciona con DirectX 12.

---

## Clonar el repositorio

```bash
git clone https://github.com/Matute289/xindeler
cd xindeler
```

---

## Compilar

```bash
# Debug — compilación rápida, binario más lento (recomendado para desarrollo)
cargo build

# Release — compilación lenta (~20 min la primera vez), binario optimizado
cargo build --release
```

La primera compilación descarga e indexa todas las dependencias. Las subsiguientes son incrementales y mucho más rápidas.

---

## Levantar el servidor

```bash
cargo run --bin xindeler-server
```

El servidor escucha en el puerto **14004** usando el protocolo Xindeler sobre QUIC (Quinn). Al iniciarse genera el mundo si no existe un `rtsim/data.dat` previo — esto puede tardar un minuto.

Logs esperados al inicio exitoso:

```
[INFO] World loaded in 3.2s
[INFO] Listening on 0.0.0.0:14004
[INFO] Server ready
```

---

## Levantar el cliente

En otra terminal:

```bash
cargo run --bin voxygen
```

El cliente (Voxygen) busca un servidor en `localhost:14004` por defecto. Al conectar pedirá usuario y contraseña — en un servidor local podés usar cualquier combinación.

---

## Linker rápido (opcional, Linux)

En Linux, `mold` reduce el tiempo de linkeo significativamente:

```bash
sudo apt install mold
```

Agregá a `.cargo/config.toml` en la raíz del repo:

```toml
[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=mold"]
```

---

## Problemas comunes

**`error[E0554]: #![feature] may not be used on the stable release channel`**
Estás en stable, no en nightly:
```bash
rustup default nightly
```

**El cliente no conecta al servidor**
El servidor tarda unos segundos en inicializar el mundo. Esperá a ver el log `Server ready` antes de lanzar el cliente.

**Pantalla negra o crash en el cliente**
Verificá que tu GPU tenga drivers actualizados con soporte Vulkan/Metal. En Linux podés probar forzando el backend:
```bash
WGPU_BACKEND=gl cargo run --bin voxygen
```

**Compilación falla en `ring` o `openssl`**
Instalá `pkg-config` y las headers de OpenSSL:
```bash
sudo apt install pkg-config libssl-dev
```
