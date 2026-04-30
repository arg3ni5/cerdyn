# 📚 Documentación de Control de Gastos

Bienvenido a la documentación wiki interconectada de la aplicación **Control de Gastos**.

Esta documentación está diseñada como un wiki conectado usando [[wikilinks]] similares a Obsidian, permitiendo navegar entre conceptos relacionados fácilmente.

---

## 🚀 Comienza Aquí

1. **[[Control de Gastos - Documentación]]** — Contexto general y resumen de la app
2. **[[Arquitectura]]** — Cómo está estructurada la aplicación
3. **[[Distribución de Carpetas]]** — Dónde vive cada archivo

---

## 📖 Documentación por Tema

### 🎨 Componentes y UI
- **[[Componentes]]** — Sistema Atomic Design (átomos → moléculas → organismos → templates)
- **[[Estilos y Temas]]** — Sistema de temas claro/oscuro y aplicación de estilos
- **[[Páginas y Rutas]]** — Todas las páginas de la aplicación y rutas disponibles

### 🧠 Estado y Datos
- **[[Stores Zustand]]** — Gestión global de estado (autenticación, categorías, cuentas, etc)
- **[[React Query]]** — Estado del servidor y caching de datos
- **[[Hooks y Context]]** — Autenticación y hooks personalizados

### 🔄 Flujos Principales
- **[[Flujo de Datos]]** — Cómo fluyen los datos: UI → Store → BD → UI
- **[[Flujo de Autenticación]]** — Google OAuth y gestión de sesiones
- **[[Movimientos]]** — Módulo de transacciones, filtros, totales y recurrencia
- **[[Categorias]]** — Módulo de clasificación, colores, íconos y CRUD

### 🗄️ Backend e Integración
- **[[Supabase y CRUD]]** — Base de datos PostgreSQL y operaciones CRUD
- **[[Validación y Schemas]]** — Validación type-safe con Zod

### 💻 Técnico
- **[[Stack Tecnológico]]** — Tecnologías utilizadas (React, Zustand, Supabase, etc)
- **[[Patrones y Convenciones]]** — Estándares de código y patrones utilizados

### 🗺️ Índices
- **[[MEMORY]]** — Índice completo y mapa de relaciones
- **[[README.md]]** — Este archivo

---

## 🎯 Buscar por Necesidad

### \"Quiero entender cómo funciona...\"

| Necesidad | Lee |
|-----------|-----|
| la autenticación | [[Flujo de Autenticación]] |
| la sincronización de datos | [[Flujo de Datos]] |
| el estado global | [[Stores Zustand]] |
| los módulos de movimientos y categorías | [[Movimientos]] / [[Categorias]] |
| las páginas | [[Páginas y Rutas]] |
| los componentes | [[Componentes]] |
| los estilos | [[Estilos y Temas]] |
| la base de datos | [[Supabase y CRUD]] |

### \"Quiero trabajar en...\"

| Tarea | Paso a Paso |
|-------|---|
| Crear un nuevo componente | 1. Lee [[Componentes]] 2. Crea en [[Distribución de Carpetas]] 3. Ejemplo en [[Componentes#Crear un Nuevo Componente]] |
| Agregar una nueva página | 1. [[Páginas y Rutas]] 2. Crea template 3. Crea page 4. Agrega ruta |
| Conectar datos a componente | 1. [[Flujo de Datos]] 2. Usa [[Stores Zustand]] o [[React Query]] 3. Sigue el patrón unidireccional |
| Validar datos del usuario | 1. [[Validación y Schemas]] 2. Crea schema en `src/schemas/` 3. Usa `Schema.parse(data)` |
| Cambiar estilos/tema | 1. [[Estilos y Temas]] 2. Modifica `src/styles/themes.ts` 3. Aplica en componentes |
| Agregar integración externa | 1. [[Flujo de Autenticación]] 2. [[Supabase y CRUD]] 3. Crea en `src/supabase/` |
| Documentar movimientos o categorías | 1. [[Movimientos]] 2. [[Categorias]] 3. Cruza con [[Flujo de Datos]] y [[Validación y Schemas]] |

---

## 🧠 Concepto Clave: Flujo Unidireccional

```
USUARIO INTERACTÚA
       ↓
COMPONENTE CAPTURA INPUT
       ↓
DISPARA ACCIÓN STORE
       ↓
VALIDA CON ZOD
       ↓
ENVÍA A SUPABASE
       ↓
BD PERSISTE
       ↓
RESPUESTA AL CLIENT
       ↓
ACTUALIZA ESTADO LOCAL
       ↓
COMPONENTE RE-RENDERIZA
```

Este flujo es fundamental para entender cómo funciona la app.

Ver: **[[Flujo de Datos]]**

---

## 📊 Arquitec tura de Alto Nivel

```
Frontend (React)
    ├── Componentes (Atomic Design)
    │   └── Usan Hooks & Stores
    │
    ├── State Management
    │   ├── Zustand (client state)
    │   ├── React Query (server state)
    │   └── Context (auth)
    │
    └── Services
        └── Supabase Client SDK

            ↓ (HTTP/REST)

Backend (Supabase)
    ├── PostgreSQL (Database)
    ├── Auth (Google OAuth)
    └── RLS (Row-Level Security)
```

Ver: **[[Arquitectura]]**

---

## 🏗️ Estructura de Carpetas Simplificada

```
src/
├── components/          ← Componentes React (Atomic Design)
├── pages/              ← Páginas/Vistas
├── store/              ← Zustand stores (state global)
├── hooks/              ← Custom hooks
├── context/            ← React context (auth)
├── supabase/           ← BD y APIs
├── schemas/            ← Validación Zod
├── types/              ← TypeScript types
├── styles/             ← Estilos globales
├── utils/              ← Funciones utilitarias
├── config/             ← Configuración
└── routers/            ← Rutas de React Router
```

Ver: **[[Distribución de Carpetas]]**

---

## 🎯 Tips para Navegar

1. **Usa [[wikilinks]]** para saltar entre notas relacionadas
2. **Comienza generales** (Arquitectura) y ve a específcos (Componentes)
3. **Busca por nombre** en tu editor (Ctrl+F)
4. **Síguelos enlaces** para entender cómo se conectan los conceptos
5. **Lee los diagramas ASCII** para visualizar flujos

---

## 📝 Convenciones de Esta Documentación

- **[[wikilinks]]** — Enlaces a otras notas
- `código` — Código inline
- ```block``` — Bloques de código
- > Cita o importante
- ✅ Bien | ❌ Mal — Mejores prácticas
- | Tabla | — Para comparaciones

---

## 🔗 Relaciones Principales

```
┌─────────────────────────────────────────┐
│        Index (Centro)                   │
├─────────────────────────────────────────┤
│                                         │
│  ├─ Arquitectura (Vista general)        │
│  │   ├─ Stack Tecnológico               │
│  │   ├─ Distribución de Carpetas        │
│  │   └─ Patrones y Convenciones         │
│  │                                      │
│  ├─ Flujos (Cómo funciona)              │
│  │   ├─ Flujo de Datos                  │
│  │   ├─ Flujo de Autenticación          │
│  │   └─ React Query                     │
│  │                                      │
│  ├─ Desarrollo (Cómo trabajar)          │
│  │   ├─ Componentes                     │
│  │   ├─ Páginas y Rutas                 │
│  │   ├─ Stores Zustand                  │
│  │   ├─ Supabase y CRUD                 │
│  │   ├─ Estilos y Temas                 │
│  │   ├─ Validación y Schemas            │
│  │   └─ Hooks y Context                 │
│  │                                      │
│  └─ Índices (Navegación)                │
│      └─ MEMORY (Mapa de relaciones)     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🚀 Primeros Pasos para Desarrolladores

### Si es tu primer día:
1. Lee [[Control de Gastos - Documentación]]
2. Lee [[Arquitectura]]
3. Explora [[Distribución de Carpetas]]
4. Mira un flujo: [[Flujo de Autenticación]]

### Si necesitas agregar features:
1. Lee [[Flujo de Datos]]
2. Localiza dónde va: [[Distribución de Carpetas]]
3. Sigue el patrón: [[Patrones y Convenciones]]
4. Valida datos: [[Validación y Schemas]]

### Si necesitas entender un bug:
1. Identifica la parte afectada
2. Lee el documento relevante
3. Sigue el flujo de datos
4. Revisa [[Patrones y Convenciones]]

---

## 📚 Recursos Externos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Styled Components Docs](https://styled-components.com)
- [Zod Docs](https://zod.dev)

---

## 📞 Soporte

Si tienes dudas:
1. Búsca en [[MEMORY]] por palabras clave
2. Revisa ejemplos de código en las notas
3. Lee [[Patrones y Convenciones]]
4. Consulta el código directamente en `src/`

---

## 📈 Mejora de Documentación

Esta documentación es viva y evoluciona. Si encuentras:
- ❌ Errores o inconsistencias
- 📚 Temas faltantes
- 🙋 Preguntas comunes

Por favor actualiza las notas correspondientes.

---

**Última actualización**: 2026-04-11
**Versión app**: 0.0.0
**Hecha con ❤️ para desarrolladores**
