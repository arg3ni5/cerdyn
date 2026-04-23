# Atomic Design en Cerdyn

La aplicación utiliza una metodología de diseño atómico para garantizar la escalabilidad y reutilización de los componentes de UI.

## 🧩 Niveles de Componentes

1. **Átomos (`atomos/`)**: Componentes básicos e indivisibles (Botones, Inputs, Labels).
2. **Moléculas (`moleculas/`)**: Grupos de átomos que forman una unidad funcional (un campo de entrada con su etiqueta).
3. **Organismos (`organismos/`)**: Componentes complejos formados por moléculas y átomos que crean una sección distintiva de la interfaz (Navbar, Sidebars, Formularios complejos).
4. **Templates (`templates/`)**: Estructuras de página que definen el layout sin contenido real.

## 🚀 Flujo de Implementación
`Átomo` $\rightarrow$ `Molécula` $\rightarrow$ `Organismo` $\rightarrow$ `Template` $\rightarrow$ `Página`
