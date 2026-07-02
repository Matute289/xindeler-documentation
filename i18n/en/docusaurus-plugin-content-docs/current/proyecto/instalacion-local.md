---
sidebar_position: 4
---

# Local installation

Guide to building and running Xindeler on your machine.

## Requirements

### Rust nightly

The project requires Rust nightly because it uses experimental compiler features. Install it with [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup toolchain install nightly
rustup default nightly
```

### System dependencies (Linux)

```bash
# Debian / Ubuntu
sudo apt install \
  libxcb-render0-dev libxcb-shape0-dev libxcb-xfixes0-dev \
  libxkbcommon-dev libssl-dev libasound2-dev \
  cmake pkg-config git

# Arch
sudo pacman -S base-devel libxcb libxkbcommon openssl alsa-lib cmake
```

On **macOS** and **Windows** no additional dependencies are required beyond Rust and Git.

### GPU

The client uses **wgpu** and requires a GPU with Vulkan support (Linux/Windows) or Metal (macOS). On Windows it also works with DirectX 12.

---

## Clone the repository

```bash
git clone https://github.com/Matute289/xindeler
cd xindeler
```

---

## Build

```bash
# Debug — fast compile, slower binary (recommended for development)
cargo build

# Release — slow compile (~20 min the first time), optimized binary
cargo build --release
```

The first build downloads and indexes all dependencies. Subsequent builds are incremental and much faster.

---

## Start the server

```bash
cargo run --bin xindeler-server
```

The server listens on port **14004** using the Xindeler protocol over QUIC (Quinn). On startup it generates the world if no prior `rtsim/data.dat` exists — this can take a minute.

Expected logs on a successful start:

```
[INFO] World loaded in 3.2s
[INFO] Listening on 0.0.0.0:14004
[INFO] Server ready
```

---

## Start the client

In another terminal:

```bash
cargo run --bin voxygen
```

The client (Voxygen) looks for a server at `localhost:14004` by default. When connecting it will ask for a username and password — on a local server you can use any combination.

---

## Faster linker (optional, Linux)

On Linux, `mold` significantly reduces link time:

```bash
sudo apt install mold
```

Add to `.cargo/config.toml` at the repo root:

```toml
[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=mold"]
```

---

## Common issues

**`error[E0554]: #![feature] may not be used on the stable release channel`**
You're on stable, not nightly:
```bash
rustup default nightly
```

**The client doesn't connect to the server**
The server takes a few seconds to initialize the world. Wait for the `Server ready` log before launching the client.

**Black screen or crash in the client**
Check that your GPU has up-to-date drivers with Vulkan/Metal support. On Linux you can try forcing the backend:
```bash
WGPU_BACKEND=gl cargo run --bin voxygen
```

**Build fails on `ring` or `openssl`**
Install `pkg-config` and the OpenSSL headers:
```bash
sudo apt install pkg-config libssl-dev
```
