-- ============================================================
-- Primera fase de cuentas de credito: tarjetas de credito
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tarjeta_credito (
  idcuenta BIGINT PRIMARY KEY REFERENCES public.cuenta(id) ON DELETE CASCADE,
  limite_credito NUMERIC NOT NULL DEFAULT 0,
  dia_corte INTEGER,
  dia_pago INTEGER,
  tasa_interes NUMERIC NOT NULL DEFAULT 0,
  pago_minimo_config NUMERIC NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tarjeta_credito_limite_check CHECK (limite_credito >= 0),
  CONSTRAINT tarjeta_credito_dia_corte_check CHECK (dia_corte IS NULL OR dia_corte BETWEEN 1 AND 31),
  CONSTRAINT tarjeta_credito_dia_pago_check CHECK (dia_pago IS NULL OR dia_pago BETWEEN 1 AND 31),
  CONSTRAINT tarjeta_credito_tasa_interes_check CHECK (tasa_interes >= 0),
  CONSTRAINT tarjeta_credito_pago_minimo_check CHECK (pago_minimo_config >= 0)
);

CREATE OR REPLACE FUNCTION public.trg_tarjeta_credito_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tarjeta_credito_touch ON public.tarjeta_credito;
CREATE TRIGGER trg_tarjeta_credito_touch
BEFORE UPDATE ON public.tarjeta_credito
FOR EACH ROW
EXECUTE FUNCTION public.trg_tarjeta_credito_touch();

INSERT INTO public.tarjeta_credito (
  idcuenta,
  limite_credito,
  dia_corte,
  dia_pago,
  tasa_interes,
  pago_minimo_config
)
SELECT
  c.id,
  COALESCE(c.saldo_actual, 0),
  NULL,
  NULL,
  0,
  0
FROM public.cuenta c
WHERE c.tipo = 'c'
ON CONFLICT (idcuenta) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trg_cuenta_saldo_inicial()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_idcategoria BIGINT;
BEGIN
  -- Las tarjetas usan saldo_actual como credito disponible, no como dinero propio.
  IF COALESCE(NEW.saldo_actual, 0) > 0 AND COALESCE(NEW.tipo, 'd') = 'd' THEN
    SELECT id
      INTO v_idcategoria
    FROM public.categorias
    WHERE descripcion = 'SALDO INICIAL'
      AND tipo = 'i'
      AND idusuario = NEW.idusuario
    LIMIT 1;

    IF v_idcategoria IS NULL THEN
      INSERT INTO public.categorias (
        descripcion,
        tipo,
        idusuario,
        color,
        icono
      )
      VALUES (
        'SALDO INICIAL',
        'i',
        NEW.idusuario,
        '#22c55e',
        '💰'
      )
      RETURNING id INTO v_idcategoria;
    END IF;

    INSERT INTO public.movimientos (
      descripcion,
      valor,
      fecha,
      estado,
      tipo,
      idcuenta,
      idcategoria
    )
    VALUES (
      'SALDO INICIAL',
      NEW.saldo_actual,
      NOW(),
      TRUE,
      'i',
      NEW.id,
      v_idcategoria
    );
  END IF;

  RETURN NEW;
END;
$$;
