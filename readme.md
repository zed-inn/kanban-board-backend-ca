# Kanban Infrastructure: Fastify & PostgreSQL Adapter

This is the delivery mechanism and data access layer. It serves the `kanban-core` package.

We explicitly bypassed heavy ORMs (like Prisma or TypeORM) in favor of raw `pg` queries. This prevents the database schema from dictating the application logic and gives us absolute control over indexing, query execution, and cursor-based pagination.

## Folder Structure

```
src/
├── config/                   # Singletons & Initializers (db.ts, env.ts, io-server.ts)
├── db/                       # Raw SQL schema definitions
├── interfaces/               # Implementations of Core Contracts
│   ├── postgres/             # Database adapters
│   │   ├── queries/          # CQRS Read implementations (PostgresBoardQuery)
│   │   ├── repo/             # Write implementations (PostgresCardRepository)
│   │   └── services/         # PostgresUnitOfWork (Handles transaction pooling)
│   ├── socket-io/            # WebSocket event dispatcher adapters
│   └── uuid/                 # ID generation wrapper
├── routes/                   # Fastify HTTP Delivery Layer
│   ├── auth/                 # Login, Signup, Logout
│   ├── board/                # Board CRUD & Member Management
│   ├── column/               # Column CRUD & Reordering
│   └── card/                 # Card CRUD, Body Updates, Location Updates
├── shared/                   # HTTP/WS Middlewares (Auth, Error Handling)
├── io-server.setup.ts        # Socket.io connection lifecycle
├── server.ts                 # Bootstrapper
└── shutdown.ts               # Graceful termination script (closes PG, IO, Fastify)
```

## How It Consumes The Core

The infrastructure's primary job is to satisfy the contracts defined by the kanban-core package.

**Composition Root** (`src/config/core.ts`): We instantiate the raw Postgres Repositories, Queries, and the `pg` UnitOfWork. We inject these into the `Kanban` facade exported by the core.

**HTTP Controllers**: Fastify routes receive raw JSON, pass it through strict Zod validation, and hand the pristine payload to the `Kanban.useCase.execute()` methods.

## Technical Implementations

### 1. CQRS & Zod Parsing

Read operations completely bypass domain entities. The `PostgresQuery` classes execute highly optimized SQL joins and immediately pipe the raw rows through Zod schemas. This structurally guarantees that the shape of the data leaving the database perfectly matches the ReadModel contracts demanded by the core.

### 2. Mathematically Sound Keyset Pagination

Offset pagination (`OFFSET 100000`) crashes databases under load. We implement cursor-based (keyset) pagination.

- **Tie-Breaker Safety**: Ordering by `updated_at` alone causes skipped records if two rows share the exact millisecond. We strictly implement `ORDER BY updated_at DESC, id DESC` to guarantee deterministic pagination.

### 3. Duck-Typed Global Error Handling

The core throws specific domain errors (`NotBoardOwnerError`). The Fastify global error handler catches these, inspects the `.error` property string via duck-typing, and maps them to accurate HTTP status codes (e.g., `403 Forbidden`, `404 Not Found`). Stack traces are sanitized before hitting the client.

### 4. Real-Time Socket.io Adapter

We implement the core's `EventDispatcher` interface using Socket.io. When the core drains its Event Basket, this adapter translates the `EventTarget` (users or rooms) into Socket.io `io.to(room).emit()` broadcasts.

## Current Limitations & Tradeoffs

**Basic Authentication**: Auth is handled via a dead-simple HTTP-only JWT cookie with a hardcoded 1-day expiry. There is no refresh token rotation, no OAuth, and no session invalidation/blacklist mechanism.

**Rate Limiting is Basic**: While global rate limiting exists, it does not currently scale dynamically based on IP reputation or handle distributed abuse across a cluster (requires Redis).

**Socket Connection Auth**: WebSocket authentication relies on the initial Fastify handshake cookie. If the token expires while the socket is open, the connection is not forcibly severed until a reconnect happens.

**Single Node Constraints**: The Socket.io setup currently assumes a single-node deployment. To scale horizontally, a Redis adapter must be plugged into the `IoServer` initialization.

---

## API Routing Table

The Fastify application exposes the following strictly validated endpoints:

### Authentication

`POST   /auth/login` - Authenticates user and sets HTTP-only JWT.

`POST   /auth/signup` - Creates user and sets HTTP-only JWT.

`DELETE /auth/` - Clears the authentication cookie.

### Boards

`GET    /board/` - Fetches paginated boards the user is a member of.

`GET    /board/owned` - Fetches paginated boards owned by the user.

`POST   /board/` - Creates a new board.

`PATCH  /board/:id/rename` - Updates board name.

`PATCH  /board/:id/change-owner` - Transfers board ownership.

`DELETE /board/:id` - Deletes a board entirely.

`POST   /board/:id/member` - Adds a user to a board.

`DELETE /board/:id/member` - Removes a user from a board.

### Columns

`GET    /board/:boardId/column/` - Fetches paginated columns for a board.

`POST   /board/:boardId/column/` - Adds a new column.

`PATCH  /board/:boardId/column/:id/rename` - Updates column name.

`PATCH  /board/:boardId/column/:id/reorder` - Reorders column position via LexoRank.

`DELETE /board/:boardId/column/:id` - Deletes a column.

### Cards

`GET    /board/:boardId/column/:columnId/card/` - Fetches paginated cards.

`POST   /board/:boardId/column/:columnId/card/` - Adds a new card.

`PATCH  /board/:boardId/column/:columnId/card/:id/body` - Updates card title/content.

`PATCH  /board/:boardId/column/:columnId/card/:id/location` - Reorders card or moves to new column via LexoRank.

`DELETE /board/:boardId/column/:columnId/card/:id` - Deletes a card.
