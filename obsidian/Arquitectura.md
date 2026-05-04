# Arquitectura de la Aplicación

## Vista General (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO FINAL                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Browser (React)
                         │
┌─────────────────────────┴────────────────────────────────────┐
│                    APLICACIÓN WEB                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │   Vistas    │  │  Componentes│  │   State Mgmt     │    │
│  │  (Pages)    │→ │  (Atomic)   │→ │  (Zustand/RQ)    │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
└──────────────────────────┬─────────────────────────────────┘
                           │
                   Supabase Client SDK
                           │
                    Internet / HTTP
                           │
┌──────────────────────────┴─────────────────────────────────┐
│               BACKEND + DATABASE (Supabase)                 │
│  ┌─────────────────┐  ┌──────────────────────────────┐    │
│  │  Auth (Google)  │  │  PostgreSQL Database         │    │
│  │  OAuth          │  │  (usuarios, cuentas, etc)    │    │
│  └─────────────────┘  └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## Capas de la Aplicación

### 1. **Capa de Presentación** (UI/Componentes)
- Componentes React organizados en [[Componentes|Atomic Design]]
- Sistema de temas claro/oscuro usando `styled-components`
- Diseño responsivo (mobile-first)

Ver: [[Componentes]]

### 2. **Capa de Estado (State Management)**
- **Local State**: React hooks y context
- **Global State**: [[Stores Zustand]] (Zustand)
- **Server State**: [[React Query]] (TanStack Query)

Ver: [[Stores Zustand]], [[React Query]]

### 3. **Capa de Lógica (Hooks y Context)**
- [[Hooks y Context]] personalizados
- [[Flujo de Autenticación|Autenticación]]
- Loading states y manejo de errores

Ver: [[Hooks y Context]], [[Flujo de Autenticación]]

### 4. **Capa de Datos**
- [[Supabase y CRUD|Operaciones CRUD]]
- Esquemas de validación Zod
- Sincronización con servidor

Ver: [[Supabase y CRUD]], [[Validación y Schemas]]

---

## Patrón de Flujo Arquitectónico

```
Usuario Interactúa con Componente
          ↓
Componente dispara Handler (onClick, onChange, etc)
          ↓
Handler llama a Store (Zustand) o Query (React Query)
          ↓
Store/Query realiza operación (fetch/mutate)
          ↓
Supabase executa en servidor (Auth o CRUD)
          ↓
Respuesta actualiza State
          ↓
Componente se re-renderiza con nuevo estado
```

---

## Decisiones Arquitectónicas Clave

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Framework** | React 19 | Moderno, componentes funcionales, hooks |
| **State Management** | Zustand + React Query | Simple, performante, separación de concerns |
| **Backend** | Supabase | PostgreSQL, Auth integrado, Real-time ready |
| **Estilos** | Styled Components | CSS-in-JS, temas dinámicos |
| **Componentes** | Atomic Design | Reutilizable, escalable, mantenible |
| **Validación** | Zod | Type-safe, schemas, errores descriptivos |
| **Routing** | React Router v7 | Moderno, nested routes, protected routes |

---

## Estructura de Directorios

Ver: [[Distribución de Carpetas]]

---

## Relaciones entre Entidades

```
Usuario (Auth)
    ├── Cuentas Bancarias
    │   ├── Movimientos
    │   │   └── Categorías
    │   └── Saldos
    ├── Categorías (global)
    ├── Conexiones (integraciones externas)
    └── Configuración (tema, preferencias)
```

---

## Flujo de Datos Principal

1. **Login**: Usuario se autentica con Google → Supabase crea sesión
2. **App Inicializa**: `AuthContextProvider` + `AuthStore` se cargan
3. **Usuario Navega**: Routes protegidas con `ProtectedRoute` hook
4. **Interacción**: Usuario realiza acción (crear movimiento, filtrar, etc)
5. **API Call**: Componente llama a Store → Supabase → Respuesta
6. **Actualización**: React Query cachea y UI se actualiza

Ver: [[Flujo de Datos]], [[Flujo de Autenticación]], [[React Query]]

---

## Relaciones de Notas

- [[Stack Tecnológico]] - qué tecnologías se usan
- [[Distribución de Carpetas]] - dónde está cada cosa
- [[Componentes]] - cómo se organizan visualmente
- [[Stores Zustand]] - cómo se maneja el estado
- [[Supabase y CRUD]] - cómo interactúa con el servidor
