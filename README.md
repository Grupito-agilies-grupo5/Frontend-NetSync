# NetSync — Plataforma de Visualización Sincronizada

> **Prototipo Académico** — Proyecto de Desarrollo Ágil de Productos de Software.
> No se conecta a Netflix ni a ningún servicio real de streaming.

## Descripción

NetSync es una plataforma web prototipo que simula una funcionalidad social de "watch-party". Permite a los usuarios crear salas virtuales para ver contenido de video de forma sincronizada con amigos, utilizando chat en tiempo real, reacciones y métricas de experiencia.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript |
| Estilos | Tailwind CSS 3.x |
| Backend | Node.js + Express 4 |
| Tiempo Real | Socket.IO 4 |
| Base de Datos | JSON File Storage |
| Routing | React Router DOM 6 |
| API de Películas | FM-DB (Free Movie Database) |

## Requisitos Previos

- **Node.js** 18 o superior
- **npm** 9 o superior

## Instalación

### 1. Clonar o ubicar el proyecto

```bash
cd netsync
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

## Ejecución

Necesitas **dos terminales** para ejecutar frontend y backend simultáneamente.

### Terminal 1 — Backend (puerto 3001)

```bash
cd netsync/backend
npm run dev
```

### Terminal 2 — Frontend (puerto 5173)

```bash
cd netsync/frontend
npm run dev
```

### Acceder a la aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/health
- **Dashboard:** http://localhost:5173/dashboard

## Funcionalidades

### ✅ Implementadas (MVP)

1. **Pantalla inicial** — Hero section, catálogo de contenido simulado, botones de crear/unirse
2. **Crear sala** — Seleccionar contenido, ingresar nombre, generar código de sala
3. **Unirse a sala** — Ingresar código y nombre, conectar a sala existente
4. **Reproducción sincronizada** — Video HTML5 (Big Buck Bunny), sync de play/pause/seek vía Socket.IO
5. **Chat en tiempo real** — Mensajes con nombre, texto y hora
6. **Reacciones en tiempo real** — 👍 Me gusta, 😮 Sorpresa, 😂 Risa, 😴 Aburrimiento con animaciones flotantes
7. **Calificación de experiencia** — Modal al salir con estrellas (1-5) y comentario opcional
8. **Dashboard de métricas** — Salas creadas, usuarios, calificación promedio, contenido más usado, reacciones

### 🚧 Pendientes para futuras iteraciones

- Autenticación de usuarios
- Historial de salas por usuario
- Notificaciones push
- Compartir sala por enlace
- Emojis y GIFs en chat
- Múltiples fuentes de video
- Modo "teatro" (pantalla completa)
- Tests unitarios e integración

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/rooms` | Crear nueva sala |
| `GET` | `/api/rooms/:id` | Obtener datos de sala |
| `POST` | `/api/rooms/:id/join` | Unirse a sala |
| `POST` | `/api/rooms/:id/rating` | Enviar calificación |
| `GET` | `/api/metrics` | Obtener métricas |
| `GET` | `/api/content` | Obtener catálogo |
| `GET` | `/api/health` | Health check |

## Eventos Socket.IO

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `room:join` | Client → Server | Unirse a sala |
| `room:userJoined` | Server → Room | Usuario se unió |
| `room:userLeft` | Server → Room | Usuario salió |
| `player:play` | Bidireccional | Reproducir video |
| `player:pause` | Bidireccional | Pausar video |
| `player:seek` | Bidireccional | Cambiar posición |
| `player:sync` | Server → Client | Sincronizar estado al unirse |
| `chat:message` | Bidireccional | Mensaje de chat |
| `chat:history` | Server → Client | Historial al unirse |
| `reaction:send` | Bidireccional | Enviar reacción |
| `reaction:history` | Server → Client | Historial al unirse |

## Estructura del Proyecto

```
netsync/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── metricController.ts
│   │   │   └── roomController.ts
│   │   ├── data/
│   │   │   └── content.ts
│   │   ├── models/
│   │   │   └── types.ts
│   │   ├── routes/
│   │   │   ├── metricRoutes.ts
│   │   │   └── roomRoutes.ts
│   │   ├── services/
│   │   │   ├── metricService.ts
│   │   │   └── roomService.ts
│   │   ├── sockets/
│   │   │   └── roomSocket.ts
│   │   ├── app.ts
│   │   ├── database.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   └── MetricCard.tsx
│   │   │   ├── home/
│   │   │   │   ├── ContentCard.tsx
│   │   │   │   └── HeroSection.tsx
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx
│   │   │   └── room/
│   │   │       ├── Chat.tsx
│   │   │       ├── Reactions.tsx
│   │   │       ├── UserList.tsx
│   │   │       └── VideoPlayer.tsx
│   │   ├── data/
│   │   │   └── content.ts
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useRoom.ts
│   │   │   └── useSocket.ts
│   │   ├── pages/
│   │   │   ├── CreateRoomPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── JoinRoomPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── RoomPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Notas Técnicas

- **Video placeholder:** Se usa Big Buck Bunny (Blender Foundation, dominio público) como video de demostración. Si no hay conexión a internet, se muestra un fallback visual.
- **Base de datos:** Se usa almacenamiento en archivos JSON (`backend/data/db/database.json`) para simplicidad del MVP. No requiere instalación de drivers nativos.
- **Sincronización:** El host controla play/pause/seek. Los guests reciben actualizaciones en tiempo real via Socket.IO. Si un usuario se conecta tarde, recibe el estado actual del reproductor.

## Licencia

Proyecto académico — Solo para fines educativos.
