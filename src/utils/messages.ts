import { logger } from './logger'
import { useToastStore } from '../store/ToastStore'

/**
 * Display an error message to the user
 */
export function showErrorMessage (message: string, title: string = '❌ Error'): void {
  logger.error('User-facing error displayed', { message, title })
  useToastStore.getState().addToast({ type: 'error', message, duration: 4000 })
}

/**
 * Display a success message to the user
 */
export function showSuccessMessage (message: string, title: string = '✅ Éxito'): void {
  logger.info('User-facing success displayed', { message, title })
  useToastStore.getState().addToast({ type: 'success', message, duration: 3000 })
}

/**
 * Display a warning message to the user
 */
export function showWarningMessage (message: string, title: string = '⚠️ Advertencia'): void {
  logger.warn('User-facing warning displayed', { message, title })
  useToastStore.getState().addToast({ type: 'warning', message, duration: 4000 })
}

/**
 * Display a confirmation dialog — returns a Promise<boolean>.
 * Callers must render a <ConfirmDialog> component to handle this;
 * this helper now delegates to a simple browser confirm as a fallback
 * to keep the async API working in non-React contexts (e.g. utils).
 */
export async function showConfirmDialog (
  message: string,
  _title: string = '¿Estás seguro?',
  _confirmText: string = 'Sí, confirmar',
  _cancelText: string = 'Cancelar'
): Promise<boolean> {
  return window.confirm(message)
}
