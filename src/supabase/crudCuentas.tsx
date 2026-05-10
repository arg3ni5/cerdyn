import { Database, supabase } from "../index";
import { cuentaInsertSchema, cuentaUpdateSchema } from "../schemas/cuenta.schema";
import { logger } from "../utils/logger";
import { showErrorMessage } from "../utils/messages";
import { z } from "zod";

type CuentaBase = Database["public"]["Tables"]["cuenta"]["Row"];
type CuentaBaseInsert = Database["public"]["Tables"]["cuenta"]["Insert"];
type CuentaBaseUpdate = Database["public"]["Tables"]["cuenta"]["Update"];
type TarjetaCredito = Database["public"]["Tables"]["tarjeta_credito"]["Row"];
type TarjetaCreditoInsert = Database["public"]["Tables"]["tarjeta_credito"]["Insert"];
type TarjetaCreditoUpdate = Database["public"]["Tables"]["tarjeta_credito"]["Update"];
type CuentaTarjetaFields = {
  subtipo?: string | null;
  limite_credito?: number | null;
  dia_corte?: number | null;
  dia_pago?: number | null;
  tasa_interes?: number | null;
  pago_minimo_config?: number | null;
};

export type Cuenta = CuentaBase & CuentaTarjetaFields;
export type CuentaInsert = CuentaBaseInsert & CuentaTarjetaFields;
export type CuentaUpdate = CuentaBaseUpdate & CuentaTarjetaFields & { id?: number };
export interface CuentasQueryParams {
  idusuario: number;
  tipo: string;
}

type CuentaConTarjetaRow = CuentaBase & {
  tarjeta_credito?: TarjetaCredito | TarjetaCredito[] | null;
};

const mapCuentaConTarjeta = (row: CuentaConTarjetaRow): Cuenta => {
  const tarjeta = Array.isArray(row.tarjeta_credito)
    ? row.tarjeta_credito[0]
    : row.tarjeta_credito;
  const { tarjeta_credito: _tarjetaCredito, ...cuenta } = row;

  return {
    ...cuenta,
    subtipo: cuenta.tipo === "c" ? "tarjeta_credito" : "debito",
    limite_credito: tarjeta?.limite_credito ?? null,
    dia_corte: tarjeta?.dia_corte ?? null,
    dia_pago: tarjeta?.dia_pago ?? null,
    tasa_interes: tarjeta?.tasa_interes ?? null,
    pago_minimo_config: tarjeta?.pago_minimo_config ?? null,
  };
};

const splitCuentaData = <T extends CuentaInsert | CuentaUpdate>(cuenta: T) => {
  const {
    subtipo: _subtipo,
    limite_credito,
    dia_corte,
    dia_pago,
    tasa_interes,
    pago_minimo_config,
    ...cuentaData
  } = cuenta;

  return {
    cuentaData,
    tarjetaData: {
      limite_credito,
      dia_corte,
      dia_pago,
      tasa_interes,
      pago_minimo_config,
    },
  };
};

const buildTarjetaPayload = (
  idcuenta: number,
  tarjetaData: CuentaTarjetaFields,
): TarjetaCreditoInsert | TarjetaCreditoUpdate => ({
  idcuenta,
  limite_credito: Number(tarjetaData.limite_credito ?? 0),
  dia_corte: tarjetaData.dia_corte ?? null,
  dia_pago: tarjetaData.dia_pago ?? null,
  tasa_interes: Number(tarjetaData.tasa_interes ?? 0),
  pago_minimo_config: Number(tarjetaData.pago_minimo_config ?? 0),
});

export async function MostrarCuentas(p: Cuenta): Promise<Cuenta[] | null> {
  try {
    if (!p.idusuario) {
      throw new Error("ID usuario is required");
    }
    const { data, error } = p.tipo ?
      await supabase
        .from("cuenta")
        .select("*, tarjeta_credito(*)")
        .eq("tipo", p.tipo)
        .eq("idusuario", p.idusuario) :
      await supabase
        .from("cuenta")
        .select("*, tarjeta_credito(*)")
        .eq("idusuario", p.idusuario);

    if (error) throw error;
    return (data as CuentaConTarjetaRow[]).map(mapCuentaConTarjeta);
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
    const { cuentaData, tarjetaData } = splitCuentaData(validatedData);

    const { data, error } = await supabase
      .from("cuenta")
      .insert(cuentaData)
      .select()
      .single();

    if (error) throw error;

    if (data.tipo === "c") {
      const { error: tarjetaError } = await supabase
        .from("tarjeta_credito")
        .insert(buildTarjetaPayload(data.id, tarjetaData));

      if (tarjetaError) throw tarjetaError;
    }

    logger.info('Cuenta creada exitosamente', { cuentaId: data.id });
    return mapCuentaConTarjeta({ ...data, tarjeta_credito: data.tipo === "c" ? buildTarjetaPayload(data.id, tarjetaData) as TarjetaCredito : null });
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
    const { cuentaData, tarjetaData } = splitCuentaData(validatedData);

    const { data, error } = await supabase
      .from("cuenta")
      .update(cuentaData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data.tipo === "c" || cuenta.tipo === "c") {
      const { error: tarjetaError } = await supabase
        .from("tarjeta_credito")
        .upsert(buildTarjetaPayload(id, tarjetaData), { onConflict: "idcuenta" });

      if (tarjetaError) throw tarjetaError;
    }

    logger.info('Cuenta actualizada exitosamente', { cuentaId: id });
    return mapCuentaConTarjeta({ ...data, tarjeta_credito: data.tipo === "c" ? buildTarjetaPayload(id, tarjetaData) as TarjetaCredito : null });
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
