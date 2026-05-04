# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Run
- Develop: `npm run dev`
- Build: `npm run build`
- Preview Build: `npm run preview`

### Code Quality & Testing
- Lint: `npm run lint`
- Lint Fix: `npm run lint:fix`
- Run Tests: `npm test`
- Test UI: `npm run test:ui`
- Test Coverage: `npm run test:coverage`

### Database & Types
- Generate Supabase Types: `npm run gen:types` (Requires `SUPABASE_PROJECT_ID` env var)

## Architecture & Structure

### High-Level Stack
- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand (global store), TanStack Query (server state)
- **Styling**: Styled Components, MUI (Material UI), Emotion
- **Backend/Database**: Supabase (PostgreSQL, Auth via Google OAuth)
- **Validation**: Zod

### Project Structure
- `src/components/`: Follows Atomic Design (atomos, moleculas, organismos, templates).
- `src/pages/`: Page-level components mapping to routes.
- `src/store/`: Zustand stores for managing application state (Auth, Categorias, Cuentas, Movimientos, etc.).
- `src/supabase/`: Supabase client configuration and CRUD operation helpers.
- `src/hooks/`: Custom React hooks and logic (including `ProtectedRoute.tsx`).
- `src/schemas/`: Zod validation schemas.
- `src/types/`: TypeScript type definitions, including generated Supabase types.
- `src/utils/`: Shared utility functions.

### Key Architectural Patterns
- **State Synchronization**: Uses a combination of Zustand for client-side state and TanStack Query for efficient server-state synchronization with Supabase.
- **Atomic Design**: Components are organized by complexity from atoms to templates.
- **Security**: Implementation includes Zod validation for inputs, encrypted LocalStorage for sensitive data, and session management.
- **Routing**: Managed via `react-router-dom` with protected routes for authenticated access.
