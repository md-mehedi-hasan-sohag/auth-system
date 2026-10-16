# Auth System

React + TypeScript (Vite) frontend, Express + TypeScript backend, MySQL, JWT in an HTTP-only cookie, USER/ADMIN roles.

## Setup

1. **Database** — start MySQL/MariaDB (e.g. XAMPP), then:

   ```
   mysql -u root -p < backend/sql/schema.sql
   ```

2. **Backend**

   ```
   cd backend
   npm install
   cp .env.example .env   # set DB_PASSWORD and a long random JWT_SECRET
   npm run dev            # http://localhost:5000
   ```

3. **Frontend**

   ```
   cd frontend
   npm install
   npm run dev            # http://localhost:5173
   ```

   Set `VITE_API_URL` in `frontend/.env` if the API is not at `http://localhost:5000/api`.

## Creating the first admin

Registration always creates `USER` accounts. Register normally, then promote:

```sql
UPDATE auth_system.users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## API

| Method | Endpoint             | Auth | Role       |
| ------ | -------------------- | ---- | ---------- |
| POST   | /api/auth/register   | No   | Public     |
| POST   | /api/auth/login      | No   | Public     |
| POST   | /api/auth/logout     | No   | Public     |
| GET    | /api/auth/me         | Yes  | User/Admin |
| GET    | /api/admin/users     | Yes  | Admin      |
| GET    | /api/health          | No   | Public     |

Register and login are limited to 10 requests per 15 minutes per IP; all of `/api` to 100.

## Production

Set `NODE_ENV=production` (the cookie becomes `Secure`, so it needs HTTPS), set `FRONTEND_URL` to the real frontend origin, then `npm run build && npm start` in `backend` and serve `frontend/dist` behind Nginx.
