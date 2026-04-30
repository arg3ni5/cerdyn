# Categorías

Documentación funcional y técnica del módulo de categorías.

Ver también: [[Páginas y Rutas]], [[Stores Zustand]], [[Supabase y CRUD]], [[Validación y Schemas]], [[Flujo de Datos]]

---

## Propósito

El módulo de categorías permite clasificar los movimientos por tipo de ingreso o gasto. Es una pieza de base para mantener ordenados los registros y para que los filtros de movimientos funcionen con contexto real del usuario.

La pantalla vive en `src/pages/Categorias.tsx` y renderiza el template `src/components/templates/CategoriasTemplate.tsx`.

---

## Flujo General

1. La página obtiene el tipo de categoría activo desde [[Stores Zustand|OperacionesStore]].
2. Usa `useQuery` para pedir las categorías del usuario actual.
3. El store `useCategoriasStore` sincroniza el resultado en estado local.
4. El template muestra el listado, el estado vacío y el formulario modal para crear o editar.
5. Las operaciones de alta, edición y borrado van a Supabase y luego invalidan la caché para refrescar la vista.

Este módulo sigue el patrón general de la app: UI → store → Supabase → refresh.

---

## Pantalla

### Página

**Archivo**: `src/pages/Categorias.tsx`

La página actúa como contenedor de datos. Consulta el backend con React Query y mantiene sincronizado el loading global mediante `useLoading`.

#### Responsabilidades

- Cargar categorías del usuario autenticado.
- Filtrar por tipo activo.
- Guardar el resultado en el store para reutilización por otros componentes.
- Mostrar error si la consulta falla.

### Template

**Archivo**: `src/components/templates/CategoriasTemplate.tsx`

#### Responsabilidades

- Mostrar encabezado y estado resumen.
- Permitir cambiar entre categorías de ingresos y gastos.
- Abrir el modal de registro.
- Renderizar el estado vacío cuando no hay datos.
- Mostrar la tabla paginada cuando sí hay registros.

#### Elementos visibles

- Hero con contador de categorías visibles.
- Selector de tipo de categoría.
- Botón para crear una nueva categoría.
- Lottie vacío según el tipo actual.
- Tabla principal.

---

## Estado y Store

**Archivo**: `src/store/CategoriasStore.tsx`

El store centraliza el CRUD y el estado seleccionado.

### Estado principal

- `datacategoria`: listado cargado.
- `categoriaItemSelect`: categoría seleccionada.
- `parametros`: últimos parámetros usados para la consulta.

### Operaciones principales

- `mostrarCategorias(p)` obtiene datos desde Supabase.
- `selectCategoria(p)` define la categoría activa.
- `insertarCategorias(p)` crea una nueva categoría y refresca el listado.
- `editarCategoria(p)` actualiza una categoría existente.
- `eliminarCategoria(p)` borra una categoría puntual.
- `eliminarCategoriasTodas(p)` resetea todas las categorías del usuario.

### Comportamiento importante

- Después de cada mutación, el store vuelve a cargar la lista si ya existe un conjunto de parámetros previo.
- También invalida la query `['mostrar categorias']` para alinear React Query con el store.
- Usa `logger` para dejar trazabilidad de éxito y error.

---

## CRUD y Persistencia

**Archivo**: `src/supabase/crudCategorias.tsx`

### Funciones

- `InsertarCategorias`
- `MostrarCategorias`
- `EditarCategorias`
- `EliminarCategorias`
- `EliminarCategoriasTodas`

### Detalles relevantes

- Antes de insertar o editar valida con Zod.
- La consulta de lectura puede filtrar por tipo y siempre respeta `idusuario`.
- El borrado individual requiere `id` e `idusuario`.
- El borrado total elimina todas las categorías del usuario.
- Los errores muestran mensajes explícitos para el usuario final.

---

## Validación

**Archivo**: `src/schemas/categoria.schema.ts`

### Reglas principales

- `descripcion` es obligatoria al crear o editar, con máximo de 100 caracteres.
- `tipo` solo admite `i` o `g`.
- `color` debe ser un hex válido.
- `idusuario` debe ser positivo cuando está presente.

### Qué protege

- Evita insertar categorías incompletas.
- Bloquea colores inválidos.
- Mantiene consistente el tipo de negocio que usa el resto de la app.

---

## Formulario y Tabla

### Formulario

**Archivo**: `src/components/organismos/formularios/RegistrarCategorias.tsx`

#### Permite

- Crear categoría nueva.
- Editar una existente.
- Elegir color con `CirclePicker`.
- Elegir ícono con `emoji-picker-react`.

#### Regla de negocio

- En modo edición se precargan color e ícono.
- El tipo final se toma del selector activo o del registro en edición.

### Tabla

**Archivo**: `src/components/organismos/tablas/TablaCategorias.tsx`

#### Permite

- Ver descripción, ícono y color.
- Editar desde acciones de fila.
- Eliminar con confirmación previa.
- Paginación de 10 filas por página.

---

## Relación Con Movimientos

Las categorías son insumo directo para registrar movimientos. El módulo de movimientos usa la lista de categorías para filtrar y para asociar cada movimiento a una clasificación legible.

Si una categoría desaparece, la vista de movimientos pierde contexto semántico en los registros ligados a ella, por lo que conviene tratar el borrado con cuidado.

---

## Puntos De Extensión

- Agregar validaciones extra en `categoria.schema.ts`.
- Incorporar nuevos filtros en la página o en el store.
- Mejorar el selector visual de color o de íconos.
- Exponer reportes específicos por tipo de categoría.
