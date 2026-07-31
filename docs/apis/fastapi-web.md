---
sidebar_position: 2
---

# FastAPI Web

Un proceso Python independiente (`/srv/xindeler/waitlist-api/main.py`, puerto 8010) expone una REST API mínima para la landing y el resto de los sitios públicos. Corre como servicio systemd (`xindeler-waitlist.service`) y **no comparte base de datos con el juego** — no tiene acceso al estado del servidor ni al protocolo Xindeler.

## Endpoints

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/waitlist/count` | Cantidad de entradas en la lista de espera |
| `POST /api/waitlist` | Registra un email en la lista de espera |
| `POST /api/contribute` | Formulario de contribuidores |
| `GET /api/status` | Estado del servidor de juego (online/offline), cacheado 30s |

## Comportamiento de `POST /api/waitlist`

- Guarda la entrada en un CSV, protegido por rate limiting en nginx.
- Envía un email de auto-reply en HTML al usuario que se anotó.
- Si el email corresponde a alguien que ya figura como contribuidor, además dispara una notificación inmediata al owner.
- **Deduplicación silenciosa:** si el email ya está en el CSV, la respuesta es 200 sin guardar de nuevo ni volver a enviar el mail — evita spam de reintentos del lado del cliente sin exponer si un email ya está registrado.

## Comportamiento de `POST /api/contribute`

- Guarda la entrada en un CSV separado (`contributors.csv`).
- Envía un acuse de recibo al contribuidor.
- Dispara una notificación inmediata al owner.

## Comportamiento de `GET /api/status`

Chequea si el servidor de juego (puerto 14004, protocolo Xindeler sobre QUIC — ver [Arquitectura](/proyecto/arquitectura)) está aceptando conexiones. La respuesta se cachea 30 segundos para no golpear el puerto del juego en cada request de la landing.

## Persistencia y credenciales

- Ambos CSV (`waitlist.csv`, `contributors.csv`) viven fuera del web root, con permisos restringidos (chmod 600).
- Las credenciales SMTP para el envío de emails están en un archivo de entorno separado (chmod 600), nunca en el repo.
- No hay base de datos relacional — todo el estado de esta API es CSV plano.

## Rate limiting

nginx aplica rate limiting a nivel de proxy (zona dedicada, ~1 request/minuto por IP) antes de que el request llegue al proceso FastAPI — la protección contra abuso vive en la capa de infraestructura, no en el código Python.
