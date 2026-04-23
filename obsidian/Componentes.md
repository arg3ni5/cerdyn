# Componentes - Sistema de Atomic Design

La aplicación sigue el patrón **Atomic Design** para organizar componentes React de manera escalable y reutilizable.

Ver: [[Distribución de Carpetas#📦 src/components/ - Sistema de Atomic Design]]

---

## 🧬 Níveis del Atomic Design

### 1️⃣ Átomos (Atomos)

Son los bloques de construcción más pequeños. **No tienen lógica de negocio**, solo presentan información.

#### Ejemplos:
- `BtnCerrar.tsx` - Botón simple para cerrar
- `Colorcontent.tsx` - Mostrador de color
- `ContentHeader.tsx` - Header genérico
- `Icono.tsx` - Ícono reutilizable
- `InputTextNumber.tsx` - Input de texto/número

#### Características:
- ✅ Totalmente reutilizables
- ✅ Altamente específicos
- ✅ Sin lógica de estado compleja
- ✅ Aceptan props para customización

#### Ejemplo:
```typescript
interface BtnCerrarProps {
  onClick: () => void;
}

export const BtnCerrar = ({ onClick }: BtnCerarProps) => (
  <button onClick={onClick}>✕</button>
);
```

---

### 2️⃣ Moléculas (Moleculas)

Grupos simples de átomos unidos junto para una función específica. Todavía son reutilizables pero más complejos.

#### Ejemplos:
- `BtnForm.tsx` - Botón para formularios
- `BtnCircular.tsx` - Botón circular
- `InputBuscadorLista.tsx` - Input con búsqueda en lista
- `ItemsDesplegable.tsx` - Items de menú desplegable
- `ListaMenuDesplegable.tsx` - Menú completo desplegable
- `Spinner.tsx` - Indicador de carga
- `Carousel.tsx` - Carrusel de items
- `ListaGenerica.tsx` - Lista genérica reutilizable

#### Características:
- ✅ Combinación de átomos
- ✅ Funcionalidad específica pero reutilizable
- ✅ Pueden tener pequeño estado local
- ✅ Lógica de UI simple

#### Ejemplo:
```typescript
// Molécula: Spinner + Texto
export const SpinnerLoader = () => (
  <Container>
    <Spinner />
    <Text>Cargando...</Text>
  </Container>
);
```

---

### 3️⃣ Organismos (Organismos)

Combinaciones complejas de moléculas y átomos. Contienen **lógica de negocio** y estado significativo.

#### Ejemplos por Categoría:

**Navegación:**
- `Header.tsx` - Header principal de la app
- `Sidebar.tsx` - Barra lateral de navegación
- `Menuambur.tsx` - Menú hamburguesa mobile
- `Tabs.tsx` - Sistema de tabs

**Datos:**
- `DataUser.tsx` - Información del usuario
- `CardTotales.tsx` - Tarjeta de totales/resumen
- `CardEliminarData.tsx` - Modal de confirmación eliminar

**Formularios:**
- `formularios/RegistrarCategorias.tsx` - Formulario crear categoría
- `formularios/RegistrarCuentas.tsx` - Formulario crear cuenta
- `formularios/RegistrarMovimientos.tsx` - Formulario crear movimiento
- `formularios/InputText.tsx` - Input validado
- `formularios/InputNumber.tsx` - Input número validado

**Tablas:**
- `tablas/TablaMovimientos.tsx` - Tabla de movimientos con paginación
- `tablas/TablaCategorias.tsx` - Tabla de categorías
- `tablas/Paginacion.tsx` - Control de paginación
- `tablas/AccionesTabla.tsx` - Botones de acción en tabla

**Gráficos:**
- `graficas/Barras.tsx` - Gráfico de barras (Chart.js)
- `graficas/Dona.tsx` - Gráfico de dona/pie
- `graficas/Lineal.tsx` - Gráfico lineal

**Otros:**
- `CalendarioLineal.tsx` - Calendario para seleccionar fechas
- `ListaPaises.tsx` - Lista de países seleccionable
- `Selector.tsx` - Selector genérico

#### Características:
- ✅ Contienen lógica de negocio
- ✅ Conectan con stores (Zustand)
- ✅ Pueden hacer queries a API
- ✅ Manejan estado complejo
- ✅ Reutilizables en múltiples páginas

#### Ejemplo:
```typescript
export const TablaMovimientos = () => {
  const { movimientos } = useMovimientosStore();
  const [page, setPage] = useState(1);

  const columns = [...];

  return (
    <Container>
      <Table data={movimientos} columns={columns} />
      <Paginacion page={page} onChange={setPage} />
    </Container>
  );
};
```

---

### 4️⃣ Templates (Templates)

Layouts o estructura de página. Combinan organismos en un patrón específico para una página o sección.

#### Ejemplos:
- `PlantillaBase.tsx` - Template base/genérico
- `LoginTemplate.tsx` - Layout para login
- `HomeTemplate.tsx` - Layout para página inicio
- `DashboardTemplate.tsx` - Layout para dashboard
- `CuentasTemplate.tsx` - Layout para gestión cuentas
- `CategoriasTemplate.tsx` - Layout para categorías
- `MovimientosTemplate.tsx` - Layout para movimientos
- `InformesTemplate.tsx` - Layout para reportes
- `ConexionesTemplate.tsx` - Layout para integraciones

#### Características:
- ✅ Solo composición de organismos
- ✅ Definen la estructura visual de la página
- ✅ Generalmente no tienen lógica propia
- ✅ Receptáculos para el contenido

#### Ejemplo:
```typescript
export const CuentasTemplate = () => (
  <Container>
    <Header title="Mi Cuentas" />
    <RegistrarCuentas />
    <ListaCuentas />
  </Container>
);
```

---

## 📊 Flujo de Composición

```
ÁTOMOS (simples)
    ↓
MOLÉCULAS (combinación de átomos)
    ↓
ORGANISMOS (moléculas + lógica)
    ↓
TEMPLATES (estructura de página)
    ↓
PÁGINAS (rutas específicas)
```

---

## 🎯 Principios de Uso

### ✅ Qué Hacer

1. **Usa átomos para elementos UI básicos**
   ```typescript
   <BtnCerrar onClick={handleClose} />
   <Icono name="check" />
   ```

2. **Agrupa átomos en moléculas para patrones comunes**
   ```typescript
   <InputBuscadorLista items={items} />
   <ListaMenuDesplegable options={options} />
   ```

3. **Pon lógica de negocio en organismos**
   ```typescript
   // En TablaMovimientos
   const { movimientos, eliminar } = useMovimientosStore();
   ```

4. **Usa templates para estructura de página**
   ```typescript
   <DashboardTemplate>
     <CardTotales />
     <TablaMovimientos />
   </DashboardTemplate>
   ```

### ❌ Qué Evitar

- ❌ Lógica compleja en átomos/moléculas
- ❌ Organismos duplicados (reutiliza)
- ❌ Templates con lógica de negocio
- ❌ Pasar demasiadas props (usa stores)

---

## 💡 Ejemplos Prácticos

### Crear un Nuevo Componente

**Paso 1**: Determinar el nivel
```
¿Es solo UI? → Átomo
¿Es combinación simple de UI? → Molécula
¿Tiene lógica o estado? → Organismo
¿Es estructura de página? → Template
```

**Paso 2**: Crear el archivo en la carpeta correcta
```bash
src/components/organismos/MiNuevoComponente.tsx
```

**Paso 3**: Implementar con tipos
```typescript
interface MiNuevoComponenteProps {
  title: string;
  onSave: (data: any) => void;
}

export const MiNuevoComponente = ({
  title,
  onSave
}: MiNuevoComponenteProps) => {
  return <div>{title}</div>;
};
```

**Paso 4**: Exportar en `src/index.ts`
```typescript
export { MiNuevoComponente } from './components/organismos/MiNuevoComponente';
```

---

## 🔗 Relaciones de Notas

- [[Distribución de Carpetas]] - ubicación exacta de cada componente
- [[Hooks y Context]] - cómo conectar componentes con estado
- [[Stores Zustand]] - state management en componentes
- [[Páginas y Rutas]] - dónde se usan los templates
