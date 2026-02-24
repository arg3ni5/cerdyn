import { create } from "zustand";
import {
  Categoria,
  CategoriaInsert,
  CategoriaQueryParams,
  CategoriaUpdate,
  EditarCategorias,
  EliminarCategorias, EliminarCategoriasTodas,
  InsertarCategorias,
  MostrarCategorias,
} from "../index";
import { logger } from "../utils/logger";
import { queryClient } from "../config/queryClient";

interface CategoriaStore {
  datacategoria: Categoria[] | null;
  categoriaItemSelect: Categoria | null;
  parametros: CategoriaQueryParams | null;
  mostrarCategorias: (p: CategoriaQueryParams) => Promise<Categoria[]>;
  selectCategoria: (p: Categoria) => void;
  insertarCategorias: (p: CategoriaInsert) => Promise<void>;
  eliminarCategoria: (p: CategoriaQueryParams) => Promise<void>;
  eliminarCategoriasTodas: (p: Pick<CategoriaQueryParams, 'idusuario'>) => Promise<void>;
  editarCategoria: (p: CategoriaUpdate) => Promise<void>;
}

export const useCategoriasStore = create<CategoriaStore>((set, get) => ({
  datacategoria: [],
  categoriaItemSelect: null,
  parametros: null,

  mostrarCategorias: async (p: CategoriaQueryParams): Promise<Categoria[]> => {
    try {
      const response = await MostrarCategorias(p);
      set({ parametros: p });
      set({ datacategoria: response });
      set({ categoriaItemSelect: response && response[0] });
      logger.debug('Categorías cargadas exitosamente', { count: response?.length || 0 });
      return response || [];
    } catch (error) {
      logger.error('Error al mostrar categorías en store', { error, params: p });
      return [];
    }
  },

  selectCategoria: (p) => {
    set({ categoriaItemSelect: p });
    logger.debug('Categoría seleccionada', { categoriaId: p.id });
  },

  insertarCategorias: async (p) => {
    try {
      await InsertarCategorias(p);
      const { mostrarCategorias, parametros } = get();
      if (parametros) {
        await mostrarCategorias(parametros);
      }
      queryClient.invalidateQueries({ queryKey: ["mostrar categorias"] });
      logger.debug('Categoría insertada y lista actualizada');
    } catch (error) {
      logger.error('Error al insertar categoría en store', { error, categoria: p });
      throw error;
    }
  },

  eliminarCategoria: async (p: CategoriaQueryParams) => {
    try {
      await EliminarCategorias(p);
      const { mostrarCategorias, parametros } = get();
      if (parametros) {
        await mostrarCategorias(parametros);
      }
      queryClient.invalidateQueries({ queryKey: ["mostrar categorias"] });
      logger.debug('Categoría eliminada y lista actualizada', { categoriaId: p.id });
    } catch (error) {
      logger.error('Error al eliminar categoría en store', { error, categoriaId: p.id });
      throw error;
    }
  },

  eliminarCategoriasTodas: async (p: Pick<CategoriaQueryParams, 'idusuario'>) => {
    try {
      await EliminarCategoriasTodas(p);
      const { mostrarCategorias, parametros } = get();
      if (parametros) {
        await mostrarCategorias(parametros);
      }
      queryClient.invalidateQueries({ queryKey: ["mostrar categorias"] });
      logger.debug('Todas las categorías eliminadas y lista actualizada', { userId: p.idusuario });
    } catch (error) {
      logger.error('Error al eliminar todas las categorías en store', { error, userId: p.idusuario });
      throw error;
    }
  },

  editarCategoria: async (p: CategoriaUpdate) => {
    try {
      await EditarCategorias(p);
      const { mostrarCategorias, parametros } = get();
      if (parametros) {
        await mostrarCategorias(parametros);
      }
      queryClient.invalidateQueries({ queryKey: ["mostrar categorias"] });
      logger.debug('Categoría editada y lista actualizada', { categoriaId: p.id });
    } catch (error) {
      logger.error('Error al editar categoría en store', { error, categoriaId: p.id });
      throw error;
    }
  },
}));
