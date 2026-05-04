# Control de Gastos - Documentación

## 🎯 Contexto de la Aplicación

**Control de Gastos** es una aplicación web para gestionar finanzas personales. Permite a los usuarios registrar sus movimientos de dinero, categorizar gastos, vincular múltiples cuentas y generar reportes visuales de su situación financiera.

### Características Principales
- 📊 Dashboard con visualización de datos en gráficos
- 💳 Gestión de múltiples cuentas bancarias
- 📝 Registro de movimientos y transacciones
- 🏷️ Categorización y filtrado de gastos
- 📈 Análisis y reportes visuales
- 🔐 Autenticación con Google OAuth
- 🎨 Soporte para temas claro/oscuro

---

## 📚 Documentación

### Arquitectura y Estructura
- [[Arquitectura]] - Descripción detallada de cómo está estructurado el proyecto
- [[Stack Tecnológico]] - Tecnologías utilizadas en el proyecto
- [[Distribución de Carpetas]] - Estructura de directorios y módulos

### Código y Componentes
- [[Componentes]] - Sistema de Atomic Design: átomos, moléculas, organismos, templates
- [[Hooks y Context]] - Hooks personalizados y React Context
- [[Stores Zustand]] - State management con Zustand
- [[Supabase y CRUD]] - Base de datos y operaciones CRUD

### Flujo de Datos
- [[Flujo de Autenticación]] - Cómo funciona el login y la sesión
- [[Flujo de Datos]] - Cómo los datos fluyen a través de la aplicación
- [[React Query]] - Sincronización de estado del servidor

### Vistas y Funcionalidades
- [[Páginas y Rutas]] - Listado de todas las páginas de la aplicación
- [[Home y Dashboard]] - Página de inicio y panel de control
- [[Cuentas]] - Gestión de cuentas bancarias
- [[Movimientos]] - Registro y visualización de transacciones
- [[Categorías]] - Sistema de categorización
- [[Informes]] - Reportes y análisis visual

### Recursos Técnicos
- [[Patrones y Convenciones]] - Estándares de código del proyecto
- [[Estilos y Temas]] - Sistema de temas y estilos global
- [[Validación y Schemas]] - Definiciones Zod para validación

---

## 🚀 Comandos Principales

```bash
npm run dev          # Iniciar desarrollo
npm run build        # Build para producción
npm run lint         # Verificar estándares
npm test             # Ejecutar tests
npm run gen:types    # Generar tipos de Supabase
```

> Para más detalles, ver [[CLAUDE.md]](file:///g:/Developer/arg3ni5-cgastos/CLAUDE.md)

---

## 🔍 Cómo Usar Esta Documentación

Esta documentación está diseñada como un **wiki conectado** siguiendo el modelo de Obsidian:

1. **Comienza aquí** para entender el contexto general
2. **Explora por temas** usando los enlaces [[wikilinks]]
3. **Navega entre notas** para entender cómo se conectan los conceptos
4. Cada nota tiene referencias bidireccionales que te permiten entender las relaciones

> 💡 **Tip**: Los enlaces en `[[doble corchete]]` conectan las notas entre sí
