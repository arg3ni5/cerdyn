# Protección de Rutas

Para asegurar que los usuarios no accedan a páginas privadas sin estar autenticados, Cerdyn implementa una capa de protección.

## 🛡️ ProtectedRoute.tsx
Este hook/componente actúa como un middleware de React:
1. Verifica el estado de autenticación en el `AuthStore`.
2. Si el usuario **está autenticado**, renderiza el contenido de la página.
3. Si el usuario **no está autenticado**, redirige automáticamente al `/login`.

## 🗺️ Implementación en Routers
El sistema de rutas envuelve las páginas privadas con el componente de protección, asegurando que la sesión sea validada antes de montar el componente de la página.
