# Patrones y Convenciones

Estándares de código y patrones utilizados en toda la aplicación.

---

## 🏗️ Patrones Arquitectónicos

### Patrón: Atomic Design

Componentes organizados por nivel de complejidad:

```
Átomos (UI básicos) → Moléculas (combinación) →
Organismos (logica) → Templates (layout) → Páginas
```

Ver: [[Componentes]]

---

### Patrón: Store Actions

En Zustand, cada acción que modifica estado:

```typescript
// ❌ MAL - Modificar state directamente
setState(nuevoDatos);

// ✅ BIEN - Vía acción con lógica
agregarElemento: (elemento) => {
  // Validar
  const validado = Schema.parse(elemento);
  // Crear en BD
  const resultado = await crearEnBD(validado);
  // Actualizar estado
  setState(...)
}
```

---

### Patrón: Error Handling

Todos los async deben manejar errores:

```typescript
// ❌ MAL
const datos = await obtenerDatos();

// ✅ BIEN
try {
  const datos = await obtenerDatos();
  // Usar datos
} catch (error) {
  logger.error('Error:', error);
  showErrorMessage(error.message);
}
```

---

### Patrón: Validation + Type Safety

Siempre validar datos externos + inferir tipos:

```typescript
// ❌ MAL
type MovimientoInput = { monto: number; ... };
const agregar = (data: MovimientoInput) => { ... };

// ✅ BIEN
const MovimientoInputSchema = z.object({ ... });
type MovimientoInput = z.infer<typeof MovimientoInputSchema>;

const agregarMovimiento = (data: unknown) => {
  const validado = MovimientoInputSchema.parse(data);
  // Ahora TypeScript sabe que validado es seguro
};
```

---

## 📝 Convenciones de Nombres

### Archivos y Carpetas

```
// Componentes: PascalCase
BtnCerrar.tsx
InputBuscador.tsx
TablaMovimientos.tsx

// Hooks: camelCase o PascalCase con "use" prefix
useAuthStore.ts ← Zustand stores
useUserAuth() ← Custom hooks
ProtectedRoute.tsx ← Componentes hook-like

// Utilidades: camelCase
encryption.ts
logger.ts
messages.ts

// Schemas: PascalCase con "Schema" suffix
MovimientoSchema.ts
CuentaSchema.ts
UsuarioSchema.ts

// Estilos: camelCase o PascalCase.styles.ts
Button.styles.ts
card.styles.ts
```

### Variables y Funciones

```typescript
// Constants: UPPER_SNAKE_CASE
const API_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// Functions: camelCase
const obtenerMovimientos = () => {};
const crearCategoria = (data) => {};

// Variables: camelCase
let movimientos = [];
const saldoTotal = 1000;

// React Components: PascalCase
function Dashboard() {}
function TablaMovimientos() {}

// Boolean: \"is\", \"has\", \"can\" prefix
const isLoading = true;
const hasError = false;
const canDelete = user.isAdmin;
```

---

## 🎯 Patrón: Flujo de Datos Unidireccional

Siempre seguir este flujo:

```
UI (Componente)
    ↓
Store Action / Query
    ↓
Validación (Zod)
    ↓
API Call (Supabase)
    ↓
Response
    ↓
Update State
    ↓
Re-render UI
```

Ver: [[Flujo de Datos]]

---

## 🔒 Patrón: Seguridad

### Validación en Capas

```typescript
// Capa 1: Validar en cliente (Zod)
const validado = MovimientoSchema.parse(formData);

// Capa 2: Validar en servidor (Supabase RLS)
SELECT * FROM movimientos
WHERE usuario_id = auth.uid();  -- RLS policy

// Capa 3: BD constraints
ALTER TABLE movimientos
ADD CONSTRAINT positive_monto
CHECK (monto > 0);
```

### Datos Sensibles

```typescript
// ❌ MAL - Guardar en plaintext
localStorage.setItem('token', token);

// ✅ BIEN - Supabase lo encripta automáticamente
// Los tokens se guardan encriptados en localStorage
// Supabase lo maneja internamente
```

---

## 🔄 Patrón: State Synchronization

### Zustand + Supabase

```typescript
// ✅ La verdad está en Supabase
// El store es un cache del servidor

agregarMovimiento: async (movimiento) => {
  // 1. Insertar en BD (verdad)
  const { data, error } = await supabase
    .from('movimientos')
    .insert([movimiento]);

  if (error) throw error;

  // 2. Actualizar cache local
  set((state) => ({
    movimientos: [...state.movimientos, data]
  }));
}
```

### React Query Invalidation

```typescript
// Cuando hay mutations, invalidar para refetch
const { mutate } = useMutation({
  mutationFn: crearMovimiento,
  onSuccess: () => {
    // Invalida queries para refetch automático
    queryClient.invalidateQueries({
      queryKey: ['movimientos']
    });
  }
});
```

---

## 📊 Patrón: Async State Management

```typescript
// ❌ MAL - No maneja loading/error
const { data } = useQuery(...);
return <div>{data}</div>;

// ✅ BIEN - Maneja todos los estados
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <div>{data}</div>;
```

---

## 🎨 Patrón: Styled Components

### Estructura

```typescript
// Imports
import styled from 'styled-components';
import { Device } from '../../styles/breakpoints';

// Component
export const MyComponent = ({ title }) => (
  <Container>
    <Title>{title}</Title>
  </Container>
);

// Styled elements (al final)
const Container = styled.div`
  // Estilos
`;

const Title = styled.h2`
  // Estilos
`;
```

### Responsive Mobile-First

```typescript
const Container = styled.div`
  /* Mobile (default) */
  display: flex;
  flex-direction: column;

  /* Tablet+ */
  @media ${Device.tablet} {
    flex-direction: row;
    gap: 20px;
  }

  /* Desktop+ */
  @media ${Device.desktop} {
    max-width: 1200px;
    margin: 0 auto;
  }
`;
```

---

## 🧮 Patrón: Computation Memoization

```typescript
// ❌ MAL - Recalcula en cada render
const totalGastos = movimientos
  .filter(m => m.tipo === 'egreso')
  .reduce((sum, m) => sum + m.monto, 0);

// ✅ BIEN - Calcula solo si dependencias cambian
const totalGastos = useMemo(() =>
  movimientos
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0),
  [movimientos]
);
```

---

## 🔌 Patrón: Custom Hooks

Extraer lógica compleja a custom hooks:

```typescript
// Malo: Lógica en componente
function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Lógica de fetch y filtrado...
  }, [filtros]);

  return <div>...</div>;
}

// Bien: Lógica en hook
function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Lógica...
  }, [filtros]);

  return { movimientos, filtros, setFiltros, isLoading };
}

function Movimientos() {
  const { movimientos, filtros, setFiltros } = useMovimientos();
  return <div>...</div>;
}
```

---

## 🎯 Patrón: Props Interface

```typescript
// Siempre definir props interface
interface MyComponentProps {
  title: string;
  onClick: () => void;
  count?: number;  // Optional
  items: Item[];
}

export const MyComponent = ({
  title,
  onClick,
  count = 0,
  items
}: MyComponentProps) => {
  // Component body
};
```

---

## 📝 Patrón: Comments y Documentación

```typescript
// BAD - Comentario obvio
const x = 5; // Set x to 5

// GOOD - Comenta el WHY, no el WHAT
const MAX_RETRIES = 5; // Limit retries to avoid infinite loops

// GOOD - JSDoc para funciones complejas
/**
 * Calcula el saldo total de un usuario
 * @param usuarioId - ID del usuario
 * @returns Suma de todos los saldos de sus cuentas
 */
export const calcularSaldoTotal = (usuarioId: string) => {
  // Implementation
};
```

---

## 🧪 Patrón: Testing

```typescript
// Estructura de test
describe('MovimientosStore', () => {
  it('should add movement', () => {
    const store = useMovimientosStore.setState({});

    act(() => {
      store.agregarMovimiento(mockMovimiento);
    });

    expect(store.movimientos).toContain(mockMovimiento);
  });
});
```

---

## ✨ Resumen de Convenciones

| Aspecto | Convención | Ejemplo |
|---------|-----------|---------|
| **Componentes** | PascalCase | `BtnCerrar`, `TablaMovimientos` |
| **Functions** | camelCase | `obtenerMovimientos()` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| **Booleans** | `is/has/can` prefix | `isLoading`, `hasError` |
| **Files** | PascalCase (componentes) | `Button.tsx`, `useAuth.ts` |
| **Folders** | kebab-case o PascalCase | `src/components/` |
| **Styling** | Styled Components | `const Container = styled.div`` |
| **Validation** | Zod + infer types | `z.infer<typeof Schema>` |
| **Error Handling** | Try/catch + logger | `catch(error) { logger.error(...) }` |
| **Async** | IsLoading/error states | `const { isLoading, error }` |

---

## 🔗 Relaciones de Notas

- [[Componentes]] - aplicación de patrones en componentes
- [[Stores Zustand]] - patrones en stores
- [[Flujo de Datos]] - patrón unidireccional
- [[Validación y Schemas]] - patrones de validación
- [[Estilos y Temas]] - patrones de estilos
- [[Arquitectura]] - patrones arquitectónicos
