# Cerdyn - Sistema de Control de Gastos

## 📌 Descripción General
Cerdyn es una aplicación de gestión de finanzas personales diseñada para controlar gastos e ingresos de forma rápida y sencilla. Permite la gestión de múltiples cuentas, categorización de movimientos y visualización de datos mediante gráficos.

### 🚀 Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Vite
- **Estado**: [[Zustand Store]] (Global) y TanStack Query (Server State)
- **Backend**: [[Supabase]] (PostgreSQL & Auth)
- **Estilos**: Styled Components + MUI
- **Validación**: Zod

## 🏗️ Arquitectura y Estructura
La aplicación sigue una organización modular basada en la separación de responsabilidades:

- **Componentes**: Implementa [[Atomic Design]]
- **Lógica de Datos**: Capa de servicios en `src/supabase/`
- **Estado**: Stores centralizados en `src/store/`
- **Navegación**: Rutas protegidas mediante [[Protección de Rutas]]

## 🗺️ Mapa de Navegación
- [[Estructura de Carpetas]]
- [[Flujo de Datos]]
- [[Guía de Componentes]]
- [[Gestión de Estado]]
- [[Integración con Supabase]]
