# Supabase y CRUD

Supabase es el Backend-as-Service que proporciona base de datos PostgreSQL, autenticación y APIs.

Ver: [[Distribución de Carpetas#🗄️ src/supabase/ - Backend Integration]]

---

## 🏗️ Qué es Supabase

- PostgreSQL en la nube
- Autenticación integrada (Google OAuth)
- APIs REST/GraphQL automáticas
- Real-time subscriptions
- Storage de archivos
- Funciones serverless

---

## 🔧 Configuración

### Cliente Supabase

**Ubicación**: `src/supabase/supabase.config.tsx`

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

#### Uso
```typescript
import { supabase } from './supabase.config';

// Login
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// Query
const { data: cuentas, error } = await supabase
  .from('cuentas')
  .select('*');
```

---

## 📊 Tablas de Base de Datos

### 1. usuarios
```
id              - UUID (PK)
nombres         - string
foto            - URL string
idauth_supabase - UUID (FK de auth.users)
tema            - '0' (light) | '1' (dark)
created_at      - timestamp
```

### 2. cuentas
```
id         - UUID (PK)
usuario_id - UUID (FK → usuarios)
nombre     - string
tipo       - enum (banco, tarjeta, efectivo, etc)
saldo      - decimal
moneda     - string (USD, MXN, etc)
activa     - boolean
created_at - timestamp
updated_at - timestamp
```

### 3. categorias
```
id         - UUID (PK)
usuario_id - UUID (FK → usuarios)
nombre     - string
emoji      - string
color      - hex string
tipo       - enum (ingreso, egreso)
created_at - timestamp
```

### 4. movimientos
```
id              - UUID (PK)
usuario_id      - UUID (FK → usuarios)
cuenta_id       - UUID (FK → cuentas)
categoria_id    - UUID (FK → categorias)
tipo            - enum (ingreso, egreso)
monto           - decimal
descripcion     - string (opcional)
fecha           - date
created_at      - timestamp
updated_at      - timestamp
```

### 5. conexiones
```
id         - UUID (PK)
usuario_id - UUID (FK → usuarios)
tipo       - string (nombre de integración)
datos      - jsonb (credenciales encriptadas)
activa     - boolean
created_at - timestamp
```

---

## 🔄 Operaciones CRUD

Cada tabla tiene un archivo CRUD dedicado con funciones helper.

### Estructura Base

```typescript
// src/supabase/crudXXX.tsx

import { supabase } from './supabase.config';
import { MiTabla } from '../types/supabase';

/**
 * CREATE - Insertar nuevo registro
 */
export const InsertarXXX = async (
  data: MiTabla,
  usuarioId: string
): Promise<MiTabla | null> => {
  const { data: resultado, error } = await supabase
    .from('mi_tabla')
    .insert([{ ...data, usuario_id: usuarioId }])
    .select()
    .single();

  if (error) {
    console.error('Error al insertar:', error);
    return null;
  }

  return resultado;
};

/**
 * READ - Obtener registros
 */
export const ObtenerXXX = async (
  usuarioId: string
): Promise<MiTabla[] | null> => {
  const { data, error } = await supabase
    .from('mi_tabla')
    .select('*')
    .eq('usuario_id', usuarioId);

  if (error) {
    console.error('Error al obtener:', error);
    return null;
  }

  return data;
};

/**
 * UPDATE - Actualizar registro
 */
export const ActualizarXXX = async (
  id: string,
  updates: Partial<MiTabla>
): Promise<MiTabla | null> => {
  const { data, error } = await supabase
    .from('mi_tabla')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar:', error);
    return null;
  }

  return data;
};

/**
 * DELETE - Eliminar registro
 */
export const EliminarXXX = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('mi_tabla')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar:', error);
    return false;
  }

  return true;
};
```

---

## 📂 Archivos CRUD Disponibles

| Archivo | Propósito |
|---------|----------|
| `crudUsuarios.tsx` | Insertar, obtener, actualizar usuarios |
| `crudCuentas.tsx` | CRUD de cuentas bancarias |
| `crudCategorias.tsx` | CRUD de categorías |
| `crudMovimientos.tsx` | CRUD de movimientos/transacciones |
| `crudConexiones.tsx` | CRUD de integraciones externas |
| `crudMovimientosRecurrentes.tsx` | Movimientos recurrentes |

---

## 💡 Ejemplos Prácticos

### Insertar Categoría

```typescript
// En crudCategorias.tsx
export const InsertarCategoria = async (
  categoria: Categoria,
  usuarioId: string
) => {
  const { data, error } = await supabase
    .from('categorias')
    .insert([{
      usuario_id: usuarioId,
      nombre: categoria.nombre,
      emoji: categoria.emoji,
      color: categoria.color,
      tipo: categoria.tipo
    }])
    .select()
    .single();

  return { data, error };
};

// En componente
const crearCategoria = async (nombre: string, emoji: string) => {
  const { data: cat, error } = await InsertarCategoria(
    { nombre, emoji, color: '#FF0000', tipo: 'egreso' },
    usuarioId
  );

  if (error) {
    showError('Error al crear categoría');
    return;
  }

  // Actualizar store
  await obtenerCategorias();
  showSuccess('Categoría creada');
};
```

### Obtener Movimientos Filtrados

```typescript
export const ObtenerMovimientosDelMes = async (
  usuarioId: string,
  fecha: Date
) => {
  const inicio = dayjs(fecha).startOf('month').format('YYYY-MM-DD');
  const fin = dayjs(fecha).endOf('month').format('YYYY-MM-DD');

  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      *,
      categorias(*),
      cuentas(*)
    `)
    .eq('usuario_id', usuarioId)
    .gte('fecha', inicio)
    .lte('fecha', fin)
    .order('fecha', { ascending: false });

  return { data, error };
};
```

### Actualizar Saldo de Cuenta

```typescript
export const ActualizarSaldoCuenta = async (
  cuentaId: string,
  nuevoSaldo: number
) => {
  const { data, error } = await supabase
    .from('cuentas')
    .update({ saldo: nuevoSaldo })
    .eq('id', cuentaId)
    .select()
    .single();

  return { data, error };
};
```

### Eliminar Movimiento

```typescript
export const EliminarMovimiento = async (
  movimientoId: string,
  cuentaId: string
) => {
  // 1. Obtener movimiento para revertir saldo
  const { data: movimiento, error: errFetch } = await supabase
    .from('movimientos')
    .select('*')
    .eq('id', movimientoId)
    .single();

  if (errFetch) return { error: errFetch };

  // 2. Revertir saldo
  const { data: cuenta } = await supabase
    .from('cuentas')
    .select('saldo')
    .eq('id', cuentaId)
    .single();

  const nuevoSaldo = movimiento.tipo === 'ingreso'
    ? cuenta.saldo - movimiento.monto
    : cuenta.saldo + movimiento.monto;

  await ActualizarSaldoCuenta(cuentaId, nuevoSaldo);

  // 3. Eliminar movimiento
  const { error } = await supabase
    .from('movimientos')
    .delete()
    .eq('id', movimientoId);

  return { error };
};
```

---

## 🔐 Autenticación

### Auth Helpers

**Ubicación**: `src/supabase/authHelpers.ts`

```typescript
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

export const refreshToken = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  return { data, error };
};
```

---

## 🎯 Mejores Prácticas

### ✅ Qué Hacer

1. **Siempre valida entrada**
   ```typescript
   const validado = CuentaSchema.parse(cuenta);
   ```

2. **Maneja errores apropiadamente**
   ```typescript
   if (error) {
     logger.error('Error:', error);
     showErrorMessage(error.message);
   }
   ```

3. **Usa transacciones para operaciones complejas**
   ```typescript
   // Crear movimiento y actualizar saldo (transacción)
   ```

4. **Crea índices para queries frecuentes**
   ```sql
   CREATE INDEX idx_movimientos_usuario ON movimientos(usuario_id);
   ```

### ❌ Qué Evitar

- ❌ Queries N+1 (obtener usuario → cuentas → movimientos)
  - USA: `.select('*, cuentas(*), movimientos(*)')`

- ❌ Datos sensibles e plaintext
  - USA: `encryption` en [[Distribución de Carpetas|utils]]

- ❌ No validar después de obtener BD
  - SIEMPRE valida antes de insertar

---

## 🔗 Relaciones de Notas

- [[Stores Zustand]] - cómo CRUD se integra en stores
- [[Flujo de Datos]] - flujo completo de datos
- [[Componentes]] - cómo se llaman CRUD desde componentes
- [[Stack Tecnológico]] - Supabase en el tech stack
- [[Validación y Schemas]] - Zod schemas para validación
