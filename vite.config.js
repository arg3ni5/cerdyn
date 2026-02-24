import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Transformamos el export en una función para acceder al 'mode'
export default defineConfig(({ mode }) => {
  // Carga las variables del archivo .env y del sistema (GitHub Actions)
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Si la variable VITE_DEPLOY_TARGET es 'gh-pages', usa el subdirectorio.
    // De lo contrario (Firebase o Local), usa la raíz '/'.
    base: env.VITE_DEPLOY_TARGET === 'gh-pages' ? '/cerdyn/' : '/',

    plugins: [
      react(),
    ],

    // Opcional: Esto ayuda a evitar errores de caché en algunos navegadores
    server: {
      historyApiFallback: true,
    }
  }
})