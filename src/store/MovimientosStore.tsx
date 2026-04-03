import { create } from "zustand";
import {
  MostrarMovimientosPorMesAño,
  InsertarMovimientos,
  EliminarMovimientos,
  RptMovimientosPorMesAño,
  MovimientosMesAnio,
  MovimientosMesAnioParams,
  RptMovimientosMesAnio,
  RptMovimientosMesAnioParams,
  MovimientoInsert,
  Movimiento,
  MovimientoUpdate,
  ActualizarMovimientos,
  RptMovimientosMesAnioJson,
  RptMovimientosPorMesAñoJson
} from "../index";
import { logger } from "../utils/logger";
import { InsertarMovimientosMasivo } from "../supabase/crudMovimientosRecurrentes";
import {
  generarFechasIntervalo,
  generarFechasMensual,
  ModoRecurrencia,
  PoliticaInicioMensual,
} from "../utils/recurrencia";
import { esPagado, calcularTotalesBalance } from "../utils/totalesUtils";

export interface ConfigRecurrencia {
  modo: ModoRecurrencia;
  repeticiones: number;
  intervaloDias?: number;
  diaMes?: number;
  politica?: PoliticaInicioMensual;
}

export interface DataRptMovimientosAñoMes {
  i: RptMovimientosMesAnio;
  g: RptMovimientosMesAnio;
}
export interface DataMovimientos {
  i: MovimientosMesAnio;
  g: MovimientosMesAnio;
  t: MovimientosMesAnio;
}
interface MovimientosState {
  datamovimientos: DataMovimientos;
  rptParams: RptMovimientosMesAnioParams;
  dataRptMovimientosAñoMes: DataRptMovimientosAñoMes;
  totalMesAño: number;
  totalMesAñoPagados: number;
  totalMesAñoPendientes: number;
  ingresosPagadosMes: number;
  gastosPagadosMes: number;
  filtroDescripcion: string;
  filtroCategoria: string;
  parametros: MovimientosMesAnioParams;
  setFiltros: (descripcion: string, categoria: string) => void;
  mostrarMovimientos: (p: MovimientosMesAnioParams) => Promise<DataMovimientos>;
  setDatamovimientos: (data: DataMovimientos) => void;
  calcularTotales: (data: DataMovimientos) => void;
  insertarMovimientos: (p: MovimientoInsert) => Promise<void>;
  actualizarMovimientos: (p: MovimientoUpdate) => Promise<void>;
  eliminarMovimiento: (p: Movimiento) => Promise<void>;
  rptMovimientosAñoMes: (p: RptMovimientosMesAnioParams) => Promise<DataRptMovimientosAñoMes | null>;
  rptMovimientosAñoMesJson: (p: RptMovimientosMesAnioParams) => Promise<RptMovimientosMesAnioJson | null>;
  previewRecurrencia: (base: MovimientoInsert, config: ConfigRecurrencia) => string[];
  insertarMovimientosRecurrentes: (base: MovimientoInsert, config: ConfigRecurrencia) => Promise<void>;
}

export const useMovimientosStore = create<MovimientosState>()((set, get) => ({
  rptParams: {} as RptMovimientosMesAnioParams,
  datamovimientos: {} as DataMovimientos,
  dataRptMovimientosAñoMes: {} as DataRptMovimientosAñoMes,
  totalMesAño: 0,
  totalMesAñoPagados: 0,
  totalMesAñoPendientes: 0,
  ingresosPagadosMes: 0,
  gastosPagadosMes: 0,
  filtroDescripcion: "",
  filtroCategoria: "",
  parametros: {} as MovimientosMesAnioParams,

  setFiltros: (descripcion: string, categoria: string) => {
    set({ filtroDescripcion: descripcion, filtroCategoria: categoria });
  },

  mostrarMovimientos: async (p: MovimientosMesAnioParams) => {
    try {
      set({ parametros: p });
      const currentState = get();

      let i = p.tipocategoria === "i" || p.tipocategoria === "b" ?
        await MostrarMovimientosPorMesAño({ ...p, tipocategoria: "i" }) || [] : currentState.datamovimientos.i || [];
      let g = p.tipocategoria === "g" || p.tipocategoria === "b" ?
        await MostrarMovimientosPorMesAño({ ...p, tipocategoria: "g" }) || [] : currentState.datamovimientos.g || [];
      let t = p.tipocategoria === "t" || p.tipocategoria === "b" ?
        await MostrarMovimientosPorMesAño({ ...p, tipocategoria: "t" }) || [] : currentState.datamovimientos.t || [];

      // Convertir estado a booleano
      i = i?.map(item => ({
        ...item,
        estado: esPagado(item.estado)
      })) || [];

      g = g?.map(item => ({
        ...item,
        estado: esPagado(item.estado)
      })) || [];

      t = t?.map(item => ({
        ...item,
        estado: esPagado(item.estado)
      })) || [];

      const response = { i, g, t };

      const { setDatamovimientos } = get();
      setDatamovimientos(response);
      return response;
    } catch (error) {
      logger.error('Error al mostrar movimientos en store', { error, params: p });
      return { i: [], g: [], t: [] };
    }
  },

  setDatamovimientos: (data: DataMovimientos) => {
    const { calcularTotales } = get();
    set({ datamovimientos: data });
    calcularTotales(data);
  },

  calcularTotales: (data: DataMovimientos): void => {
    try {
      const { parametros } = get();

      if (parametros.tipocategoria === "b") {
        // Balance: only ingresos and gastos, transfers don't affect the balance total
        const totales = calcularTotalesBalance(data.i || [], data.g || []);

        logger.debug('Totales calculados (ambos)', totales);

        set(totales);
        return;
      }

      if (parametros.tipocategoria === "t") {
        // Transfers: show total amount transferred (informational, no sign)
        const movimientos = data.t || [];
        const dtPagados = movimientos.filter(item => esPagado(item.estado));
        const dtPendientes = movimientos.filter(item => !esPagado(item.estado));

        const total = movimientos.reduce((sum, item) => sum + Number(item.valor), 0);
        const tpagados = dtPagados.reduce((sum, item) => sum + Number(item.valor), 0);
        const tpendientes = dtPendientes.reduce((sum, item) => sum + Number(item.valor), 0);

        set({ totalMesAño: total, totalMesAñoPagados: tpagados, totalMesAñoPendientes: tpendientes });
        logger.debug('Totales calculados (transferencias)', { total, tpagados, tpendientes });
        return;
      }

      const tipo = parametros.tipocategoria === "i" ? "i" : "g";
      const movimientos = data[tipo];

      const dtPagados = movimientos?.filter(item => esPagado(item.estado));
      const dtPendientes = movimientos?.filter(item => !esPagado(item.estado));

      const total = movimientos?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;
      const tpagados = dtPagados?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;
      const tpendientes = dtPendientes?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      set({
        totalMesAño: total,
        totalMesAñoPagados: tpagados,
        totalMesAñoPendientes: tpendientes
      });

      logger.debug('Totales calculados', { tipo, total, tpagados, tpendientes });
    } catch (error) {
      logger.error('Error al calcular totales', { error, data });
    }
  },

  actualizarMovimientos: async (p: MovimientoUpdate): Promise<void> => {
    try {
      await ActualizarMovimientos(p);
      const { mostrarMovimientos, parametros } = get();
      await mostrarMovimientos(parametros);
      logger.debug('Movimiento actualizado y lista refrescada', { movimientoId: p.id });
    } catch (error) {
      logger.error('Error al actualizar movimiento en store', { error, movimientoId: p.id });
      throw error;
    }
  },

  insertarMovimientos: async (p: MovimientoInsert): Promise<void> => {
    try {
      await InsertarMovimientos(p);
      const { mostrarMovimientos, parametros } = get();
      await mostrarMovimientos(parametros);
      logger.debug('Movimiento insertado y lista refrescada');
    } catch (error) {
      logger.error('Error al insertar movimiento en store', { error, movimiento: p });
      throw error;
    }
  },

  eliminarMovimiento: async (p: Movimiento): Promise<void> => {
    try {
      await EliminarMovimientos(p);
      const { parametros, mostrarMovimientos } = get();
      await mostrarMovimientos(parametros);
      logger.debug('Movimiento eliminado y lista refrescada', { movimientoId: p.id });
    } catch (error) {
      logger.error('Error al eliminar movimiento en store', { error, movimientoId: p.id });
      throw error;
    }
  },

  rptMovimientosAñoMes: async (p: RptMovimientosMesAnioParams): Promise<DataRptMovimientosAñoMes> => {
    try {
      set({ rptParams: p });
      const i = p.tipocategoria === "i" || p.tipocategoria === "b" ?
        await RptMovimientosPorMesAño({ ...p, tipocategoria: "i" }) || [] : [];
      const g = p.tipocategoria === "g" || p.tipocategoria === "b" ?
        await RptMovimientosPorMesAño({ ...p, tipocategoria: "g" }) || [] : [];
      const response = { i, g };
      set({ dataRptMovimientosAñoMes: { i: i || [], g: g || [] } });
      logger.debug('Reporte de movimientos generado', { params: p });
      return response;
    } catch (error) {
      logger.error('Error al generar reporte de movimientos', { error, params: p });
      return { i: [], g: [] };
    }
  },


  rptMovimientosAñoMesJson: async (p: RptMovimientosMesAnioParams): Promise<RptMovimientosMesAnioJson | null> => {
    try {
      const response = await RptMovimientosPorMesAñoJson(p);
      logger.debug('Reporte de movimientos (JSON) generado', { params: p });
      return response;
    } catch (error) {
      logger.error('Error al generar reporte de movimientos (JSON)', { error, params: p });
      return null;
    }
  },

  previewRecurrencia: (base: MovimientoInsert, config: ConfigRecurrencia): string[] => {
    if (config.modo === 'intervalo') {
      if (config.intervaloDias == null) {
        logger.error("ConfigRecurrencia.intervaloDias es requerido cuando modo es 'intervalo'", { config });
        throw new Error("intervaloDias es requerido cuando el modo de recurrencia es 'intervalo'");
      }
      const fechaBase = base.fecha || new Date().toISOString().slice(0, 10);
      return generarFechasIntervalo(fechaBase, config.intervaloDias, config.repeticiones);
    }
    if (config.diaMes == null || config.politica == null) {
      logger.error('ConfigRecurrencia inválida: diaMes y politica son requeridos para modo mensual', { config });
      throw new Error('diaMes y politica son requeridos cuando el modo de recurrencia es mensual');
    }
    return generarFechasMensual(
      config.diaMes,
      config.repeticiones,
      config.politica
    );
  },

  insertarMovimientosRecurrentes: async (
    base: MovimientoInsert,
    config: ConfigRecurrencia
  ): Promise<void> => {
    try {
      const { previewRecurrencia, mostrarMovimientos, parametros } = get();
      const fechas = previewRecurrencia(base, config);
      const items: MovimientoInsert[] = fechas.map((fecha) => ({ ...base, fecha }));
      await InsertarMovimientosMasivo(items);
      await mostrarMovimientos(parametros);
      logger.debug('Movimientos recurrentes insertados y lista refrescada', {
        cantidad: items.length,
      });
    } catch (error) {
      logger.error('Error al insertar movimientos recurrentes en store', { error });
      throw error;
    }
  },
}));
