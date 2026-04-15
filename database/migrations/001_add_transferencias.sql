-- ============================================================
-- Migración 001: Soporte para tipo de movimiento 't' (transferencia)
-- ============================================================

-- 1. Agregar columnas idcuenta_origen e idcuenta_destino a movimientos
ALTER TABLE public.movimientos
  ADD COLUMN IF NOT EXISTS idcuenta_origen INTEGER REFERENCES public.cuenta(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS idcuenta_destino INTEGER REFERENCES public.cuenta(id) ON DELETE RESTRICT;

-- 2. Actualizar función del trigger que asigna idusuario al insertar/actualizar movimientos
--    Soporta los tipos 'i', 'g' (usa idcuenta) y 't' (usa idcuenta_origen)
CREATE OR REPLACE FUNCTION public.trg_asignar_idusuario_movimiento()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tipo = 't' THEN
    -- Para transferencias: obtener idusuario de la cuenta origen
    SELECT c.idusuario
      INTO NEW.idusuario
    FROM public.cuenta c
    WHERE c.id = NEW.idcuenta_origen;

    IF NEW.idusuario IS NULL THEN
      RAISE EXCEPTION 'idcuenta_origen inválido: %', NEW.idcuenta_origen;
    END IF;

    -- Validar que idcuenta_destino exista y pertenezca al mismo usuario
    IF NOT EXISTS (
      SELECT 1 FROM public.cuenta c
      WHERE c.id = NEW.idcuenta_destino
        AND c.idusuario = NEW.idusuario
    ) THEN
      RAISE EXCEPTION 'idcuenta_destino inválido o no pertenece al usuario: %', NEW.idcuenta_destino;
    END IF;

  ELSE
    -- Para ingresos y gastos: obtener idusuario de idcuenta
    SELECT c.idusuario
      INTO NEW.idusuario
    FROM public.cuenta c
    WHERE c.id = NEW.idcuenta;

    IF NEW.idusuario IS NULL THEN
      RAISE EXCEPTION 'idcuenta inválido: %', NEW.idcuenta;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Actualizar función de recálculo mensual para soportar transferencias
CREATE OR REPLACE FUNCTION public.fn_recalcular_mes_cuenta(p_idcuenta BIGINT, p_anio INT, p_mes INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_idusuario BIGINT;
  v_fecha_inicio DATE;
  v_fecha_fin DATE;
BEGIN
  SELECT idusuario INTO v_idusuario FROM public.cuenta WHERE id = p_idcuenta;

  v_fecha_inicio := make_date(p_anio, p_mes, 1);
  v_fecha_fin := v_fecha_inicio + INTERVAL '1 month';

  IF v_idusuario IS NOT NULL THEN
    INSERT INTO public.resumen_mensual_cuentas (idcuenta, idusuario, anio, mes, ingresos, gastos, balance)
    SELECT
      p_idcuenta,
      v_idusuario,
      p_anio,
      p_mes,
      -- Ingresos: solo movimientos tipo 'i'
      COALESCE(SUM(CASE WHEN tipo = 'i' AND idcuenta = p_idcuenta THEN valor ELSE 0 END), 0),
      -- Gastos: solo movimientos tipo 'g'
      COALESCE(SUM(CASE WHEN tipo = 'g' AND idcuenta = p_idcuenta THEN valor ELSE 0 END), 0),
      -- Balance: ingresos - gastos + transferencias entrantes - transferencias salientes
      COALESCE(SUM(CASE
        WHEN tipo = 'i' AND idcuenta = p_idcuenta THEN valor
        WHEN tipo = 'g' AND idcuenta = p_idcuenta THEN -valor
        WHEN tipo = 't' AND idcuenta_destino = p_idcuenta THEN valor
        WHEN tipo = 't' AND idcuenta_origen = p_idcuenta THEN -valor
        ELSE 0
      END), 0)
    FROM public.movimientos
    WHERE (
      (tipo IN ('i', 'g') AND idcuenta = p_idcuenta)
      OR
      (tipo = 't' AND (idcuenta_origen = p_idcuenta OR idcuenta_destino = p_idcuenta))
    )
      AND fecha >= v_fecha_inicio
      AND fecha < v_fecha_fin
      AND estado = true
    ON CONFLICT (idcuenta, anio, mes)
    DO UPDATE SET
      ingresos = EXCLUDED.ingresos,
      gastos = EXCLUDED.gastos,
      balance = EXCLUDED.balance;
  END IF;
END;
$$;

-- 4. Actualizar trigger fn_actualizar_resumen_mensual para soportar transferencias
CREATE OR REPLACE FUNCTION public.fn_actualizar_resumen_mensual()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    -- Actualizar cuentas afectadas por el registro ANTERIOR
    IF OLD.tipo IN ('i', 'g') THEN
      IF (OLD.idcuenta IS DISTINCT FROM NEW.idcuenta OR OLD.fecha IS DISTINCT FROM NEW.fecha OR OLD.estado IS DISTINCT FROM NEW.estado) THEN
        IF OLD.idcuenta IS NOT NULL AND OLD.fecha IS NOT NULL THEN
          PERFORM public.fn_recalcular_mes_cuenta(OLD.idcuenta, EXTRACT(YEAR FROM OLD.fecha)::INT, EXTRACT(MONTH FROM OLD.fecha)::INT);
        END IF;
      END IF;
    ELSIF OLD.tipo = 't' THEN
      IF (OLD.idcuenta_origen IS DISTINCT FROM NEW.idcuenta_origen OR OLD.idcuenta_destino IS DISTINCT FROM NEW.idcuenta_destino OR OLD.fecha IS DISTINCT FROM NEW.fecha OR OLD.estado IS DISTINCT FROM NEW.estado) THEN
        IF OLD.idcuenta_origen IS NOT NULL AND OLD.fecha IS NOT NULL THEN
          PERFORM public.fn_recalcular_mes_cuenta(OLD.idcuenta_origen, EXTRACT(YEAR FROM OLD.fecha)::INT, EXTRACT(MONTH FROM OLD.fecha)::INT);
        END IF;
        IF OLD.idcuenta_destino IS NOT NULL AND OLD.fecha IS NOT NULL THEN
          PERFORM public.fn_recalcular_mes_cuenta(OLD.idcuenta_destino, EXTRACT(YEAR FROM OLD.fecha)::INT, EXTRACT(MONTH FROM OLD.fecha)::INT);
        END IF;
      END IF;
    END IF;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    IF OLD.tipo IN ('i', 'g') AND OLD.idcuenta IS NOT NULL AND OLD.fecha IS NOT NULL THEN
      PERFORM public.fn_recalcular_mes_cuenta(OLD.idcuenta, EXTRACT(YEAR FROM OLD.fecha)::INT, EXTRACT(MONTH FROM OLD.fecha)::INT);
    ELSIF OLD.tipo = 't' AND OLD.fecha IS NOT NULL THEN
      IF OLD.idcuenta_origen IS NOT NULL THEN
        PERFORM public.fn_recalcular_mes_cuenta(OLD.idcuenta_origen, EXTRACT(YEAR FROM OLD.fecha)::INT, EXTRACT(MONTH FROM OLD.fecha)::INT);
      END IF;
      IF OLD.idcuenta_destino IS NOT NULL THEN
        PERFORM public.fn_recalcular_mes_cuenta(OLD.idcuenta_destino, EXTRACT(YEAR FROM OLD.fecha)::INT, EXTRACT(MONTH FROM OLD.fecha)::INT);
      END IF;
    END IF;
  ELSE
    -- INSERT o UPDATE: recalcular cuentas del registro NUEVO/ACTUAL
    IF NEW.tipo IN ('i', 'g') AND NEW.idcuenta IS NOT NULL AND NEW.fecha IS NOT NULL THEN
      PERFORM public.fn_recalcular_mes_cuenta(NEW.idcuenta, EXTRACT(YEAR FROM NEW.fecha)::INT, EXTRACT(MONTH FROM NEW.fecha)::INT);
    ELSIF NEW.tipo = 't' AND NEW.fecha IS NOT NULL THEN
      IF NEW.idcuenta_origen IS NOT NULL THEN
        PERFORM public.fn_recalcular_mes_cuenta(NEW.idcuenta_origen, EXTRACT(YEAR FROM NEW.fecha)::INT, EXTRACT(MONTH FROM NEW.fecha)::INT);
      END IF;
      IF NEW.idcuenta_destino IS NOT NULL THEN
        PERFORM public.fn_recalcular_mes_cuenta(NEW.idcuenta_destino, EXTRACT(YEAR FROM NEW.fecha)::INT, EXTRACT(MONTH FROM NEW.fecha)::INT);
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

-- 5. Actualizar función de saldo a fecha para incluir transferencias
CREATE OR REPLACE FUNCTION public.fn_obtener_saldo_cuenta_a_fecha(p_idcuenta BIGINT, p_fecha DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_saldo NUMERIC;
BEGIN
  SELECT COALESCE(SUM(CASE
    WHEN tipo = 'i' AND idcuenta = p_idcuenta THEN valor
    WHEN tipo = 'g' AND idcuenta = p_idcuenta THEN -valor
    WHEN tipo = 't' AND idcuenta_destino = p_idcuenta THEN valor
    WHEN tipo = 't' AND idcuenta_origen = p_idcuenta THEN -valor
    ELSE 0
  END), 0)
  INTO v_saldo
  FROM public.movimientos
  WHERE (
    (tipo IN ('i', 'g') AND idcuenta = p_idcuenta)
    OR
    (tipo = 't' AND (idcuenta_origen = p_idcuenta OR idcuenta_destino = p_idcuenta))
  )
    AND fecha < p_fecha
    AND estado = true;

  RETURN v_saldo;
END;
$$;

-- 6. Actualizar la función mmovimientosmesanio para soportar tipo 't'
--    El tipo 't' retorna transferencias con los nombres de las cuentas
CREATE OR REPLACE FUNCTION public.mmovimientosmesanio(
  anio INTEGER,
  mes INTEGER,
  iduser INTEGER,
  tipocategoria TEXT
)
RETURNS TABLE(
  id INTEGER,
  descripcion TEXT,
  valor NUMERIC,
  fecha TEXT,
  estado BOOLEAN,
  cuenta TEXT,
  categoria TEXT,
  valorymoneda TEXT,
  idcuenta_origen INTEGER,
  idcuenta_destino INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_fecha_inicio DATE;
  v_fecha_fin DATE;
  v_moneda TEXT;
BEGIN
  v_fecha_inicio := make_date(anio, mes, 1);
  v_fecha_fin := v_fecha_inicio + INTERVAL '1 month';

  SELECT COALESCE(u.moneda, '$') INTO v_moneda
  FROM public.usuarios u WHERE u.id = iduser;

  IF tipocategoria = 't' THEN
    RETURN QUERY
    SELECT
      m.id,
      m.descripcion,
      m.valor,
      m.fecha::TEXT,
      m.estado,
      CONCAT(co.descripcion, ' → ', cd.descripcion) AS cuenta,
      'Transferencia'::TEXT AS categoria,
      CONCAT(v_moneda, ' ', TO_CHAR(m.valor, 'FM999,999,999.00')) AS valorymoneda,
      m.idcuenta_origen,
      m.idcuenta_destino
    FROM public.movimientos m
    JOIN public.cuenta co ON m.idcuenta_origen = co.id
    JOIN public.cuenta cd ON m.idcuenta_destino = cd.id
    WHERE m.tipo = 't'
      AND m.idusuario = iduser
      AND m.fecha::DATE >= v_fecha_inicio
      AND m.fecha::DATE < v_fecha_fin
    ORDER BY m.fecha DESC;
  ELSE
    RETURN QUERY
    SELECT
      m.id,
      m.descripcion,
      m.valor,
      m.fecha::TEXT,
      m.estado,
      COALESCE(c.descripcion, '')::TEXT AS cuenta,
      COALESCE(cat.descripcion, '')::TEXT AS categoria,
      CONCAT(v_moneda, ' ', TO_CHAR(m.valor, 'FM999,999,999.00')) AS valorymoneda,
      NULL::INTEGER AS idcuenta_origen,
      NULL::INTEGER AS idcuenta_destino
    FROM public.movimientos m
    LEFT JOIN public.cuenta c ON m.idcuenta = c.id
    LEFT JOIN public.categorias cat ON m.idcategoria = cat.id
    WHERE m.tipo = tipocategoria
      AND m.idusuario = iduser
      AND m.fecha::DATE >= v_fecha_inicio
      AND m.fecha::DATE < v_fecha_fin
    ORDER BY m.fecha DESC;
  END IF;
END;
$$;

-- 7. Recalcular resúmenes existentes para incluir transferencias históricas (si hubiera)
-- (Este paso es idempotente y seguro de ejecutar)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT
      COALESCE(m.idcuenta, m.idcuenta_origen) AS cid,
      EXTRACT(YEAR FROM m.fecha::DATE)::INT AS anio,
      EXTRACT(MONTH FROM m.fecha::DATE)::INT AS mes
    FROM public.movimientos m
    WHERE m.fecha IS NOT NULL
      AND (m.idcuenta IS NOT NULL OR m.idcuenta_origen IS NOT NULL)
  LOOP
    PERFORM public.fn_recalcular_mes_cuenta(r.cid, r.anio, r.mes);
  END LOOP;
END;
$$;
