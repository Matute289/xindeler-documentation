---
sidebar_position: 1
---

# Protocolo de juego

Cómo se comunican el cliente y el servidor de Xindeler.

---

## No es REST ni WebSocket

La comunicación de juego usa un **protocolo binario propietario sobre QUIC** — no es HTTP, no es REST, no es WebSocket. Intentar conectarse con un cliente HTTP al puerto de juego no va a funcionar.

La única API REST del proyecto es FastAPI en el puerto 8010, que solo sirve para la lista de espera y el formulario de contribuidores — no tiene acceso al estado del juego.

---

## QUIC y Quinn

El protocolo de transporte es [QUIC (RFC 9000)](https://www.rfc-editor.org/rfc/rfc9000), implementado en Rust con la crate [Quinn](https://github.com/quinn-rs/quinn).

QUIC corre sobre UDP y ofrece:
- **Multiplexing de streams** — múltiples canales lógicos sobre una conexión sin head-of-line blocking
- **Reconexión rápida** — 0-RTT handshake para reconexiones
- **TLS 1.3 integrado** — cifrado obligatorio en el transporte
- **Mejor comportamiento en redes con pérdida** — a diferencia de TCP, la pérdida de un paquete en un stream no bloquea a los demás

El servidor escucha en el puerto **14004** por defecto.

---

## Estructura de mensajes

Los mensajes se serializan con `bincode` sobre los streams QUIC. Hay dos tipos principales de stream:

### Mensajes confiables (streams QUIC)

Para eventos importantes que deben llegar en orden: inventario, chat, comandos, login, cambios de estado del juego. Usan streams QUIC garantizados.

```rust
// Mensajes del cliente al servidor (simplificado)
enum ClientMsg {
    Register { username, password },
    ChatMsg { msg },
    ControllerInputs { inputs },
    SwapEquipment { slots },
    DropItem { slot },
    // ...
}

// Mensajes del servidor al cliente
enum ServerMsg {
    StateAnswer { answer },
    Notification { notification },
    ChatMsg { msg },
    CreateEntity { entity, components },
    DeleteEntity { entity },
    UpdateComponent { entity, component },
    // ...
}
```

### Updates de posición (datagrams QUIC)

Para updates frecuentes de posición y orientación de entidades, que pueden perderse sin problema si llega uno más nuevo. Usan datagrams QUIC (no confiables) para menor latencia.

---

## Sincronización de entidades

El servidor no envía el estado de todas las entidades del mundo a cada cliente. Solo envía las entidades dentro del **rango de presencia** del jugador (radio de chunks alrededor de su posición).

Protocolo de sincronización:
1. Una entidad entra al rango → servidor envía `CreateEntity` con todos sus componentes
2. Un componente cambia → servidor envía `UpdateComponent` con el diff
3. La entidad sale del rango → servidor envía `DeleteEntity`

Los componentes sincronizados son solo los que el cliente necesita para renderizar y simular localmente: `Pos`, `Vel`, `Ori`, `Body`, `Health`, `CharacterState`, etc. Componentes internos del servidor (IA, inventario completo de NPCs) no se sincronizan.

---

## Login y autenticación

En un servidor local (desarrollo), cualquier combinación usuario/contraseña funciona — el servidor crea la cuenta si no existe.

En producción, el servidor puede configurarse para usar autenticación externa. El flujo es:

```
Cliente → Register { username, password }
Servidor → StateAnswer::Accepted / Rejected
Cliente → conectado, recibe el estado inicial del mundo
```

---

## Implementación

Si necesitás conectarte al servidor desde fuera del cliente oficial (herramientas de debug, bots de test), la crate `client` del workspace expone la API de conexión:

```rust
use client::Client;

let client = Client::new(
    ConnectionArgs::Tcp { hostname: "localhost", port: 14004 },
    None,  // runtime tokio compartido
).await?;
```

La crate `common_net` define todos los tipos de mensajes compartidos entre cliente y servidor.
