# Stores Zustand

Zustand es la librería elegida para **global state management**. Gestiona estado que es compartido por múltiples componentes sin usar Context o props drilling.

Ver: [[Distribución de Carpetas#🏪 src/store/ - State Management con Zustand]]

---

## 🎯 Qué es Zustand

- Librería minimalista de state management
- Alternativa simple a Redux
- Basada en hooks
- Triggers re-renders solo en componentes que usan valores específicas

---

## 📋 Stores Disponibles

### 1. AuthStore - Gestión de Autenticación

**Ubicación**: `src/store/AuthStore.tsx`

**Propósito**: Manejar login/logout con Google OAuth

#### Estado
```typescript
interface AuthStore {
  isAuth: boolean;                      // ¿Usuario autenticado?
  datauserGoogle: GoogleUserData[];     // Datos OAuth
  signInWithGoogle: () => Promise<...>; // Método login
  signout: () => Promise<void>;         // Método logout
}
```

#### Uso
```typescript
const { isAuth, signInWithGoogle, signout } = useAuthStore();

// Login
const handleLogin = async () => {
  const userData = await signInWithGoogle();
  if (userData) {
    // Redirigir
  }
};

// Logout
const handleLogout = async () => {
  await signout();
  // isAuth ahora es false
};
```

---

### 2. UsuariosStore - Datos del Usuario Actual

**Ubicación**: `src/store/UsuariosStore.tsx`

**Propósito**: Almacenar información del usuario logueado

#### Estado (probable)
```typescript
interface UsuariosStore {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario) => void;
  clearUsuario: () => void;
  ObtenerUsuarioActual: () => Promise<Usuario>;
}
```

#### Uso en App.tsx
```typescript
const { setUsuario, clearUsuario, ObtenerUsuarioActual } = useUsuariosStore();

const { data: usuario, error } = useQuery({
  queryKey: ["usuarioActual"],
  queryFn: ObtenerUsuarioActual,
  staleTime: 5 * 60 * 1000, // Cache 5 min
});

useEffect(() => {
  if (usuario) setUsuario(usuario);
}, [usuario]);
```

---

### 3. CuentasStore - Gestión de Cuentas Bancarias

**Ubicación**: `src/store/CuentaStore.tsx`

**Propósito**: CRUD de cuentas del usuario

#### Operaciones Típicas
```typescript
const {
  cuentas,              // Array de cuentas
  setCuentas,           // Actualizar lista
  agregarCuenta,        // Crear nueva cuenta
  eliminarCuenta,       // Eliminar cuenta
  actualizarCuenta,     // Editar cuenta
  obtenerCuentas        // Fetch desde BD
} = useCuentasStore();

// Crear
await agregarCuenta({ nombre: "Mi Cuenta", saldo: 1000 });

// Listar
await obtenerCuentas();

// Usar
cuentas.map(c => <CuentaCard key={c.id} cuenta={c} />)
```

---

### 4. CategoriasStore - Gestión de Categorías

**Ubicación**: `src/store/CategoriasStore.tsx`

**Propósito**: CRUD de categorías de gastos

#### Operaciones Típicas
```typescript
const {
  categorias,
  agregarCategoria,
  eliminarCategoria,
  obtenerCategorias
} = useCategoriasStore();

// Crear
await agregarCategoria({ nombre: "Comida", emoji: "🍔" });

// Listar
const allCategorias = await obtenerCategorias();

// Usar en formulario
<select>
  {categorias.map(c => <option key={c.id}>{c.nombre}</option>)}
</select>
```

---

### 5. MovimientosStore - Transacciones

**Ubicación**: `src/store/MovimientosStore.tsx`

**Propósito**: Gestionar movimientos (ingresos/egresos)

#### Operaciones
```typescript
const {
  movimientos,
  agregarMovimiento,
  eliminarMovimiento,
  editarMovimiento,
  filtrarMovimientos  // Filtrar por fecha, categoría, etc
} = useMovimientosStore();

// Crear ingreso
await agregarMovimiento({
  tipo: 'ingreso',
  monto: 5000,
  descripcion: 'Salario',
  fecha: new Date(),
  cuenta_id: 1,
  categoria_id: 5
});

// Filtrar
const movimientosComiida = filtrarMovimientos({
  categoria_id: 3
});
```

---

### 6. OperacionesStore - Cálculos y Agregados

**Ubicación**: `src/store/OperacionesStore.tsx`

**Propósito**: Operaciones complejas (totales, reportes)

#### Operaciones (probable)
```typescript
const {
  totalIngresos,    // Suma de todos los ingresos
  totalEgresos,     // Suma de todos los egresos
  saldoTotal,       // Diferencia ingresos - egresos
  agruparPorCategoria,
  calcularTendencia
} = useOperacionesStore();

// Usar en dashboard
<CardTotales
  ingresos={totalIngresos}
  egresos={totalEgresos}
  balance={saldoTotal}
/>
```

---

### 7. ConexionesStore - Integraciones Externas

**Ubicación**: `src/store/ConexionesStore.tsx`

**Propósito**: Gestionar conexiones a bancos/APIs externas

#### Operaciones (probable)
```typescript
const {
  conexiones,
  crearConexion,
  eliminarConexion,
  sincronizar  // Obtener datos del banco externo
} = useConexionesStore();
```

---

## 📐 Estructura de un Store

### Patrón Base

```typescript
import { create } from 'zustand';

interface MiStoreState {
  items: Item[];
  filtro: string;
  agregarItem: (item: Item) => void;
  setFiltro: (filtro: string) => void;
}

export const useMiStore = create<MiStoreState>((set) => ({
  // Estado inicial
  items: [],
  filtro: '',

  // Acciones
  agregarItem: (item: Item) =>
    set((state) => ({
      items: [...state.items, item]
    })),

  setFiltro: (filtro: string) =>
    set({ filtro })
}));
```

### Con Operaciones Async

```typescript
export const useCuentasStore = create<CuentasStore>((set) => ({
  cuentas: [],
  isLoading: false,

  obtenerCuentas: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchCuentasFromDB();
      set({ cuentas: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  agregarCuenta: async (cuenta: CuentaInput) => {
    const nueva = await insertarCuentaEnDB(cuenta);
    set((state) => ({
      cuentas: [...state.cuentas, nueva]
    }));
  }
}));
```

---

## 🔄 Patrón: Zustand + Supabase

### Flujo típico Create

```typescript
// En componente
const { agregarCuenta } = useCuentasStore();

const handleSubmit = async (data: CuentaData) => {
  try {
    await agregarCuenta(data);
    showSuccessMessage('Cuenta creada');
  } catch (error) {
    showErrorMessage('Error');
  }
};

// En store
agregarCuenta: async (cuenta: CuentaData) => {
  // 1. Enviar a Supabase
  const { data, error } = await supabase
    .from('cuentas')
    .insert([cuenta])
    .select()
    .single();

  if (error) throw error;

  // 2. Actualizar estado local
  set((state) => ({
    cuentas: [...state.cuentas, data]
  }));

  return data;
}
```

### Flujo típico Read

```typescript
// Store
obtenerCuentas: async () => {
  set({ isLoading: true });
  const { data, error } = await supabase
    .from('cuentas')
    .select('*');

  if (error) throw error;

  set({
    cuentas: data,
    isLoading: false
  });
}

// Componente
useEffect(() => {
  obtenerCuentas();
}, []);
```

### Flujo típico Update

```typescript
actualizarCuenta: async (id: string, updates: Partial<Cuenta>) => {
  const { data, error } = await supabase
    .from('cuentas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  set((state) => ({
    cuentas: state.cuentas.map(c =>
      c.id === id ? data : c
    )
  }));
}
```

### Flujo típico Delete

```typescript
eliminarCuenta: async (id: string) => {
  const { error } = await supabase
    .from('cuentas')
    .delete()
    .eq('id', id);

  if (error) throw error;

  set((state) => ({
    cuentas: state.cuentas.filter(c => c.id !== id)
  }));
}
```

---

## 🎯 Mejor Prácticas

### ✅ Qué Hacer

1. **Mantén stores enfocados**
   - Un store por dominio de datos
   - No mezcles usuarios con cuentas

2. **Usa nombres descriptivos**
   ```typescript
   // BIEN
   const { agregarCuenta } = useCuentasStore();

   // MAL
   const { add } = useCuentasStore();
   ```

3. **Valida antes de actualizar**
   ```typescript
   agregarCuenta: async (cuenta: CuentaInput) => {
     // Validar
     const validado = CuentaSchema.parse(cuenta);

     // Luego insertar
     const resultado = await insertarEnDB(validado);

     // Actualizar state
     set(...)
   }
   ```

### ❌ Qué Evitar

- ❌ Stores gigantes con mucha lógica
- ❌ Actualizar state sin actualizar BD
- ❌ No manejar errores
- ❌ Duplicar estado (en componente y store)

---

## 🔗 Relaciones de Notas

- [[Componentes]] - cómo usar stores en componentes
- [[Supabase y CRUD]] - dónde viven las operaciones BD
- [[React Query]] - alternativa para server state
- [[Flujo de Datos]] - cómo fluyen los datos con stores
- [[Arquitectura]] - papel de Zustand en la arquitectura
