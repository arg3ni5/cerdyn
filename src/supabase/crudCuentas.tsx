import { Database, supabase } from "../index";
import { cuentaInsertSchema, cuentaUpdateSchema } from "../schemas/cuenta.schema";
import { logger } from "../utils/logger";
import { showErrorMessage } from "../utils/messages";
import { z } from "zod";

export type Cuenta = Database["public"]["Tables"]["cuenta"]["Row"];
export type CuentaInsert = Database["public"]["Tables"]["cuenta"]["Insert"];
export type CuentaUpdate = Database["public"]["Tables"]["cuenta"]["Update"];
export interface CuentasQueryParams {
  idusuario: number;
  tipo: string;
}

export async function MostrarCuentas(p: Cuenta): Promise<Cuenta[] | null> {
  try {
    if (!p.idusuario) {
      throw new Error("ID usuario is required");
    }
    const { data, error } = p.tipo ?
      await supabase
        .from("cuenta")
        .select()
        .eq("tipo", p.tipo)
        .eq("idusuario", p.idusuario) :
      await supabase
        .from("cuenta")
        .select()
        .eq("idusuario", p.idusuario);

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error al mostrar cuentas', { error, userId: p.idusuario });
    showErrorMessage('No se pudieron cargar las cuentas. Por favor, intenta nuevamente.');
    return null;
  }
}

export async function InsertarCuenta(cuenta: CuentaInsert): Promise<Cuenta | null> {
  try {
    // Validate data before inserting
    const validatedData = cuentaInsertSchema.parse(cuenta);

    const { data, error } = await supabase
      .from("cuenta")
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    logger.info('Cuenta creada exitosamente', { cuentaId: data.id });
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => e.message).join(', ');
      logger.error('Error de validación al insertar cuenta', { error: errorMessage, cuenta });
      showErrorMessage(`Datos inválidos: ${errorMessage}`);
    } else {
      logger.error('Error al insertar cuenta', { error, cuenta });
      showErrorMessage('No se pudo crear la cuenta. Por favor, verifica los datos e intenta nuevamente.');
    }
    return null;
  }
}

export async function ActualizarCuenta(id: number, cuenta: CuentaUpdate): Promise<Cuenta | null> {
  try {
    // Validate data before updating
    const validatedData = cuentaUpdateSchema.parse(cuenta);

    const { data, error } = await supabase
      .from("cuenta")
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    logger.info('Cuenta actualizada exitosamente', { cuentaId: id });
    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => e.message).join(', ');
      logger.error('Error de validación al actualizar cuenta', { error: errorMessage, cuentaId: id });
      showErrorMessage(`Datos inválidos: ${errorMessage}`);
    } else {
      logger.error('Error al actualizar cuenta', { error, cuentaId: id });
      showErrorMessage('No se pudo actualizar la cuenta. Por favor, intenta nuevamente.');
    }
    return null;
  }
}

export async function EliminarCuenta(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("cuenta")
      .delete()
      .eq('id', id);

    if (error) throw error;
    logger.info('Cuenta eliminada exitosamente', { cuentaId: id });
    return true;
  } catch (error) {
    logger.error('Error al eliminar cuenta', { error, cuentaId: id });
    showErrorMessage('No se pudo eliminar la cuenta. Por favor, intenta nuevamente.');
    return false;
  }
}

export async function ObtenerSaldoCuentaAFecha(p_idcuenta: number, p_fecha: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc("fn_obtener_saldo_cuenta_a_fecha", {
      p_idcuenta,
      p_fecha,
    });
    if (error) throw error;
    return data || 0;
  } catch (error) {
    logger.error("Error al obtener saldo a fecha", { error, p_idcuenta, p_fecha });
    return 0;
  }
}

export async function ObtenerSaldoUsuarioAFecha(p_idusuario: number, p_fecha: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc("fn_obtener_saldo_usuario_a_fecha", {
      p_idusuario,
      p_fecha,
    });
    if (error) throw error;
    return data || 0;
  } catch (error) {
    logger.error("Error al obtener saldo de usuario a fecha", { error, p_idusuario, p_fecha });
    return 0;
  }
}
