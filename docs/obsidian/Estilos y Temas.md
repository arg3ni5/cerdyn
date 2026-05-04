# Estilos y Temas

Sistema de estilos globales y tema dinámico (claro/oscuro) de la aplicación.

Ver: [[Distribución de Carpetas#🎨 src/styles/ - Estilos Globales]]

---

## 🎨 Stack de Estilos

La aplicación usa:
- **Styled Components** - CSS-in-JS con template literals
- **Emotion** - Usado por Material-UI
- **Material-UI** - Componentes pre-construidos
- **CSS Grid/Flexbox** - Layouts responsivos

---

## 🌈 Sistema de Temas

### Archivos Relacionados

```
src/styles/
├── themes.ts          # Definición de temas (Light/Dark)
├── GlobalStyles.ts    # Estilos globales aplicados a toda la app
├── variables.ts       # Paleta de colores y variables compartidas
├── breakpoints.ts     # Media queries para responsive
└── (componentes con .styles.ts)
```

---

## 🎭 Definir Temas

**Archivo**: `src/styles/themes.ts`

```typescript
export const Light = {
  // Colores principales
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',

  // Colores de texto
  text: '#000000',
  textSecondary: '#6C757D',

  // Fondos
  bg: '#FFFFFF',
  bgSecondary: '#F5F5F5',
  bgTertiary: '#E9E9E9',

  // Componentes
  border: '#CCCCCC',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Total
  bgtotal: '#FFFFFF'
};

export const Dark = {
  // Colores principales (mismos)
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',

  // Colores oscuros
  text: '#F0F0F0',
  textSecondary: '#B0B0B0',

  // Fondos oscuros
  bg: '#1E1E1E',
  bgSecondary: '#2A2A2A',
  bgTertiary: '#3A3A3A',

  // Componentes oscuros
  border: '#444444',
  shadow: 'rgba(0, 0, 0, 0.5)',

  // Total
  bgtotal: '#121212'
};

// TypeScript type
export type Theme = typeof Light;
```

---

## 🌍 Global Styles

**Archivo**: `src/styles/GlobalStyles.ts`

```typescript
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  button {
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    padding: 8px 12px;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}33;
  }
`;
```

---

## 📐 Breakpoints Responsivos

**Archivo**: `src/styles/breakpoints.ts`

```typescript
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};

export const Device = {
  mobile: `(max-width: ${breakpoints.mobile})`,
  tablet: `(min-width: ${breakpoints.tablet})`,
  desktop: `(min-width: ${breakpoints.desktop})`,
  wide: `(min-width: ${breakpoints.wide})`
};
```

### Uso

```typescript
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  @media ${Device.tablet} {
    grid-template-columns: 200px 1fr;
  }

  @media ${Device.desktop} {
    grid-template-columns: 250px 1fr;
  }
`;
```

---

## 🎨 Usar Temas en Componentes

### Acceder al Theme en Styled Components

```typescript
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};

  &:hover {
    background-color: ${({ theme }) => theme.secondary};
  }
`;
```

### Acceder al Theme en App.tsx

```typescript
import { ThemeContext } from './App';

function MiComponente() {
  const theme = useContext(ThemeContext);

  return <div style={{ color: theme.text }}>
    Contenido
  </div>;
}
```

---

## 🔄 Cambiar Tema Dinámicamente

### En App.tsx

```typescript
function App() {
  const { usuario } = useUsuariosStore();

  // tema "0" = light, "1" = dark
  const themeName = usuario?.tema === "0" ? "light" : "dark";
  const themeStyle = themeName === "light" ? Light : Dark;

  return (
    <ThemeProvider theme={themeStyle}>
      {/* App aquí */}
    </ThemeProvider>
  );
}
```

### En Configuración

Usuario puede cambiar tema en `/configurar`:

```typescript
// En Configuracion.tsx
const handleChangeTheme = async (numeroTema: "0" | "1") => {
  // Actualizar usuario en BD
  await ActualizarUsuario(usuarioId, { tema: numeroTema });

  // Actualizar store
  setUsuario({ ...usuario, tema: numeroTema });

  // App re-renderiza con nuevo tema
};
```

---

## 📐 Variables Compartidas

**Archivo**: `src/styles/variables.ts`

```typescript
export const colors = {
  // Primarios
  primary: '#007BFF',
  secondary: '#6C757D',

  // Estados
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',

  // Categorías de dinero
  ingresos: '#10B981',
  egresos: '#EF4444'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px'
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  round: '50%'
};

export const transitions = {
  fast: '0.15s ease-in-out',
  smooth: '0.3s ease-in-out',
  slow: '0.6s ease-in-out'
};
```

---

## 🎯 Mejores Prácticas

### ✅ Qué Hacer

1. **Usar theme para colores**
   ```typescript
   const Button = styled.button`
     color: ${({ theme }) => theme.text};
     background: ${({ theme }) => theme.primary};
   `;
   ```

2. **Usar variables compartidas**
   ```typescript
   import { spacing, colors } from '../styles/variables';

   const Container = styled.div`
     padding: ${spacing.md};
     border-radius: ${borderRadius.md};
   `;
   ```

3. **Usar breakpoints para responsive**
   ```typescript
   const Grid = styled.div`
     grid-template-columns: 1fr;

     @media ${Device.tablet} {
       grid-template-columns: 1fr 1fr;
     }
   `;
   ```

4. **Definir transitions**
   ```typescript
   const Link = styled.a`
     color: ${({ theme }) => theme.primary};
     transition: ${transitions.smooth};

     &:hover {
       color: ${({ theme }) => theme.secondary};
     }
   `;
   ```

### ❌ Qué Evitar

- ❌ Hardcodear colores
  ```typescript
  // MAL
  background: '#007BFF';

  // BIEN
  background: ${({ theme }) => theme.primary};
  ```

- ❌ No usar responsive
  ```typescript
  // MAL - No se ve bien en móvil
  grid-template-columns: 200px 1fr;

  // BIEN
  grid-template-columns: 1fr;
  @media ${Device.tablet} {
    grid-template-columns: 200px 1fr;
  }
  ```

- ❌ Estilos inline sin necesidad
  ```typescript
  // MAL
  <div style={{ color: 'red', fontSize: '16px' }}>

  // BIEN
  <StyledDiv />
  ```

---

## 📱 Ejemplo Completo: Card Responsiva

```typescript
import styled from 'styled-components';
import { spacing, borderRadius, shadows } from '../styles/variables';
import { Device } from '../styles/breakpoints';

const CardContainer = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
  box-shadow: ${shadows.md};

  margin-bottom: ${spacing.lg};

  /* Mobile first */
  display: flex;
  flex-direction: column;

  /* Tablet+ */
  @media ${Device.tablet} {
    flex-direction: row;
    align-items: center;
    gap: ${spacing.lg};
  }

  /* Desktop+ */
  @media ${Device.desktop} {
    padding: ${spacing.xl};
  }
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  margin-bottom: ${spacing.sm};
`;

const CardContent = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
`;

export const Card = ({ title, content }) => (
  <CardContainer>
    <div>
      <CardTitle>{title}</CardTitle>
      <CardContent>{content}</CardContent>
    </div>
  </CardContainer>
);
```

---

## 🔗 Relaciones de Notas

- [[Componentes]] - cómo se usan estilos en componentes
- [[Páginas y Rutas]] - estilos en pages
- [[Stack Tecnológico]] - styled-components en stack
- [[Distribución de Carpetas]] - ubicación de styles
