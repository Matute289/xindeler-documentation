# 019 — APIs y protocolos

**Estado:** `[ ]` Pendiente  
**Prioridad:** Baja  
**Sprint:** 6

## Páginas a completar

### apis/veloren-protocol.md
- Protocolo binario del game server: no es REST ni WebSocket
- Quinn/QUIC: la librería de transporte
- Mensajes: cómo se serializan (rmp-serde / MessagePack)
- **No hay REST API para el juego** — solo para la web (waitlist, status)

### apis/fastapi-web.md
FastAPI en puerto 8010 del VPS:
- `GET /api/waitlist/count` — cantidad en waitlist
- `POST /api/waitlist` — registrar email (rate limited, dedup)
- `POST /api/contribute` — registrar contribuidor
- `GET /api/status` — si el server de juego (14004) está online

### apis/telemetria.md
- TelemetryLayer JSONL: qué eventos se loggean
- BoundedWriter: cómo se controla el tamaño del log
- Métricas que ORACLE monitorea (canary metrics)
