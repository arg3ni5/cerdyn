-- ============================================================
-- Migración 002: Saldo agregado de todas las cuentas de un usuario
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_obtener_saldo_usuario_a_fecha(
  p_idusuario BIGINT,
  p_fecha DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_saldo NUMERIC;
BEGIN
  SELECT COALESCE(SUM(CASE
    WHEN m.tipo = 'i' AND cuenta_mov.idusuario = p_idusuario THEN m.valor
    WHEN m.tipo = 'g' AND cuenta_mov.idusuario = p_idusuario THEN -m.valor
    WHEN m.tipo = 't' THEN
      CASE WHEN cuenta_destino.idusuario = p_idusuario THEN m.valor ELSE 0 END
      -
      CASE WHEN cuenta_origen.idusuario = p_idusuario THEN m.valor ELSE 0 END
    ELSE 0
  END), 0)
  INTO v_saldo
  FROM public.movimientos m
  LEFT JOIN public.cuenta cuenta_mov
    ON cuenta_mov.id = m.idcuenta
  LEFT JOIN public.cuenta cuenta_origen
    ON cuenta_origen.id = m.idcuenta_origen
  LEFT JOIN public.cuenta cuenta_destino
    ON cuenta_destino.id = m.idcuenta_destino
  WHERE m.fecha < p_fecha
    AND m.estado = true
    AND (
      cuenta_mov.idusuario = p_idusuario
      OR cuenta_origen.idusuario = p_idusuario
      OR cuenta_destino.idusuario = p_idusuario
    );

  RETURN v_saldo;
END;
$$;
