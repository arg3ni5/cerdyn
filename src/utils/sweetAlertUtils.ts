import { useToastStore } from '../store/ToastStore'

export const showErrorMessage = (text: string, _title: string = "Error"): void => {
  useToastStore.getState().addToast({ type: 'error', message: text, duration: 4000 })
}

export const showSuccessMessage = (text: string = "Operación exitosa", timer: number = 3000): void => {
  useToastStore.getState().addToast({ type: 'success', message: text, duration: timer })
}