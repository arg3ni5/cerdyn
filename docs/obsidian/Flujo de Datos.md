# Flujo de Datos

Descripción de cómo viaja la información desde la base de datos hasta la pantalla del usuario.

## 🔄 El Camino del Dato
1. **Persistencia**: El dato reside en PostgreSQL (Supabase).
2. **Acceso**: Se llama a una función en `src/supabase/crud*.tsx`.
3. **Sincronización**: TanStack Query gestiona la petición y el cache.
4. **Estado Global**: Si el dato afecta a la app entera, se actualiza el [[Zustand Store]].
5. **Interfaz**: El componente (siguiendo [[Atomic Design]]) consume el dato y lo renderiza.

## ✍️ Flujo de Escritura
`Componente UI` $\rightarrow$ `Zod Schema (Validación)` $\rightarrow$ `Supabase CRUD` $\rightarrow$ `Base de Datos` $\rightarrow$ `Invalidación de Cache Query` $\rightarrow$ `Actualización de UI`
