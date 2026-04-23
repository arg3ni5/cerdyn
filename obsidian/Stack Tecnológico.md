# Stack Tecnológico

## Frontend

### Frameworks y Librerías Principales

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **React** | 19.0.0 | Framework UI principal |
| **TypeScript** | 5.8.2 | Type safety y mejor DX |
| **Vite** | 6.1.1 | Build tool y dev server rápido |
| **React Router** | 7.2.0 | Routing y navegación |

### State Management

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Zustand** | 5.0.3 | Global state (Auth, Categorías, Cuentas, etc) |
| **TanStack Query (React Query)** | 5.66.9 | Server state + caching |
| **React Context** | Built-in | Auth context provider |

### Estilos

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Styled Components** | 6.1.15 | CSS-in-JS, temas dinámicos |
| **Emotion** | 11.14.0 | Styling library (usado por MUI) |
| **Material UI** | 6.4.5 | Componentes pre-construidos |

### Utilidades y Helpers

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Zod** | 4.3.6 | Validación de esquemas y type safety |
| **Day.js** | 1.11.13 | Manejo de fechas |
| **Chart.js** | 4.4.8 | Gráficos y visualizaciones |
| **React ChartJS 2** | 5.3.0 | Integración de Chart.js con React |
| **React Hook Form** | 7.54.2 | Gestión de formularios |
| **React Icons** | 5.5.0 | Librería de iconos |
| **Swiper** | 11.2.6 | Carruseles y sliders |
| **Emoji Picker** | 4.12.0 | Selector de emojis para acá |
| **React Color** | 2.19.3 | Selector de colores |
| **Sweet Alert 2** | 11.17.2 | Alertas personalizadas |

---

## Backend

### Base de Datos y Auth

| Tecnología | Propósito |
|------------|----------|
| **Supabase** | BaaS completo (PostgreSQL + Auth + Realtime) |
| **PostgreSQL** | Base de datos relacional |
| **Google OAuth** | Autenticación social |

### Operaciones CRUD

```typescript
// Cada entidad tiene un archivo CRUD en src/supabase/
├── crudUsuarios.tsx
├── crudCuentas.tsx
├── crudCategorias.tsx
├── crudMovimientos.tsx
├── crudConexiones.tsx
└── crudMovimientosRecurrentes.tsx
```

---

## Desarrollo y Testing

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **Vitest** | 4.0.18 | Unit testing |
| **Testing Library** | React 16.3.2 | Testing de componentes |
| **ESLint** | 9.21.0 | Linting |
| **ts-standard** | 12.0.2 | Code standards TypeScript |

---

## Patrones y Convenciones

### TypeScript + Zod
```typescript
// Definir schema
const UsuarioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string().email()
});

// Inferir tipo
type Usuario = z.infer<typeof UsuarioSchema>;
```

### React Query + Zustand

```typescript
// React Query: server state
const { data, isLoading } = useQuery({
  queryKey: ['cuentas'],
  queryFn: () => obtenerCuentas()
});

// Zustand: global state
const cuenta = useCuentasStore((state) => state.cuenta);
```

### Styled Components + Temas

```typescript
const Container = styled.div`
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.bg};
`;
```

---

## Flujo de Datos Técnico

```
React Component
    ↓
useQuery / useStore (Hook)
    ↓
Supabase Client SDK
    ↓
REST API → PostgreSQL
    ↓
Response → Cache (React Query)
    ↓
State Update → Re-render
```

---

## Dependencias Críticas

**Sin estas librerías, la app NO funciona:**
- React + React DOM
- Zustand (state)
- Supabase (backend)
- React Router (routing)
- Styled Components (estilos)
- Zod (validación)
- TanStack Query (server state)

---

## Versiones de Node

```json
"engines": {
  "node": ">=20.0.0"
}
```

> Requiere Node 20 o superior

---

## Scripts de Comandos

Ver: [[CLAUDE.md]] para detalles completos de los comandos disponibles

```bash
npm run dev              # Desarrollo con Vite
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # Verificar code standards
npm run lint:fix         # Auto-fix linting issues
npm test                 # Ejecutar tests
npm run test:ui          # UI para tests
npm run test:coverage    # Coverage report
npm run gen:types        # Generar tipos de Supabase
```

---

## Relaciones de Notas

- [[Arquitectura]] - cómo se integran estas tecnologías
- [[Componentes]] - cómo se usan en los componentes
- [[Stores Zustand]] - patrón de state con Zustand
- [[Supabase y CRUD]] - integración con backend
- [[Validación y Schemas]] - Zod schemas
