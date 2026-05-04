# Páginas y Rutas

Mapeo de todas las páginas/rutas disponibles en la aplicación.

Ver: [[Distribución de Carpetas#📄 src/pages/ - Páginas de la Aplicación]]

---

## 🗺️ Estructura de Rutas

**Archivo**: `src/routers/routes.tsx`

```typescript
<Routes>
  {/* Pública - Sin protección */}
  <Route path="/login" element={<Login />} />

  {/* Protegidas - Requieren autenticación */}
  <Route element={<ProtectedRoute {...} />}>
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/cuentas" element={<Cuentas />} />
    <Route path="/conexiones" element={<Conexiones />} />
    <Route path="/vincular" element={<Vincular />} />
    <Route path="/configurar" element={<Configuracion />} />
    <Route path="/categorias" element={<Categorias />} />
    <Route path="/movimientos" element={<Movimientos />} />
    <Route path="/informes" element={<Informes />} />
    <Route path="/acercade" element={<Home />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
  </Route>
</Routes>
```

---

## 📄 Detalle de Cada Página

### 1. Login (`/login`)

**Archivo**: `src/pages/Login.tsx`
**Template**: `src/components/templates/LoginTemplate.tsx`

**Propósito**: Autenticar usuario con Google

**Flujo**:
1. Usuario ve botón "Continuar con Google"
2. Click dispara `signInWithGoogle()`
3. OAuth redirect a Google
4. Google redirige a callback
5. Sesión creada, usuario enviado a `/`

**Estado**: Usa [[Flujo de Autenticación|AuthStore]]

**Componentes**:
- `LoginTemplate` - Layout
- `BtnForm` - Botón login
- Lottie animation

---

### 2. Home (`/` o `/home`)

**Archivo**: `src/pages/Home.tsx`
**Template**: `src/components/templates/HomeTemplate.tsx`

**Propósito**: Landing/inicio de la aplicación

**Contenido**:
- Bienvenida al usuario
- Resumen rápido
- Accesos rápidos a módulos principales
- Información general

**Componentes**:
- Header
- Sidebar
- Cards de resumen

---

### 3. Dashboard (`/dashboard`)

**Archivo**: `src/pages/Dashboard.tsx`
**Template**: `src/components/templates/DashboardTemplate.tsx`

**Propósito**: Panel de control con análisis y gráficos

**Contenido**:
- **CardTotales**: Ingresos, egresos, balance
- **Gráficos**:
  - `Dona.tsx` - Distribución por categoría
  - `Barras.tsx` - Comparación mes a mes
  - `Lineal.tsx` - Tendencia de gastos
- **Tabla de movimientos recientes**

**Estado**:
- [[Stores Zustand|MovimientosStore]] - movimientos
- [[Stores Zustand|CuentasStore]] - cuentas
- [[Stores Zustand|OperacionesStore]] - cálculos

**Componentes Principales**:
- `CardTotales` - Resumen de dinero
- `Barras`, `Dona`, `Lineal` - Chart.js
- `TablaMovimientos` - Lista reciente
- `CalendarioLineal` - Filtro por fecha

---

### 4. Cuentas (`/cuentas`)

**Archivo**: `src/pages/Cuentas.tsx`
**Template**: `src/components/templates/CuentasTemplate.tsx`

**Propósito**: Gestionar cuentas bancarias del usuario

**Funcionalidad**:
- ✅ Ver lista de cuentas
- ✅ Crear Nueva cuenta (modal con `RegistrarCuentas`)
- ✅ Editar cuenta
- ✅ Eliminar cuenta
- ✅ Ver saldo actual
- ✅ Filtrar movimientos por cuenta

**Estado**: [[Stores Zustand|CuentasStore]]

**Componentes**:
- `RegistrarCuentas` - Formulario crear/editar
- `SidebarCard` - Card de cada cuenta
- List iterable

**Campos de Cuenta**:
- Nombre (ej: "Mi Cuenta del Banco X")
- Tipo (banco, tarjeta, efectivo, etc)
- Saldo inicial
- Moneda (USD, MXN, etc)
- ¿Activa?

---

### 5. Movimientos (`/movimientos`)

**Archivo**: `src/pages/Movimientos.tsx`
**Template**: `src/components/templates/MovimientosTemplate.tsx`

**Propósito**: Registrar y visualizar transacciones

**Funcionalidad**:
- ✅ Ver tabla paginated de movimientos
- ✅ Crear nuevo movimiento (modal)
- ✅ Editar movimiento
- ✅ Eliminar movimiento
- ✅ Filtrar por:
  - Fecha (calendario)
  - Categoría
  - Tipo (ingreso/egreso)
  - Cuenta
- ✅ Ver detalles de movimiento

**Estado**: [[Stores Zustand|MovimientosStore]]

**Componentes**:
- `RegistrarMovimientos` - Formulario
- `TablaMovimientos` - Tabla principal
- `Paginacion` - Control de páginas
- `ContentFiltros` - Filtros
- `MovimientosCuentaModal` - Modal de análisis

**Campos de Movimiento**:
- Monto
- Tipo (ingreso/egreso)
- Categoría
- Descripción
- Fecha
- Cuenta (¿de dónde?)

---

### 6. Categorías (`/categorias`)

**Archivo**: `src/pages/Categorias.tsx`
**Template**: `src/components/templates/CategoriasTemplate.tsx`

**Propósito**: Gestionar categorías de gastos

**Funcionalidad**:
- ✅ Ver tabla de categorías
- ✅ Crear categoría
- ✅ Editar categoría
- ✅ Eliminar categoría
- ✅ Asignar color/emoji a cada categoría
- ✅ Filtrar por tipo (ingreso/egreso)

**Estado**: [[Stores Zustand|CategoriasStore]]

**Componentes**:
- `RegistrarCategorias` - Formulario con emoji picker
- `TablaCategorias` - Tabla
- Color selector

**Campos de Categoría**:
- Nombre (ej: "Comida")
- Emoji (ej: 🍔)
- Color (hex)
- Tipo (ingreso/egreso)

---

### 7. Informes (`/informes`)

**Archivo**: `src/pages/Informes.tsx`
**Template**: `src/components/templates/InformesTemplate.tsx`

**Propósito**: Reportes y análisis visual de gastos

**Contenido**:
- Gráficos de tendencias
- Análisis por categoría
- Comparativas período a período
- Reporte exportable

**Componentes**:
- Primera `Lineal` - Tendencia mes a mes
- `Dona` - Por categoría
- `Barras` - Comparativa ingresos/egresos

---

### 8. Conexiones (`/conexiones`)

**Archivo**: `src/pages/Conexiones.tsx`
**Template**: `src/components/templates/ConexionesTemplate.tsx`

**Propósito**: Conectar bancos/APIs externas

**Funcionalidad** (futura):
- Conectar a API de banco
- Sincronizar movimientos automáticamente
- Ver estado de conexión
- Desconectar

**Estado**: [[Stores Zustand|ConexionesStore]]

---

### 9. Vincular (`/vincular`)

**Archivo**: `src/pages/Vincular.tsx`
**Template**: `src/components/templates/VincularTemplate.tsx`

**Propósito**: Vincular cuentas a integraciones

**Flujo**:
1. Usuario selecciona banco
2. Ingresa credenciales
3. Sincronización automática
4. Movimientos se auto-importan

---

### 10. Configuración (`/configurar`)

**Archivo**: `src/pages/Configuracion.tsx`
**Template**: `src/components/templates/ConfiguracionTemplate.tsx`

**Propósito**: Ajustes de usuario y app

**Opciones**:
- ✅ Cambiar tema (claro/oscuro)
- ✅ Cambiar idioma
- ✅ Datos personales
- ✅ Cerrar sesión
- ✅ Eliminar cuenta
- ✅ Privacidad

**Componentes**:
- `DataUser` - Info del usuario
- Selector de tema
- Botón logout

---

### 11. Auth Callback (`/auth/callback`)

**Archivo**: `src/pages/AuthCallback.tsx`

**Propósito**: Página de redirección OAuth

**Flujo**:
1. Google OAuth redirige aquí con código
2. Supabase intercambia código por tokens
3. Redirige a `/` o dashboard

Generalmente no visible para usuario.

---

### 12. Acerca De (`/acercade`)

**Archivo**: Se redirige a `Home`

**Propósito**: Información de la app

---

## 🧭 Navegación

### Sidebar (Navegación Principal)

En tablets y desktop, sidebar lateral con opciones:

```
┌─────────────────────┐
│    LOGO             │
├─────────────────────┤
│ 🏠 Home             │
│ 📊 Dashboard        │
│ 💳 Cuentas          │
│ 📝 Movimientos      │
│ 🏷️ Categorías       │
│ 📈 Informes         │
│ 🔗 Conexiones       │
│ 🔧 Configuración    │
│ ℹ️ Acerca de         │
└─────────────────────┘
```

**Archivo**: `src/components/organismos/sidebar/Sidebar.tsx`

### Hamburger Menu (Mobile)

En mobile, botón `Menuambur` abre menú desplegable.

**Archivo**: `src/components/organismos/Menuambur.tsx`

---

## 🔐 Protección de Rutas

**Componente**: `ProtectedRoute` (hook)

Todas las rutas EXCEPTO `/login` están dentro de:

```typescript
<Route element={<ProtectedRoute user={user} redirectTo="/login" />}>
  {/* Rutas aquí */}
</Route>
```

Si usuario = null → redirige a `/login`

Ver: [[Hooks y Context]]

---

## 🔗 Relaciones de Notas

- [[Componentes]] - templates de cada página
- [[Hooks y Context]] - ProtectedRoute
- [[Flujo de Autenticación]] - cómo protegen rutas
- [[Distribución de Carpetas]] - ubicación exacta
- [[Arquitectura]] - estructura arquitectónica general
