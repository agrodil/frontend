# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check (tsc -b) + Vite production build
npm run lint      # Run ESLint across all files
npm run preview   # Preview production build locally
```

There is no test suite configured.

## Architecture

This is a React 19 + TypeScript SPA (deployed to Vercel) for an agricultural livestock marketplace. Users can browse/create livestock listings, manage their profile, and receive real-time notifications.

**Key libraries:** React Router DOM 7 (routing + data loading), Tailwind CSS 4, Framer Motion, Socket.IO Client, Zod.

### Data Flow Pattern

Data fetching follows React Router's **loader/action** pattern — routes declare loaders that fetch data before the component renders, and actions handle mutations (form submissions). This means most data-fetching logic lives in `src/routes/loaders/` and `src/routes/actions/`, not inside components.

### Authentication

`AuthProvider` (`src/context/AuthProvider.tsx`) manages the session lifecycle:
- User state stored in localStorage (persistent) or sessionStorage (temporary)
- All authenticated API calls go through `fetchWithAuth()` (`src/services/api/fetchWithAuth.ts`), which automatically refreshes the token on 401 and retries, with request queuing to prevent duplicate refresh calls
- The `ProtectedLayout` (`src/routes/private/ProtectedLayout.tsx`) redirects unauthenticated users to `/login`

### Real-Time Notifications

`NotificationsSocket.ts` (`src/services/api/`) is a singleton Socket.IO client that connects on login, disconnects on logout, and auto-reconnects with credential refresh on error. Unread count is exposed globally via `UnreadCountContext`.

### Route Structure

- **Public:** `/` (landing), `/login` (auth flow), `/posts` (browse listings), `*` (404)
- **Private (behind ProtectedLayout):** `/me` (profile), `/notifications`, `/new-post`

### Folder Purposes

| Path | Purpose |
|---|---|
| `src/views/` | Page-level components (split into `public/` and `private/`) |
| `src/components/ui/` | Reusable UI components (Button, Form, CardPost, etc.) |
| `src/components/layout/` | App shell components (Navbar, Footer, RootLayout) |
| `src/routes/` | Router config, loaders, and actions |
| `src/services/api/` | API client modules + `fetchWithAuth` + WebSocket |
| `src/context/` | React Context definitions and providers |
| `src/interfaces/` | TypeScript type definitions organized by domain |
| `src/constants/` | Static lookup data (breeds, sale types, townships, etc.) |
| `src/utils/` | Pure helper functions |

### Environment Variables

Use `import.meta.env.VITE_*` for environment variables (Vite convention). The API base URL is `VITE_API_BASE_URL` (defaults to `http://localhost:3000/api`).

### Styling

Tailwind CSS 4 with a custom ITC Avant Garde font family loaded via `@font-face` in `src/index.css`. Custom font classes are available as Tailwind utilities.
