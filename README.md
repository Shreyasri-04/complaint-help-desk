# Ticket Desk — Frontend

React + TypeScript frontend for a Complaint / Ticket Desk system, built with Vite, Material UI, Axios, Zustand and React Router. Works against the existing Spring Boot backend with JWT authentication.

## Tech stack

- React 19 + TypeScript (Vite)
- Material UI (v9)
- Axios (typed HTTP layer + interceptors)
- Zustand (+ persist) for auth state
- React Router DOM (v7)
- Zod for form validation

## Getting started

Requirements: Node 20+ and npm.

```bash
npm install
npm run dev
```

The app expects the backend at `http://localhost:8080`. Override via a local `.env`:

```bash
cp .env.example .env
# set VITE_API_BASE_URL to your backend
```

| Variable            | Description                        | Default                 |
| ------------------- | ---------------------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Spring Boot backend base URL       | `http://localhost:8080` |

## Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the dev server          |
| `npm run build`   | Type-check + production build |
| `npm run preview` | Preview the production build  |
| `npm run lint`    | Lint with ESLint              |

## Authentication & RBAC

- Login and register call `POST /auth/login` and `POST /auth/register`.
- The token, role and username are stored via the Zustand auth store
  (`src/stores/authStore.ts`, persisted to `localStorage`); role comes only
  from the backend/JWT and is normalized to `ROLE_ADMIN` / `ROLE_MANAGER` /
  `ROLE_USER` (`src/types/auth.ts`).
- `src/api/httpClient.ts` is the single Axios instance: it attaches
  `Authorization: Bearer <token>` on every request (30s timeout) and, on a
  `401`, clears the session and redirects to `/login`. A `403` never logs out.
- Route access is enforced with `ProtectedRoute` (any authenticated user) and
  `RoleRoute` (renders the 403 Access Denied page inline for the wrong role —
  never a redirect to login).
- `ApiError` (`src/api/ApiError.ts`) normalizes the backend error payload,
  tolerates `"fieldErrors": null`, maps network failures/timeouts to a
  friendly message, and surfaces `fieldErrors` (HTTP 400) in the forms.

## Routes

There is exactly one dashboard: `/dashboard` renders role-specific content
(USER → own tickets, MANAGER → assigned tickets, ADMIN → system overview).

| Route            | Access              | Purpose                                  |
| ---------------- | ------------------- | ---------------------------------------- |
| `/login`         | Public              | Sign in                                  |
| `/register`      | Public              | Create account                           |
| `/dashboard`     | Any role            | Shared role-aware dashboard              |
| `/tickets`       | Any role            | My Tickets (USER/MANAGER own, ADMIN all) |
| `/tickets/new`   | USER, MANAGER       | Create ticket (ADMIN gets 403)           |
| `/tickets/:id`   | Any role            | Ticket details (+ approve/reject for managers on assigned tickets, delete for admins) |
| `/assigned`      | MANAGER             | Tickets from assigned users              |
| `/categories`    | ADMIN               | Category management                      |
| `/admin/users`   | ADMIN               | User management (enable/disable, manager assignment) |
| `/profile`       | Any role            | Read-only employee profile (hardcoded per role, no API) |
| `/403`           | Public              | Access Denied                            |

## API error handling

The backend returns errors shaped as:

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "...",
  "fieldErrors": { "field": "reason" }
}
```

- `400` → field-level errors are shown beneath the relevant inputs.
- `401` → session cleared, redirect to `/login`.
- `403` → inline 403 page; the session is kept.
- `404` → "not found" empty state on detail pages.
- `409` / `500` → the server message (or a generic fallback) is shown.
- Network failure / timeout → "Unable to connect to the server…".
- List/detail load errors carry a **Retry** action (`ErrorBanner`).

## Project structure

```
src/
├── api/            # Axios instance, interceptors, ApiError, envelope helper
├── components/
│   ├── auth/       # Login/register inputs, alerts, submit button
│   ├── badges/     # SLA / priority / status badges
│   ├── common/     # PageHeader, dialogs, banners, loaders, comments
│   ├── forms/      # Category & ticket form dialogs
│   ├── guards/     # ProtectedRoute, PublicRoute, RoleRoute
│   ├── layout/     # AppLayout (topbar) + role-based Sidebar
│   └── tickets/    # TicketList table
├── context/        # useAuth / hydration helpers, theme mode context
├── pages/          # auth / dashboard / tickets / categories / admin / profile / errors
├── schemas/        # Zod validation (auth, ticket, category, comment)
├── services/       # auth.api, ticket.api, category.api, user.api, dashboard.api
├── stores/         # authStore (persisted), themeStore
├── types/          # auth, ticket, user, category, api types
├── utils/          # routes, navigation menu, constants, messages, formatting,
│                   # validation rules, employee profiles (hardcoded)
└── theme.ts        # Material UI theme
```

## Notes

- SLA is display-only: the backend provides `createdDate`, `slaDeadline` and
  `breached`; the UI renders an `OK` or `BREACHED` badge.
- Ticket statuses follow `OPEN → IN_PROGRESS → CLOSED` (status advance on the
  detail page for managers/admins); approval/rejection is manager-only on
  assigned users' tickets and never on a manager's own ticket.
- The category list shows a `ticketCount` when the backend includes it;
  otherwise the ticket count for a category is visible on its detail page.
- The `/profile` page is frontend-only placeholder data per role
  (`src/utils/employeeProfiles.ts`) — no backend API involved.
