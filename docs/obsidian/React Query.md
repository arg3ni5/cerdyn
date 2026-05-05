# React Query - Server State Management

React Query (TanStack Query) gestiona el estado del servidor: datos que vienen de APIs/BD.

Ver: [[Arquitectura#Capas de la Aplicación]]

---

## 🎯 Qué es React Query

- Librería para **server state management**
- Distinto de Zustand (que es client state)
- Maneja caching, sincronización, invalidación automática
- Basada en hooks (`useQuery`, `useMutation`)

---

## 📊 Comparación: Server State vs Client State

| Aspecto | Server State (Query) | Client State (Zustand) |
|---------|-------------------|----------------------|
| **Origen** | Base de datos / API | Navegación, UI, filtros |
| **Durabilidad** | Persiste en servidor | Temporal, por sesión |
| **Sincronización** | Requiere refetch | Actualización instantánea |
| **Ejemplo** | Lista de movimientos | Filtro seleccionado |

---

## 🪝 Hooks Principales

### useQuery - Leer Datos

```typescript
const { data, isLoading, error, isFetching } = useQuery({
  queryKey: ["cuentas"],           // Clave para cache
  queryFn: () => obtenerCuentas(), // Función a ejecutar
  staleTime: 5 * 60 * 1000,        // Cache válido 5 min
  gcTime: 10 * 60 * 1000,          // Mantener en memoria 10 min
});

// Usar datos
{isLoading && <SpinnerLoader />}
{error && <ErrorMessage error={error} />}
{data && data.map(c => <CuentaCard {...c} />)}
```

#### Opciones Útiles

```typescript
useQuery({
  queryKey: ["movimientos", filtros],
  queryFn: () => obtenerMovimientos(filtros),

  // Cuándo refetch
  staleTime: 5 * 60 * 1000,        // Datos frescos 5 min
  gcTime: 10 * 60 * 1000,          // Limpiar después 10 min
  refetchOnWindowFocus: true,      // Refetch cuando usuario vuelve
  refetchOnReconnect: true,        // Refetch si reconecta
  retry: 1,                        // Reintentos en error
  retryDelay: 1000,                // Delay entre reintentos

  // Cuándo ejecutar
  enabled: usuarioId !== null,     // Solo si existe userId
});
```

---

### useMutation - Modificar Datos

```typescript
const { mutate, mutateAsync, isPending, error } = useMutation({
  mutationFn: (nuevoMovimiento) => crearMovimientoAPI(nuevoMovimiento),

  onSuccess: (data) => {
    // Se ejecuta en éxito
    queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    showSuccessMessage("Movimiento creado");
  },

  onError: (error) => {
    // Se ejecuta en error
    showErrorMessage(error.message);
  }
});

// Usar en un handler
const handleCrear = async () => {
  mutateAsync(nuevoMovimiento)
    .then(() => cerrarModal())
    .catch(() => {});
};

// Versión simple
<button onClick={() => mutate(nuevoMovimiento)}>
  Guardar
</button>

{isPending && <Spinner />}
```

En mutations, `Spinner` es local porque solo bloquea la acción actual. En queries de página, preferir `SpinnerLoader` para cubrir toda la ruta.

---

## 🏗️ Configuración Global

**Archivo**: `src/config/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutos
      gcTime: 1000 * 60 * 10,        // 10 minutos
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
    }
  }
});
```

### Integración en App

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* App aquí */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

---

## 📋 Ejemplo Práctico: Dashboard

```typescript
// src/pages/Dashboard.tsx

export const Dashboard = () => {
  // Query 1: Obtener movimientos
  const { data: movimientos, isLoading: loadingMov } = useQuery({
    queryKey: ["movimientos"],
    queryFn: async () => {
      const { data } = await supabase
        .from('movimientos')
        .select('*')
        .order('fecha', { ascending: false });
      return data;
    },
    staleTime: 5 * 60 * 1000
  });

  // Query 2: Obtener cuentas
  const { data: cuentas, isLoading: loadingCuentas } = useQuery({
    queryKey: ["cuentas"],
    queryFn: async () => {
      const { data } = await supabase
        .from('cuentas')
        .select('*');
      return data;
    }
  });

  // Mutation: Crear movimiento
  const { mutate: crearMovimiento } = useMutation({
    mutationFn: async (movimiento: MovimientoInput) => {
      const { data } = await supabase
        .from('movimientos')
        .insert([movimiento])
        .select()
        .single();
      return data;
    },
    onSuccess: () => {
      // Invalida query para refetch automático
      queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    }
  });

  if (loadingMov || loadingCuentas) return <SpinnerLoader />;

  return (
    <Dashboard>
      <CardTotales cuentas={cuentas} />
      <TablaMovimientos movimientos={movimientos} />
      <RegistrarMovimientos onCreate={crearMovimiento} />
    </Dashboard>
  );
};
```

### Loading en Páginas

Para queries que determinan si una ruta puede mostrarse, el patrón es devolver `SpinnerLoader` desde la página o template:

```typescript
const { isLoading, error } = useQuery({
  queryKey: ["mostrar cuentas", selectTipoCuenta, usuario?.id],
  queryFn: () => mostrarCuentas(params),
  enabled: !!usuario?.id,
});

if (isLoading || !usuario?.id) return <SpinnerLoader />;
if (error) return <ErrorMessage error={error} />;

return <CuentasTemplate data={cuentas} />;
```

En `InformesTemplate`, además del `isLoading` de React Query, se mantiene un loading visual mínimo de `500ms` para evitar que el loader parpadee o desaparezca antes de ser perceptible.

```typescript
if (showMinimumLoading || isLoadingMovimientos || !idusuario) {
  return <SpinnerLoader />;
}
```

---

## 🔄 Invalidación y Refetch

### Invalidar y Refetch

```typescript
// Invalidar query
queryClient.invalidateQueries({ queryKey: ["movimientos"] });

// Invalidar múltiples
queryClient.invalidateQueries({ queryKey: ["movimientos"] });
queryClient.invalidateQueries({ queryKey: ["cuentas"] });

// Invalidar todas (nuclear option)
queryClient.invalidateQueries();
```

### En Mutation onSuccess

```typescript
const { mutate } = useMutation({
  mutationFn: crearMovimiento,
  onSuccess: (nuevoMovimiento) => {
    // Opción 1: Invalidar
    queryClient.invalidateQueries({ queryKey: ["movimientos"] });

    // Opción 2: Update manual
    queryClient.setQueryData(
      ["movimientos"],
      (old) => [...old, nuevoMovimiento]
    );
  }
});
```

---

## 📊 React Query vs Zustand

### Cuándo usar cada uno

```typescript
// QUERY (Server State) - Datos del servidor
const { data: movimientos } = useQuery({
  queryKey: ["movimientos"],
  queryFn: obtenerMovimientos,
  staleTime: 5 * 60 * 1000
});

// ZUSTAND (Client State) - Estado de UI
const { filtroCategoria, setFiltro } = useCuentasStore();

// COMBINED - Filtrar datos obtenidos
const movimientosFiltrados = movimientos?.filter(m =>
  filtroCategoria ? m.categoria_id === filtroCategoria : true
);
```

---

## ⚠️ Errores Comunes

### ❌ Olvidar invalidateQueries

```typescript
// MAL - No refetch después
const { mutate } = useMutation({
  mutationFn: crearMovimiento,
  onSuccess: () => {
    showSuccess("Creado");
    // No invalida! Data vieja en caché
  }
});

// BIEN
const { mutate } = useMutation({
  mutationFn: crearMovimiento,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["movimientos"] });
  }
});
```

### ❌ N+1 Queries

```typescript
// MAL
const { data: cuentas } = useQuery(...);
{cuentas?.map(c => {
  const { data: mov } = useQuery("movimientos-" + c.id); // N queries
})}

// BIEN
const { data: cuentas } = useQuery({
  select() => select(`*, movimientos(*)`)
});
```

---

## 🔗 Relaciones de Notas

- [[Stack Tecnológico]] - React Query en tech stack
- [[Flujo de Datos]] - cómo se integra con el flujo
- [[Stores Zustand]] - diferencia server vs client state
- [[Supabase y CRUD]] - dónde ejecuta las queries
- [[Componentes]] - cómo se usan en componentes
