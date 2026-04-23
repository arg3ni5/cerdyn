# Estructura de Carpetas

Cerdyn organiza su código de manera que la lógica de negocio esté separada de la representación visual.

## 📁 Directorios Principales (`src/`)

- `components/`: Contiene la UI dividida por [[Atomic Design]].
- `pages/`: Vistas principales de la aplicación (Dashboard, Movimientos, etc.).
- `store/`: Definición de los stores de [[Zustand Store]].
- `supabase/`: Cliente de Supabase y funciones de CRUD.
- `hooks/`: Lógica reutilizable y [[Protección de Rutas]].
- `schemas/`: Validaciones de datos con Zod.
- `types/`: Tipado global y tipos generados de la DB.
- `utils/`: Funciones auxiliares globales.

## 🔄 Relaciones
Los componentes de `pages/` consumen datos a través de los `hooks/` o directamente de los `store/`, los cuales interactúan con la capa de `supabase/` para persistir la información.
