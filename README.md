# OneList

A gift list app — create lists, share them via link, and optionally protect them with a passcode.

## Stack

- **Frontend**: React 19 + Vite 7 (served via nginx in production)
- **Backend**: Express.js with layered architecture (routes → controllers → repositories)
- **Database**: PostgreSQL 16
- **Auth**: Email/password (JWT) + Google OAuth
- **Local dev**: Docker Compose
- **Hosting**: Railway

---

## Local Development

### Prerequisites
- Docker + Docker Compose

### Setup

1. Copy `.env` and fill in Google OAuth credentials (or leave blank to skip Google login):
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Open [http://localhost:5173](http://localhost:5173)

The database schema is applied automatically from `db/init.sql` on first run.

---

## Project Structure

```
OneList/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── services/       # api.js (all fetch calls)
│   │   └── pages/          # Landing, Login, Register, Dashboard, ListEditor, SharedView
│   ├── Dockerfile          # Dev server
│   ├── Dockerfile.prod     # Multi-stage production build (nginx)
│   ├── nginx.conf          # nginx config for SPA + API proxy
│   └── railway.json
│
├── server/                 # Express backend
│   ├── config/             # passport.js (Google OAuth strategy)
│   ├── controllers/        # authController, listController, listItemController
│   ├── middleware/         # auth.js (JWT verification)
│   ├── repositories/       # userRepository, listRepository, listItemRepository
│   ├── routes/             # api.js, auth.js, lists.js
│   ├── db.js               # pg Pool
│   ├── server.js           # Entry point
│   ├── Dockerfile
│   └── railway.json
│
├── db/
│   └── init.sql            # Schema: users, lists, list_items
│
├── docker-compose.yml      # Local dev orchestration
└── .env                    # Local environment variables
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register with email + password |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/auth/google` | — | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | — | Google OAuth callback |
| GET | `/api/lists` | JWT | Get user's lists |
| POST | `/api/lists` | JWT | Create a list |
| GET | `/api/lists/:id` | JWT | Get list + items |
| PUT | `/api/lists/:id` | JWT | Update name / privacy / passcode |
| DELETE | `/api/lists/:id` | JWT | Delete a list |
| POST | `/api/lists/:id/items` | JWT | Add item to list |
| PUT | `/api/lists/:id/items/:itemId` | JWT | Update item |
| DELETE | `/api/lists/:id/items/:itemId` | JWT | Delete item |
| GET | `/api/lists/share/:token` | — | Public share view |
| POST | `/api/lists/share/:token/verify` | — | Verify passcode for private list |

---

## Railway Deployment

1. Create a Railway project with three services:
   - **PostgreSQL plugin** (auto-provides `DATABASE_URL`)
   - **Backend** — set root directory to `server/`, uses `Dockerfile`
   - **Frontend** — set root directory to `client/`, uses `Dockerfile.prod`

2. Set environment variables on the backend service:
   ```
   JWT_SECRET=<strong-random-secret>
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=https://<backend-domain>/api/auth/google/callback
   CLIENT_URL=https://<frontend-domain>
   NODE_ENV=production
   ```

3. Set build variables on the frontend service:
   ```
   VITE_API_URL=https://<backend-domain>
   BACKEND_URL=https://<backend-domain>
   ```

4. In Google Cloud Console, add your production callback URL as an authorised redirect URI.
