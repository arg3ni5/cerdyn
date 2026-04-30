# Movimientos

Documentación funcional y técnica del módulo de movimientos.

Ver también: [[Páginas y Rutas]], [[Stores Zustand]], [[Supabase y CRUD]], [[Validación y Schemas]], [[Flujo de Datos]], [[Categorias]]

---

## Propósito

El módulo de movimientos registra ingresos, gastos, transferencias y vistas de balance. Es el núcleo operativo de la aplicación porque concentra la trazabilidad de dinero y alimenta el dashboard, los informes y varios cálculos agregados.

La pantalla vive en `src/pages/Movimientos.tsx` y renderiza el template `src/components/templates/MovimientosTemplate.tsx`.

---

## Flujo General

1. La página toma el tipo de movimiento y la fecha activa desde [[Stores Zustand|OperacionesStore]].
2. Consulta Supabase con React Query usando el usuario actual y el período seleccionado.
3. El store `useMovimientosStore` normaliza el resultado, calcula totales y guarda filtros.
4. El template muestra tablas, filtros, totales y el modal de alta/edición.
5. Cada cambio en movimientos refresca el estado y, si hace falta, dispara nuevas lecturas.

El módulo también reacciona a cambios de mes o año limpiando filtros para no arrastrar búsquedas incompatibles.

---

## Pantalla

### Página

**Archivo**: `src/pages/Movimientos.tsx`

#### Responsabilidades

- Cargar movimientos del período activo.
- Sincronizar el estado de carga global.
- Volcar los datos al store.
- Limpiar filtros cuando cambia la fecha.
- Mostrar error si la consulta falla.

### Template

**Archivo**: `src/components/templates/MovimientosTemplate.tsx`

#### Responsabilidades

- Alternar entre ingresos, gastos, balance y transferencias.
- Abrir el formulario de nuevo movimiento.
- Buscar por descripción o monto.
- Filtrar por categoría.
- Mostrar totales calculados.
- Renderizar la tabla principal con paginación y agrupación por fecha.

#### Elementos visibles

- Hero con cantidad de registros visibles.
- Botones de cambio de tipo.
- Buscador rápido.
- Selector de categoría.
- Tarjetas de totales.
- Calendario lineal para navegar por período.
- Tabla paginada.

---

## Estado y Store

**Archivo**: `src/store/MovimientosStore.tsx`

El store de movimientos es más rico que el de categorías porque combina persistencia, filtros, totales, reportes y recurrencia.

### Estado principal

- `datamovimientos`: conjuntos cargados para ingresos, gastos y transferencias.
- `rptParams`: parámetros del reporte anual/mensual.
- `dataRptMovimientosAñoMes`: datos usados por los gráficos.
- `totalMesAño`: total general del período.
- `totalMesAñoPagados`: total de movimientos pagados.
- `totalMesAñoPendientes`: total pendiente.
- `ingresosPagadosMes` y `gastosPagadosMes`: agregados complementarios.
- `filtroDescripcion` y `filtroCategoria`: filtros activos.
- `parametros`: últimos parámetros de consulta.

### Operaciones principales

- `mostrarMovimientos(p)` obtiene movimientos por mes, año y tipo.
- `setDatamovimientos(data)` guarda y recalcula totales.
- `calcularTotales(data)` calcula totales según el tipo activo.
- `insertarMovimientos(p)` crea un movimiento simple.
- `actualizarMovimientos(p)` edita un registro existente.
- `eliminarMovimiento(p)` borra un movimiento.
- `rptMovimientosAñoMes(p)` obtiene datos para gráficos.
- `rptMovimientosAñoMesJson(p)` consulta la versión JSON del reporte.
- `previewRecurrencia(base, config)` genera las fechas de una recurrencia.
- `insertarMovimientosRecurrentes(base, config)` crea múltiples movimientos derivados.

### Comportamiento importante

- Convierte el estado a booleano con `esPagado` para homogenizar la UI.
- Mantiene soporte para transferencias, que usan cuentas origen y destino.
- Si el tipo es balance, calcula el neto entre ingresos y gastos.
- Los totales de transferencias se muestran de forma informativa, no como saldo neto.

---

## CRUD Y Reportes

**Archivo**: `src/supabase/crudMovimientos.tsx`

### Funciones

- `InsertarMovimientos`
- `EliminarMovimientos`
- `ActualizarMovimientos`
- `MostrarMovimientosPorMesAño`
- `RptMovimientosPorMesAño`
- `RptMovimientosPorMesAñoJson`
- `convertToMovimiento`

### Detalles relevantes

- Antes de insertar o actualizar valida con Zod.
- La lectura por período usa RPC con timeout para evitar bloqueos largos.
- Los reportes alimentan gráficos y vistas analíticas.
- `convertToMovimiento` adapta filas de reporte a la forma que espera la tabla.

---

## Validación

**Archivo**: `src/schemas/movimiento.schema.ts`

### Reglas principales

- `tipo` admite `i`, `g` y `t`.
- `valor` debe ser positivo cuando está presente.
- `fecha` acepta formato `YYYY-MM-DD` o fecha ISO válida.
- `estado` representa si el movimiento está pagado.
- En transferencias, `idcuenta_origen` e `idcuenta_destino` son obligatorios.
- La cuenta origen y la destino deben ser distintas.

### Qué protege

- Evita transferencias incompletas.
- Impide valores inválidos o negativos.
- Asegura que el formulario no envíe estados inconsistentes al backend.

---

## Formulario Y Tabla

### Formulario

**Archivo**: `src/components/organismos/formularios/RegistrarMovimientos.tsx`

#### Permite

- Crear o editar movimientos.
- Elegir fecha, descripción y monto.
- Marcar estado pagado o pendiente.
- Elegir categoría y cuenta para ingresos o gastos.
- Elegir cuenta origen y destino para transferencias.
- Crear movimientos recurrentes por intervalo o por mes.

#### Regla de negocio

- Si el tipo es transferencia, valida dos cuentas distintas.
- Si el movimiento no es transferencia, exige categoría y cuenta.
- En modo recurrente puede mostrar una previsualización de fechas.
- Si la recurrencia supera cierto umbral, pide confirmación.

### Tabla

**Archivo**: `src/components/organismos/tablas/TablaMovimientos.tsx`

#### Permite

- Ver movimientos agrupados por fecha.
- Editar una fila desde acciones.
- Eliminar con confirmación previa.
- Ver paginación por bloques.
- Mostrar si un movimiento está pagado o pendiente con un indicador visual.

---

## Relaciones Con Otros Módulos

- Depende de [[Categorias]] para clasificar ingresos y gastos.
- Depende de cuentas para registrar el origen o destino de fondos.
- Alimenta el dashboard y los reportes mensuales/anuales.
- Reutiliza el patrón de filtros y sincronización de React Query con estado local.

---

## Puntos De Extensión

- Mejorar filtros combinados por descripción, categoría, cuenta y estado.
- Expandir la lógica de recurrencia.
- Incorporar exportaciones o vistas alternativas.
- Separar más claramente las vistas de balance y transferencias si el dominio crece.
