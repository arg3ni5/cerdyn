# Flujo de Datos

Cómo fluyen los datos a través de la aplicación desde el usuario hasta la base de datos y de regreso.

Ver: [[Arquitectura#Flujo de Datos Principal]]

---

## 🔄 Ciclo Completo: Crear Movimiento

Este es el flujo más común en la app: usuario crea un nuevo movimiento financiero.

### 1. Usuario Interactúa

```
Usuario abre página /movimientos
           ↓
Ve formulario RegistrarMovimientos
           ↓
Completa datos: monto, categoría, fecha, descripción
           ↓
Click en botón "Guardar"
```

---

### 2. Componente Captura Input

**Archivo**: `src/components/organismos/formularios/RegistrarMovimientos.tsx`

```typescript
export const RegistrarMovimientos = () => {
  const { movimientos, agregarMovimiento } = useMovimientosStore();
  const { cuentas } = useCuentasStore();
  const { categorias } = useCategoriasStore();

  const handleSubmit = async (formData: MovimientoInput) => {
    try {
      // PASO 3: Enviar al store
      await agregarMovimiento(formData);

      showSuccessMessage('Movimiento registrado');
      resetForm();
    } catch (error) {
      showErrorMessage('Error al registrar');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputNumber label="Monto" {...} />
      <Select label="Categoría" options={categorias} />
      <InputDate label="Fecha" {...} />
      <Button type="submit">Guardar</Button>
    </Form>
  );
};
```

---

### 3. Store Procesa

**Archivo**: `src/store/MovimientosStore.tsx`

```typescript
export const useMovimientosStore = create<MovimientosStore>((set) => ({
  movimientos: [],

  agregarMovimiento: async (input: MovimientoInput) => {
    // PASO 4: Validar
    const validado = MovimientoSchema.parse(input);

    // PASO 5: Enviar a Supabase
    const { data: nuevoMov, error } = await supabase
      .from('movimientos')
      .insert([{
        usuario_id: usuarioId,
        cuenta_id: validado.cuenta_id,
        categoria_id: validado.categoria_id,
        tipo: validado.tipo,
        monto: validado.monto,
        descripcion: validado.descripcion,
        fecha: validado.fecha
      }])
      .select()
      .single();

    if (error) throw error;

    // PASO 6: Actualizar saldo de cuenta
    const { data: cuenta } = await supabase
      .from('cuentas')
      .select('saldo')
      .eq('id', validado.cuenta_id)
      .single();

    const nuevoSaldo = validado.tipo === 'ingreso'
      ? cuenta.saldo + validado.monto
      : cuenta.saldo - validado.monto;

    await supabase
      .from('cuentas')
      .update({ saldo: nuevoSaldo })
      .eq('id', validado.cuenta_id);

    // PASO 7: Actualizar estado local
    set((state) => ({
      movimientos: [...state.movimientos, nuevoMov]
    }));

    // PASO 8: Notificar a otros stores
    // (actualizar saldos en CuentasStore)
    const { data: cuentaActualizada } = await supabase
      .from('cuentas')
      .select('*')
      .eq('id', validado.cuenta_id)
      .single();

    useCuentasStore.setState({
      cuentas: useCuentasStore.getState().cuentas.map(c =>
        c.id === validado.cuenta_id ? cuentaActualizada : c
      )
    });
  }
}));
```

---

### 4. Supabase Persiste

**En la Base de Datos** (PostgreSQL):

```sql
-- Tabla movimientos
INSERT INTO movimientos (
  usuario_id, cuenta_id, categoria_id,
  tipo, monto, descripcion, fecha, created_at
) VALUES (
  'user-123', 'cuenta-456', 'cat-789',
  'egreso', 500.00, 'Comida', '2024-04-11', NOW()
);

-- Tabla cuentas
UPDATE cuentas
SET saldo = saldo - 500.00
WHERE id = 'cuenta-456';
```

---

### 5. Componente Se Re-renderiza

El hook `useMovimientosStore()` detecta el cambio en estado:

```typescript
// En cualquier componente que use:
const { movimientos } = useMovimientosStore();

// ✅ Se re-renderiza automáticamente con nuevo movimiento
return (
  <div>
    {movimientos.map(m => <MovimientoCard key={m.id} {...m} />)}
  </div>
);
```

---

### 6. UI Actualiza

```
Usuario ve "Movimiento registrado ✓"
           ↓
Lista de movimientos se actualiza
           ↓
Saldo de cuenta se actualiza
           ↓
Gráficos se recalculan
```

---

## 📊 Diagrama Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTE UI (React)                    │
│  RegistrarMovimientos.tsx                                   │
│  - Captura datos del formulario                             │
│  - Click "Guardar"                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ await agregarMovimiento(data)
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              STORE (Zustand)                                 │
│  MovimientosStore.tsx                                       │
│  - Valida input con Zod                                     │
│  - Prepara datos                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ supabase.from('movimientos').insert()
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE CLIENT (SDK)                          │
│  supabase.config.tsx                                        │
│  - Construye query                                          │
│  - Envía HTTP POST                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
         HTTP REST API (JSON)
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVIDOR SUPABASE                              │
│  - Valida autenticación                                     │
│  - Row-level security (RLS)                                 │
│  - Ejecuta trigger de actualizar saldo                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                            │
│  INSERT INTO movimientos (...)                              │
│  UPDATE cuentas SET saldo = ... WHERE id = ...              │
└─────────────────┬───────────────────────────────────────────┘
                  │
     Respuesta con datos creados + saldo actualizado
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              ZUSTAND STORE (React)                          │
│  set({ movimientos: [..., nuevoMov] })                      │
│  Notifica a componentes suscritos                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              COMPONENTES RE-RENDERIZAN                      │
│  - Tabla actualiza con nuevo movimiento                     │
│  - Saldo se actualiza                                       │
│  - Gráficos recalculan                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔀 Variaciones del Flujo

### Flujo: Obtener Datos (READ)

```
Componente monta
       ↓
useEffect dispara obtenerMovimientos()
       ↓
Store queryFn a Supabase
       ↓
SELECT * FROM movimientos WHERE usuario_id = ?
       ↓
set({ movimientos: data })
       ↓
Componente se renderiza con datos
```

### Flujo: Editar Dato (UPDATE)

```
Usuario click "Editar"
       ↓
Modal se abre con datos actuales
       ↓
Usuario cambia monto, categoría, etc
       ↓
Click "Guardar"
       ↓
Store valida
       ↓
supabase.from('movimientos').update({...}).eq('id', id)
       ↓
UPDATE movimientos SET ... WHERE id = ?
       ↓
set({ movimientos: estado.map(...) })
       ↓
UI actualiza
```

### Flujo: Eliminar Dato (DELETE)

```
Usuario hace click "Eliminar"
       ↓
SweetAlert pide confirmación
       ↓
Usuario confirma
       ↓
Store llama DELETE
       ↓
DELETE FROM movimientos WHERE id = ?
       ↓
Revertir saldo de cuenta
       ↓
set({ movimientos: estado.filter(...) })
       ↓
Tabla se actualiza, item desaparece
```

---

## 🎯 Puntos Clave

1. **Unidireccional**: UI → Store → BD → Store → UI
2. **Reactividad**: Zustand notifica cambios automáticamente
3. **Validación**: Ocurre ANTES de enviar a BD
4. **Transacciones**: Operaciones complejas mantienen consistencia
5. **Sincronización**: El estado local siempre refleja la BD

---

## ⚡ Performance

### Evitar N+1 Queries

```typescript
// ❌ MAL - 3 queries
const movimientos = await obtenerMovimientos();
for (let mov of movimientos) {
  const cuenta = await obtenerCuenta(mov.cuenta_id);
  const categoria = await obtenerCategoria(mov.categoria_id);
}

// ✅ BIEN - 1 query con joins
const { data } = await supabase
  .from('movimientos')
  .select(`
    *,
    cuentas(*),
    categorias(*)
  `)
  .eq('usuario_id', usuarioId);
```

### Caching con React Query

Ver: [[React Query]]

```typescript
const { data: movimientos } = useQuery({
  queryKey: ['movimientos', filtros],
  queryFn: () => obtenerMovimientos(filtros),
  staleTime: 5 * 60 * 1000,  // Cache 5 min
  gcTime: 10 * 60 * 1000     // Mantener 10 min
});
```

---

## 🔗 Relaciones de Notas

- [[Componentes]] - inicio del flujo en UI
- [[Stores Zustand]] - procesamiento de datos
- [[Supabase y CRUD]] - operaciones en BD
- [[React Query]] - alternative para server state
- [[Flujo de Autenticación]] - flujo especial de login
- [[Arquitectura]] - cómo se integra todo
