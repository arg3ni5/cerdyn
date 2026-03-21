import { Database, supabase } from "../index";
import { movimientoInsertSchema, movimientoUpdateSchema } from "../schemas/movimiento.schema";
import { logger } from "../utils/logger";
import { showErrorMessage, showSuccessMessage } from "../utils/messages";
import { z } from "zod";

export type Movimiento = Database["public"]["Tables"]["movimientos"]["Row"];
export type MovimientoInsert = Database["public"]["Tables"]["movimientos"]["Insert"];
export type MovimientoUpdate = Database["public"]["Tables"]["movimientos"]["Update"];

export const InsertarMovimientos = async (p: MovimientoInsert): Promise<void> => {
  try {
    // Validate data before inserting
    const validatedData = movimientoInsertSchema.parse(p);

    const { data, error } = await supabase
      .from("movimientos")
      .insert(validatedData)
      .select();

    if (error) throw error;

    if (data) {
      logger.info('Movimiento creado exitosamente', { movimientoId: data[0]?.id });
      showSuccessMessage("Registrado");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => e.message).join(', ');
      logger.error('Error de validación al insertar movimiento', { error: errorMessage, movimiento: p });
      showErrorMessage(`Datos inválidos: ${errorMessage}`);
    } else {
      logger.error('Error al insertar movimiento', { error, movimiento: p });
      showErrorMessage('No se pudo registrar el movimiento. Por favor, intenta nuevamente.');
    }
    throw error;
  }
};

export const EliminarMovimientos = async (p: Movimiento): Promise<void> => {
  try {
    const { error } = await supabase
      .from("movimientos")
      .delete()
      .eq("id", p.id);

    if (error) throw error;
    logger.info('Movimiento eliminado exitosamente', { movimientoId: p.id });
  } catch (error) {
    logger.error('Error al eliminar movimiento', { error, movimientoId: p.id });
    showErrorMessage('No se pudo eliminar el movimiento. Por favor, intenta nuevamente.');
    throw error;
  }
};

export const ActualizarMovimientos = async (p: MovimientoUpdate): Promise<void> => {
  try {
    if (!p.id) {
      throw new Error("No se puede actualizar el registro sin ID");
    }

    // Validate data before updating
    const validatedData = movimientoUpdateSchema.parse(p);

    const { error } = await supabase
      .from("movimientos")
      .update(validatedData)
      .eq("id", p.id);

    if (error) throw error;
    logger.info('Movimiento actualizado exitosamente', { movimientoId: p.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => e.message).join(', ');
      logger.error('Error de validación al actualizar movimiento', { error: errorMessage, movimientoId: p.id });
      showErrorMessage(`Datos inválidos: ${errorMessage}`);
    } else {
      logger.error('Error al actualizar movimiento', { error, movimientoId: p.id });
      showErrorMessage('No se pudo actualizar el movimiento. Por favor, intenta nuevamente.');
    }
    throw error;
  }
}

export type MovimientosMesAnioParams = Database["public"]["Functions"]["mmovimientosmesanio"]["Args"];
export type MovimientosMesAnio = Database["public"]["Functions"]["mmovimientosmesanio"]["Returns"];

const RPC_TIMEOUT = 10000; // 10 segundos timeout para RPC calls

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`RPC Timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export const MostrarMovimientosPorMesAño = async (p: MovimientosMesAnioParams): Promise<MovimientosMesAnio | null> => {
  try {
    const { data, error } = await withTimeout(
      supabase.rpc("mmovimientosmesanio", p),
      RPC_TIMEOUT
    );
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error al mostrar movimientos por mes/año', { error, params: p });
    showErrorMessage('No se pudieron cargar los movimientos. Por favor, intenta nuevamente.');
    return null;
  }
};

export type RptMovimientosMesAnioParams = Database["public"]["Functions"]["rptmovimientos_anio_mes"]["Args"];
export type RptMovimientosMesAnio = Database["public"]["Functions"]["rptmovimientos_anio_mes"]["Returns"];
export type RptMovimientosMesAnioJson = Database["public"]["Functions"]["rptmovimientos_anio_mes_json"]["Returns"];


export const RptMovimientosPorMesAño = async (p: RptMovimientosMesAnioParams): Promise<RptMovimientosMesAnio | null> => {
  try {
    const { data, error } = await supabase.rpc("rptmovimientos_anio_mes", p);
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error al generar reporte de movimientos', { error, params: p });
    showErrorMessage('No se pudo generar el reporte. Por favor, intenta nuevamente.');
    return null;
  }
};

// rpt_movimientos_anio_mes_json
export const RptMovimientosPorMesAñoJson = async (p: RptMovimientosMesAnioParams): Promise<RptMovimientosMesAnioJson | null> => {
  try {
    const { data, error } = await supabase.rpc("rptmovimientos_anio_mes_json", p);
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error al generar reporte de movimientos', { error, params: p });
    showErrorMessage('No se pudo generar el reporte. Por favor, intenta nuevamente.');
    return null;
  }
};


// Add this function after your type definitions and before the other functions
export const convertToMovimiento = (item: MovimientosMesAnio[number]): Movimiento => {
  return {
    id: item.id,
    descripcion: item.descripcion,
    valor: item.valor,
    fecha: item.fecha,
    estado: item.estado,
    idcategoria: null,
    idcuenta: null,
    idcuenta_origen: item.idcuenta_origen ?? null,
    idcuenta_destino: item.idcuenta_destino ?? null,
    tipo: ''
  } as unknown as Movimiento;
};
