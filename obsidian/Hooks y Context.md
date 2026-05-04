# Hooks y Context

La aplicación usa dos mecanismos de estado compartido: **React Context** para autenticación y **Custom Hooks** para lógica específica.

Ver: [[Distribución de Carpetas#🪝 src/hooks/ - Hooks y Context]]

---

## 📍 React Context

### AuthContext - Gestión de Autenticación

**Ubicación**: `src/context/AuthContent.tsx`

#### Propósito
Proveer información del usuario autenticado a toda la aplicación.

#### Componentes

**1. AuthContextProvider**
```typescript
<AuthContextProvider>
  {children}
</AuthContextProvider>
```

- Escucha cambios de sesión de Supabase
- Extrae datos del usuario (nombre, foto)
- Inserta/actualiza usuario en la BD
- Redirige a login si no hay sesión

**2. Hook useUserAuth()**
```typescript
const { user } = useUserAuth();
// user: { name: string; picture: string } | null
```

#### Flujo

```
Supabase Auth Change Event
        ↓
AuthContextProvider detecta
        ↓
Extrae metadata (name, picture)
        ↓
Llama a InsertarUsuarios()
        ↓
Actualiza AuthContext.Provider
        ↓
Componentes con useUserAuth() se actualizan
```

#### Uso
```typescript
import { useUserAuth } from './index';

function MyComponent() {
  const { user } = useUserAuth();

  if (!user) return <Login />;
  return <div>Hola {user.name}</div>;
}
```

---

### LoadingContext - Estado Global de Carga

**Ubicación**: `src/context/LoadingContext.tsx`

#### Propósito
Mostrar loader global cuando la app está cargando datos.

#### Hook useLoading()
```typescript
const { isLoading, setIsLoading } = useLoading();
```

#### Uso
```typescript
// En un componente
const { setIsLoading } = useLoading();

useEffect(() => {
  setIsLoading(true);
  fetchData().finally(() => setIsLoading(false));
}, []);
```

---

## 🪝 Custom Hooks (Ganchos Personalizados)

### ProtectedRoute Hook

**Ubicación**: `src/hooks/ProtectedRoute.tsx`

#### Propósito
Proteger rutas para que solo usuarios autenticados pueden acceder.

#### Props
```typescript
interface ProtectedRouteProps {
  user: unknown;              // Usuario actual
  isLoading: boolean;         // Si está cargando
  redirectTo: string;         // Ruta a redirigir (ej: "/login")
  children?: ReactNode;       // Contenido si props
}
```

#### Uso en Routing
```typescript
// En src/routers/routes.tsx
<Route element={<ProtectedRoute user={user} redirectTo="/" isLoading={isLoading} />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/cuentas" element={<Cuentas />} />
</Route>
```

#### Lógica
```
¿Usuario está cargando?
  → Mostrar SpinnerLoader

¿Usuario no autenticado?
  → Redirigir a "/login"

¿Autenticado?
  → Renderizar Outlet (rutas anidadas)
```

---

## 🔐 Flujo de Autenticación

Ver: [[Flujo de Autenticación]]

```
Usuario hace click Login
        ↓
AuthStore.signInWithGoogle()
        ↓
Supabase OAuth redirect a Google
        ↓
Usuario autoriza
        ↓
Google redirige a Supabase callback
        ↓
Supabase crea sesión
        ↓
AuthContextProvider detecta onAuthStateChange
        ↓
Inserta usuario en DB
        ↓
useUserAuth() actualiza
        ↓
App muestra dashboard
```

---

## 🎣 Patrón de Hooks en Componentes

### Usar múltiples hooks juntos

```typescript
function MiComponente() {
  // Auth
  const { user } = useUserAuth();

  // Loading
  const { isLoading, setIsLoading } = useLoading();

  // Store state
  const { movimientos } = useMovimientosStore();

  // React Query
  const { data } = useQuery({...});

  // Local state
  const [filter, setFilter] = useState('');

  return (
    <div>
      {isLoading && <Spinner />}
      {movimientos.map(...)}
    </div>
  );
}
```

---

## 📊 Comparación: Context vs Zustand vs React Query

| Aspecto | Context | Zustand | React Query |
|---------|---------|---------|-------------|
| **Propósito** | Share user data | Global client state | Server state caching |
| **Ejemplo** | User info | Categories list | API responses |
| **Re-renders** | Todo el tree | Solo subscribers | Solo consumers |
| **Complejidad** | Media | Baja | Media |
| **Async** | Manual | Soporta | Nativo |

### En la Práctica

```typescript
// Context - Información del usuario
const { user } = useUserAuth();  // Global, no cambia frecuentemente

// Zustand - Estado de filtros
const { filtro } = useCuentasStore();  // Global, común en la app

// React Query - Datos de API
const { data: cuentas } = useQuery({  // Server state, puede cambiar
  queryKey: ['cuentas'],
  queryFn: obtenerCuentas
});
```

---

## 🔄 Actualizar Estado desde un Hook

### Con Zustand (Store)
```typescript
const { setCuentas } = useCuentasStore();

const handleCrearCuenta = async (data: CuentaData) => {
  const nuevaCuenta = await crearCuenta(data);
  setCuentas([...cuentas, nuevaCuenta]);
};
```

### Con React Query
```typescript
const { mutate: crearCuenta } = useMutation({
  mutationFn: (data: CuentaData) => crearCuentaAPI(data),
  onSuccess: (nuevaCuenta) => {
    queryClient.invalidateQueries({ queryKey: ['cuentas'] });
  }
});
```

---

## ⚠️ Errores Comunes

### ❌ Usar Context para estado que cambia frecuentemente
```typescript
// MAL - Context
const { filtro } = useFilterContext();  // Re-renderiza TODO

// BIEN - Zustand o local state
const { filtro } = useFilterStore();  // Solo components que lo usan
```

### ❌ Olvidar el Provider
```typescript
// MAL - useUserAuth() sin AuthContextProvider
function App() {
  const { user } = useUserAuth();  // Error: must be within provider
}

// BIEN
function App() {
  return (
    <AuthContextProvider>
      <MyComponent />
    </AuthContextProvider>
  );
}
```

### ❌ Props drilling (pasar props sin fin)
```typescript
// MAL
<ComponentA user={user}>
  <ComponentB user={user}>
    <ComponentC user={user} />
  </ComponentB>
</ComponentA>

// BIEN - Usa hook
function ComponentC() {
  const { user } = useUserAuth();
}
```

---

## 🔗 Relaciones de Notas

- [[Flujo de Autenticación]] - cómo funciona el login paso a paso
- [[Stores Zustand]] - para estado global no-auth
- [[React Query]] - para server state
- [[Componentes]] - cómo usar hooks en componentes
- [[Arquitectura]] - state management en la arquitectura general
