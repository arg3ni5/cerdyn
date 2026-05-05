import { create } from 'zustand';
import type { Tipo } from './OperacionesStore';

interface MovimientoModalState {
  isOpen: boolean;
  tipoRegistro?: Tipo;
  openMovimientoModal: (tipoRegistro?: Tipo) => void;
  closeMovimientoModal: () => void;
}

export const useMovimientoModalStore = create<MovimientoModalState>((set) => ({
  isOpen: false,
  tipoRegistro: undefined,
  openMovimientoModal: (tipoRegistro) => set({ isOpen: true, tipoRegistro }),
  closeMovimientoModal: () => set({ isOpen: false }),
}));
