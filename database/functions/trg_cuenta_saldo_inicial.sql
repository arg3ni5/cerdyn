create or replace function public.trg_cuenta_saldo_inicial()
returns trigger
language plpgsql
as $$
declare
  v_idcategoria bigint;
begin
  -- Las tarjetas usan saldo_actual como crédito disponible, no como dinero propio.
  if coalesce(new.saldo_actual, 0) > 0 and coalesce(new.tipo, 'd') = 'd' then

    -- Buscar categoría SALDO INICIAL del usuario
    select id
      into v_idcategoria
    from public.categorias
    where descripcion = 'SALDO INICIAL'
      and tipo = 'i'
      and idusuario = new.idusuario
    limit 1;

    -- Si no existe, crearla
    if v_idcategoria is null then
      insert into public.categorias (
        descripcion,
        tipo,
        idusuario,
        color,
        icono
      )
      values (
        'SALDO INICIAL',
        'i',
        new.idusuario,
        '#22c55e',     -- verde por defecto
        '💰'           -- icono por defecto
      )
      returning id into v_idcategoria;
    end if;

    -- Insertar movimiento saldo inicial
    insert into public.movimientos (
      descripcion,
      valor,
      fecha,
      estado,
      tipo,
      idcuenta,
      idcategoria
    )
    values (
      'SALDO INICIAL',
      new.saldo_actual,
      now(),
      true,
      'i',
      new.id,
      v_idcategoria
    );

  end if;

  return new;
end;
$$;
