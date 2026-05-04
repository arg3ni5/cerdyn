# MEMORY Index - Navegación de Notas

Índice central de todas las notas documentadas. Los enlaces están organizados por categoría.

---

## 📚 Documentación Principal

- **[[Control de Gastos - Documentación]]** — Punto de entrada: contexto general de la app
- **[[Arquitectura]]** — Estructura arquitectónica y capas de la aplicación
- **[[Stack Tecnológico]]** — Tecnologías utilizadas y versiones

---

## 📂 Estructura y Organización

- **[[Distribución de Carpetas]]** — Dónde vive cada cosa en el proyecto
- **[[Componentes]]** — Sistema Atomic Design (átomos → moléculas → organismos → templates)
- **[[Páginas y Rutas]]** — Todas las páginas, rutas y navegación
- **[[Movimientos]]** — Detalle del módulo de transacciones
- **[[Categorias]]** — Detalle del módulo de categorías

---

## 🧠 State Management

- **[[Stores Zustand]]** — Global client state con Zustand
- **[[React Query]]** — Server state management y caching
- **[[Hooks y Context]]** — Auth Context y hooks personalizados

---

## 🔄 Flujos Importantes

- **[[Flujo de Datos]]** — Cómo fluyen los datos: UI → Store → BD → UI
- **[[Flujo de Autenticación]]** — Google OAuth y gestión de sesiones
- **[[Supabase y CRUD]]** — Base de datos y operaciones CRUD

---

## 🎨 Estilos y Validación

- **[[Estilos y Temas]]** — Sistema de temas claro/oscuro y styled-components
- **[[Validación y Schemas]]** — Zod schemas para type-safe validation

---

## 🔗 Mapa de Relaciones

### Por Tema

#### Authentication
`[[Flujo de Autenticación]]` ← `[[AuthStore]]` ← `[[AuthContext]]` ← `[[Hooks y Context]]`

#### Data Flow
`[[Flujo de Datos]]` ← `[[Componentes]]` ← `[[Stores Zustand]]` ← `[[Supabase y CRUD]]`

#### Server State
`[[React Query]]` ← `[[Supabase y CRUD]]` ← `[[Validación y Schemas]]`

#### UI
`[[Componentes]]` ← `[[Estilos y Temas]]` ← `[[Páginas y Rutas]]`

#### Módulos de negocio
`[[Movimientos]]` ↔ `[[Categorias]]` ↔ `[[Supabase y CRUD]]` ↔ `[[Validación y Schemas]]`

#### Architecture Overview
`[[Arquitectura]]` ← `[[Stack Tecnológico]]` ← `[[Distribución de Carpetas]]`

---

## 📖 Cómo Navegar Esta Documentación

1. **Si eres nuevo**: Comienza en [[Control de Gastos - Documentación]] → [[Arquitectura]] → [[Distribución de Carpetas]]

2. **Si quieres entender un flujo**:
   - Crear movimiento: [[Flujo de Datos]]
   - Login: [[Flujo de Autenticación]]

3. **Si buscas un componente específico**:
   - Ve a [[Distribución de Carpetas]] → busca en el árbol
   - Luego ve a [[Componentes]] para entender la estructura

4. **Si trabajas en módulos de negocio**:
   - Movimientos: [[Movimientos]]
   - Categorías: [[Categorias]]

5. **Si necesitas information sobre state**:
   - Global state (filtros, categorías): [[Stores Zustand]]
   - Server state (datos de API): [[React Query]]
   - Auth (usuario): [[Hooks y Context]]

6. **Si trabajas en estilos o validación**:
   - Estilos: [[Estilos y Temas]]
   - Validación: [[Validación y Schemas]]

---

## 🎯 Quick Links por Caso de Uso

### Quiero agregar un nuevo componente
1. Lee: [[Componentes]]
2. Ubicación: [[Distribución de Carpetas]]
3. Ejemplo: [[Componentes#Crear un Nuevo Componente]]

### Quiero agregar una nueva página
1. Lee: [[Páginas y Rutas]]
2. Crea template en `src/components/templates/`
3. Crea page en `src/pages/`
4. Agrega ruta en `src/routers/routes.tsx`

### Quiero conectar componente con datos
1. Lee: [[Flujo de Datos]]
2. Usa [[Stores Zustand]] si es client state
3. Usa [[React Query]] si es server state
4. Ejemplo: [[Flujo de Datos#Ciclo Completo: Crear Movimiento]]

### Quiero validar datos
1. Lee: [[Validación y Schemas]]
2. Crea schema en `src/schemas/`
3. Usa en componentes: `Schema.parse(data)`
4. Usa en store: `Schema.parse(data)` antes de enviar

### Quiero cambia estilos o tema
1. Lee: [[Estilos y Temas]]
2. Modifica en `src/styles/themes.ts`
3. Usa en componentes: `${({ theme }) => theme.primary}`

---

## 📊 Matriz de Conceptos

### Dónde se Usa Cada Tecnología

| Concepto | Archivo/Carpeta | Propósito |
|----------||----|
| **React Router** | `src/routers/` | Routing y navegación |
| **Zustand** | `src/store/` | State management |
| **React Query** | En componentes | Server state |
| **Styled Components** | En componentes/styles | Estilos |
| **Zod** | `src/schemas/` | Validación |
| **Supabase** | `src/supabase/` | BD y Auth |
| **React Context** | `src/context/` | Auth state |
| **Custom Hooks** | `src/hooks/` | Lógica reutilizable |

---

## 🔗 Relaciones de Notas (Graph)

```
Index (Centro)
├── Arquitectura
│   ├── Stack Tecnológico
│   │   └── Supabase y CRUD
│   ├── Distribución de Carpetas
│   │   ├── Componentes
│   │   ├── Páginas y Rutas
│   │   └── Stores Zustand
│   └── Flujo de Datos
│       ├── Componentes
│       ├── Stores Zustand
│       ├── React Query
│       └── Supabase y CRUD
│
├── Flujo de Autenticación
│   ├── Hooks y Context
│   ├── Stores Zustand (AuthStore)
│   └── Páginas y Rutas (ProtectedRoute)
│
├── Componentes (Atomic Design)
│   ├── Estilos y Temas
│   ├── Hooks y Context
│   └── Stores Zustand
│
├── Validación y Schemas
│   ├── Supabase y CRUD
│   └── Stores Zustand
│
└── React Query
    ├── Supabase y CRUD
    └── Stores Zustand
```

---

## 📝 Atajos útiles

### Buscar por ubicación
- `src/components/` → [[Distribución de Carpetas]] → [[Componentes]]
- `src/store/` → [[Distribución de Carpetas]] → [[Stores Zustand]]
- `src/pages/` → [[Distribución de Carpetas]] → [[Páginas y Rutas]]

### Buscar por concepto
- Cómo funciona la autenticación → [[Flujo de Autenticación]]
- Cómo se sincronizan datos → [[Flujo de Datos]]
- Cómo se organizan componentes → [[Componentes]]

### Buscar por tarea
- Agregar feature → [[Flujo de Datos]]
- Corregir bug → [[Distribución de Carpetas]]
- Cambiar estilos → [[Estilos y Temas]]

---

## ✨ Características de Esta Documentación

- ✅ **Interconectada**: Usa [[wikilinks]] para navegar
- ✅ **Visual**: Diagramas ASCII y tablas
- ✅ **Práctica**: Código real de la app
- ✅ **Estructura**: Atomic Design refleja en docs
- ✅ **Completa**: Cubre arquitectura, código, y flujos
- ✅ **Bidireccional**: Puedes navegar en cualquier dirección

---

Última actualización: 2026-04-11
