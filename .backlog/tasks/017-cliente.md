# 017 — Cliente (voxygen): arquitectura, render, UI, audio

**Estado:** `[ ]` Pendiente  
**Prioridad:** Baja  
**Sprint:** 6

## Páginas a completar

### cliente/arquitectura.md
- voxygen es el crate cliente
- Render loop: event loop de winit + render tick
- Escenas: `MainMenu`, `Ingame`, `Loading`
- Hot-reload de assets en desarrollo

### cliente/renderizado.md
- wgpu pipeline: API gráfica abstracta (Vulkan/Metal/DX12)
- Chunks voxel: renderizado por chunks de 32x32x16
- LOD: Level of Detail para chunks lejanos
- Iluminación: día/noche, sombras dinámicas

### cliente/ui.md
- egui/conrod para el HUD
- HUD elements: barra de vida, energía, inventario, chat
- Inventario: slot system, drag-drop

### cliente/audio.md
- Sistema de sonido de Veloren: kira audio engine
- Ambient audio: música ambiental por bioma
- SFX: sonidos de combate, ambiente, UI
