import {
  Header,
  useOperaciones,
  v,
  Lottieanimacion,
  Tipo,
  Accion,
  Movimiento,
  useMovimientosStore,
  useCuentaStore,
  RegistrarMovimientos,
  CardTotales,
  InputBuscadorLista,
  Selector,
  ListaGenerica,
  useCategoriasStore,
  Cuenta,
  DataMovimientos,
  CalendarioLineal,
  obtenerTitulo,
  TablaMovimientos,
  TablaTransferencias,
  TipoMovimiento,
  useUsuariosStore,
  ObtenerSaldoUsuarioAFecha,
} from "../../index";
import { JSX, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import vacioverde from "../../assets/vacioverde.json";
import vaciorojo from "../../assets/vaciorojo.json";
import vacioazul from "../../assets/vacioazul.json";
import { DataDesplegables } from '../../utils/dataEstatica';
import {
  CategoryFilter,
  Container,
  ContentFiltro,
  EmptyState,
  FilterBar,
  FilterSearch,
  HeroStats,
  FloatingActionMenu,
  FloatingActionOption,
  FloatingActionToggle,
  TypeTabButton,
  TypeTabs,
  TypeBadge,
  BalanceTrace,
} from './MovimientosTemplate.styles';


export const MovimientosTemplate = (): JSX.Element => {
  const [openRegistro, setOpenRegistro] = useState(false);
  const [accion, setAccion] = useState<Accion>("Nuevo");
  const [state, setState] = useState(false);
  const [stateAccionesRegistro, setStateAccionesRegistro] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState<Tipo | undefined>(undefined);
  const [incluirSaldoAnterior, setIncluirSaldoAnterior] = useState(true);
  const { setTipoMovimientos, selectTipoMovimiento: tipo, date } = useOperaciones();
  const { usuario } = useUsuariosStore();
  const {
    datamovimientos,
    filtroDescripcion,
    filtroCategoria,
    setFiltros,
  } = useMovimientosStore();

  const { datacategoria } = useCategoriasStore();
  const { mostrarCuentas } = useCuentaStore();
  const [stateListaCategorias, setStateListaCategorias] = useState(false);
  const [stateListaCuentas, setStateListaCuentas] = useState(false);
  const [filtroCuenta, setFiltroCuenta] = useState("");

  const [dataSelect, setDataSelect] = useState<Movimiento | undefined>(undefined);
  const fechaInicio = date.startOf("month").format("YYYY-MM-DD");

  const { data: cuentas = [] } = useQuery<Cuenta[], Error>({
    queryKey: ["cuentas movimientos", usuario?.id],
    queryFn: async () => await mostrarCuentas({ idusuario: usuario?.id } as Cuenta) || [],
    enabled: !!usuario?.id,
  });

  const { data: saldoMesAnterior = 0, isLoading: isLoadingSaldoAnterior } = useQuery<number, Error>({
    queryKey: ["saldo anterior movimientos global", usuario?.id, fechaInicio],
    queryFn: () => ObtenerSaldoUsuarioAFecha(usuario?.id ?? 0, fechaInicio),
    enabled: !!usuario?.id && tipo.tipo === 'b',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const cambiarTipo = (p: Tipo): void => {
    setTipoMovimientos(p);
    setState(false);
    setStateListaCategorias(false);
    setStateListaCuentas(false);
    setFiltros(filtroDescripcion, "");
  };

  const cerrarDesplegables = (): void => {
    setState(false);
    setStateAccionesRegistro(false);
    setStateListaCategorias(false);
    setStateListaCuentas(false);
  };

  const openUser = (): void => {
    setState(!state);
  };

  const gastos = DataDesplegables.movimientos['g'] as Tipo;
  const ingresos = DataDesplegables.movimientos['i'] as Tipo;
  const balance = DataDesplegables.movimientos['b'] as Tipo;
  const transferencias = DataDesplegables.movimientos['t'] as Tipo;

  const tipos: Record<TipoMovimiento, Tipo> = {
    g: gastos,
    i: ingresos,
    b: balance,
    t: transferencias,
  };

  const tipoActual = tipos[tipo.tipo as TipoMovimiento];
  const tiposFiltro = [ingresos, gastos, balance, transferencias];

  const obtenerTextoNuevoMovimiento = (item: Tipo): string => {
    if (item.tipo === "t") return "Nueva Transferencia";
    if (item.tipo === "i") return "Nuevo Ingreso";
    if (item.tipo === "g") return "Nuevo Gasto";
    return "Nuevo movimiento";
  };

  const nuevoRegistro = (tipoNuevo?: Tipo): void => {
    setOpenRegistro(true);
    setAccion("Nuevo");
    setDataSelect(undefined);
    setTipoRegistro(tipoNuevo || (tipo.tipo !== "b" ? tipoActual : gastos));
    setStateAccionesRegistro(false);
  };

  const isBalanceActive = tipo.tipo === "b";

  const filterMovimientos = (data: any[]) => {
    if (!data) return [];
    return data.filter(item => {
      const matchDescripcion = item.descripcion?.toLowerCase().includes(filtroDescripcion.toLowerCase());
      const matchMonto = item.valor?.toString().includes(filtroDescripcion);
      const matchCuenta = filtroCuenta === "" || item.cuenta === filtroCuenta || item.cuenta_origen === filtroCuenta || item.cuenta_destino === filtroCuenta;
      const matchCategoria = filtroCategoria === "" || item.categoria === filtroCategoria;
      return (matchDescripcion || matchMonto) && matchCuenta && matchCategoria;
    });
  };

  const esPagado = (estado: unknown): boolean => {
    if (typeof estado === "boolean") return estado;
    if (typeof estado === "number") return estado === 1;
    if (typeof estado === "string") {
      const valor = estado.trim().toLowerCase();
      return valor === "1" || valor === "true";
    }
    return false;
  };

  const filteredDatamovimientos: DataMovimientos = {
    i: filterMovimientos(datamovimientos?.i || []),
    g: filterMovimientos(datamovimientos?.g || []),
    t: filterMovimientos(datamovimientos?.t || []),
  };

  const calculateFilteredTotals = (tipoMovimiento: "i" | "g" | "b" | "t") => {
    if (tipoMovimiento === "b") {
      const ing = filteredDatamovimientos.i;
      const gas = filteredDatamovimientos.g;

      const tIng = ing.reduce((sum, item) => sum + Number(item.valor), 0);
      const tGas = gas.reduce((sum, item) => sum + Number(item.valor), 0);
      const pIng = ing.filter(item => esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const pGas = gas.filter(item => esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const penIng = ing.filter(item => !esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const penGas = gas.filter(item => !esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);

      return {
        total: tIng - tGas,
        pagados: pIng - pGas,
        pendientes: penIng - penGas
      };
    } else if (tipoMovimiento === "t") {
      const movs = filteredDatamovimientos.t;
      const total = movs.reduce((sum, item) => sum + Number(item.valor), 0);
      const pagados = movs.filter(item => esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const pendientes = movs.filter(item => !esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      return { total, pagados, pendientes };
    } else {
      const movs = filteredDatamovimientos[tipoMovimiento as "i" | "g"];
      const total = movs.reduce((sum, item) => sum + Number(item.valor), 0);
      const pagados = movs.filter(item => esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const pendientes = movs.filter(item => !esPagado(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      return { total, pagados, pendientes };
    }
  };

  const totals = calculateFilteredTotals(tipo.tipo as "i" | "g" | "b" | "t");
  const ingresosPagados = filteredDatamovimientos.i
    .filter(item => esPagado(item.estado))
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const gastosPagados = filteredDatamovimientos.g
    .filter(item => esPagado(item.estado))
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const transferenciasPagadas = filteredDatamovimientos.t
    .filter(item => esPagado(item.estado))
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const resultadoMes = ingresosPagados - gastosPagados;
  const saldoTrazado = incluirSaldoAnterior ? saldoMesAnterior + resultadoMes : resultadoMes;
  const formulaTrazabilidad = incluirSaldoAnterior ? (
    <>
      Saldo mes anterior + <span className="formula-ingreso">ingresos</span> - <span className="formula-gasto">gastos</span>
    </>
  ) : (
    <>
      <span className="formula-ingreso">Ingresos</span> - <span className="formula-gasto">gastos</span> del mes
    </>
  );
  const claseMonto = (valor: number): string => {
    if (valor > 0) return "positivo";
    if (valor < 0) return "negativo";
    return "neutro";
  };
  const totalVisible =
    tipo.tipo === "b"
      ? (filteredDatamovimientos.i?.length || 0) +
        (filteredDatamovimientos.g?.length || 0) +
        (filteredDatamovimientos.t?.length || 0)
      : (filteredDatamovimientos[tipo.tipo as "i" | "g" | "t"]?.length || 0);
  const tituloMovimientos = tipo.tipo === "b" ? "Balance" : tipoActual.text + "s";
  const mostrarFiltroCategoria = tipo.tipo !== "t";

  return (
    <Container onClick={cerrarDesplegables} $isBalanceActive={isBalanceActive}>
      <RegistrarMovimientos
        accion={accion}
        dataSelect={dataSelect}
        state={openRegistro}
        setState={() => setOpenRegistro(false)}
        tipoRegistro={tipoRegistro}
      />

      <header className="header">
        <Header
          stateConfig={{ state: state, setState: openUser }}
          eyebrow="Movimientos"
          title={tituloMovimientos}
          actions={<CalendarioLineal />}
        />
      </header>

      <section className="hero">
        <FilterBar
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <TypeTabs aria-label="Tipo de movimiento">
            {tiposFiltro.map((item) => (
              <TypeTabButton
                key={item.tipo}
                type="button"
                $active={tipo.tipo === item.tipo}
                $bgcolor={item.bgcolor}
                $textcolor={item.color}
                onClick={() => cambiarTipo(item)}
              >
                <span>{item.icono}</span>
                <strong>{item.text}</strong>
              </TypeTabButton>
            ))}
          </TypeTabs>

          <div className="filter-row">
            <FilterSearch>
              <InputBuscadorLista
                placeholder="Buscar por descripción o monto..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltros(e.target.value, filtroCategoria)}
              />
            </FilterSearch>

            <CategoryFilter>
              <ContentFiltro>
                <Selector
                  color="#9955ff"
                  texto1="Cuenta: "
                  texto2={filtroCuenta || "Todas"}
                  funcion={() => {
                    setStateListaCuentas(!stateListaCuentas);
                    setStateListaCategorias(false);
                  }}
                  state={stateListaCuentas}
                />
                {stateListaCuentas && (
                  <div className="filter-list">
                    <ListaGenerica
                      placement="down"
                      mobilePlacement="down"
                      scroll="auto"
                      filterable
                      filterPlaceholder="Buscar cuenta..."
                      emptyMessage="No hay cuentas que coincidan."
                      filterBy={["descripcion"]}
                      minItemsToFilter={4}
                      data={[
                        { icono: "", descripcion: "Todas" },
                        ...cuentas.map(cuenta => ({
                          icono: cuenta.icono || "",
                          descripcion: cuenta.descripcion || "",
                        }))
                      ]}
                      setState={() => setStateListaCuentas(false)}
                      funcion={(item) => setFiltroCuenta(item.descripcion === "Todas" ? "" : item.descripcion)}
                    />
                  </div>
                )}
              </ContentFiltro>
            </CategoryFilter>

            {mostrarFiltroCategoria && (
              <CategoryFilter>
                <ContentFiltro>
                  <Selector
                    color={tipo.color}
                    texto1="Categoría: "
                    texto2={filtroCategoria || "Todas"}
                    funcion={() => {
                      setStateListaCategorias(!stateListaCategorias);
                      setStateListaCuentas(false);
                    }}
                    state={stateListaCategorias}
                  />
                  {stateListaCategorias && (
                    <div className="filter-list">
                      <ListaGenerica
                        placement="down"
                        mobilePlacement="down"
                        scroll="auto"
                        data={[
                          { icono: "📁", descripcion: "Todas" },
                          ...(datacategoria?.map(c => ({ icono: c.icono, descripcion: c.descripcion })) || [])
                        ]}
                        setState={() => setStateListaCategorias(false)}
                        funcion={(item) => setFiltros(filtroDescripcion, item.descripcion === "Todas" ? "" : item.descripcion)}
                      />
                    </div>
                  )}
                </ContentFiltro>
              </CategoryFilter>
            )}
          </div>
        </FilterBar>

        <HeroStats>
          <span>Movimientos visibles</span>
          <strong>{totalVisible}</strong>
          <small>{totalVisible === 1 ? "registro filtrado" : "registros filtrados"}</small>
          <TypeBadge $bgcolor={tipoActual.bgcolor} $textcolor={tipoActual.color}>
            {tipoActual.text}
          </TypeBadge>
        </HeroStats>
      </section>

      <FloatingActionMenu
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {stateAccionesRegistro && (
          <div className="opciones">
            {[gastos, ingresos, transferencias].map((item) => (
              <FloatingActionOption
                key={item.tipo}
                type="button"
                onClick={() => nuevoRegistro(item)}
                $bgcolor={item.bgcolor}
                $textcolor={item.color}
              >
                <span>{item.icono}</span>
                <strong>{obtenerTextoNuevoMovimiento(item)}</strong>
              </FloatingActionOption>
            ))}
          </div>
        )}
        <FloatingActionToggle
          type="button"
          onClick={() => setStateAccionesRegistro(!stateAccionesRegistro)}
          aria-label="Registrar movimiento"
          aria-expanded={stateAccionesRegistro}
        >
          <v.agregar />
        </FloatingActionToggle>
      </FloatingActionMenu>

      {tipo.tipo !== "b" && (
        <section className="totales">
          <CardTotales
            total={totals.pendientes}
            title={obtenerTitulo(tipo.tipo as "i" | "g" | "b" | "t", "pendientes")}
            color={tipo.color}
            icono={<v.flechaarribalarga />}
          />
          <CardTotales
            total={totals.pagados}
            title={obtenerTitulo(tipo.tipo as "i" | "g" | "b" | "t", "pagados")}
            color={tipo.color}
            icono={<v.flechaabajolarga />}
          />
          <CardTotales
            total={totals.total}
            title="Total"
            color={tipo.color}
            icono={<v.balance />}
          />
        </section>
      )}

      {tipo.tipo === "b" && (
        <BalanceTrace onClick={(e) => e.stopPropagation()}>
          <div className="trace-header">
            <div className="trace-title">
              <span>Trazabilidad</span>
              <div className="trace-amount-row">
                <strong>{usuario?.moneda} {isLoadingSaldoAnterior && incluirSaldoAnterior ? "..." : saldoTrazado.toFixed(2)}</strong>
                <div className="trace-formula">{formulaTrazabilidad}</div>
              </div>
              <small>{incluirSaldoAnterior ? "Saldo estimado del período" : "Diferencia pagada del mes"}</small>
            </div>
            <div className="trace-actions" aria-label="Modo de trazabilidad">
              <button
                type="button"
                className={incluirSaldoAnterior ? "active" : ""}
                onClick={() => setIncluirSaldoAnterior(true)}
              >
                Con saldo anterior
              </button>
              <button
                type="button"
                className={!incluirSaldoAnterior ? "active" : ""}
                onClick={() => setIncluirSaldoAnterior(false)}
              >
                Solo mes
              </button>
            </div>
          </div>
          <div className="trace-summary" aria-label="Resumen de balance del mes">
            <div className={`summary-item ${claseMonto(totals.pendientes)}`}>
              <span>Pendiente del mes</span>
              <strong>{usuario?.moneda} {totals.pendientes.toFixed(2)}</strong>
            </div>
            <div className={`summary-item ${claseMonto(totals.pagados)}`}>
              <span>Pagado del mes</span>
              <strong>{usuario?.moneda} {totals.pagados.toFixed(2)}</strong>
            </div>
            <div className={`summary-item ${claseMonto(totals.total)}`}>
              <span>Balance del mes</span>
              <strong>{usuario?.moneda} {totals.total.toFixed(2)}</strong>
            </div>
          </div>
          <div className="trace-grid">
            <div className={`trace-item ${!incluirSaldoAnterior ? "muted" : ""}`}>
              <span>Saldo mes anterior</span>
              <strong>{usuario?.moneda} {incluirSaldoAnterior && isLoadingSaldoAnterior ? "..." : saldoMesAnterior.toFixed(2)}</strong>
              {!incluirSaldoAnterior && <small>No incluido en el cálculo actual</small>}
            </div>
            <div className="trace-item ingreso">
              <span>(+) Ingresos pagados</span>
              <strong>+{usuario?.moneda} {ingresosPagados.toFixed(2)}</strong>
            </div>
            <div className="trace-item gasto">
              <span>(-) Gastos pagados</span>
              <strong>-{usuario?.moneda} {gastosPagados.toFixed(2)}</strong>
            </div>
            <div className="trace-item transferencia">
              <span>Transferencias internas</span>
              <strong>{usuario?.moneda} 0.00</strong>
              <small>{usuario?.moneda} {transferenciasPagadas.toFixed(2)} movidos entre cuentas</small>
            </div>
          </div>
        </BalanceTrace>
      )}

      <section className="main">

        {(tipo.tipo == "i" || tipo.tipo == "b")
          && filteredDatamovimientos.i?.length > 0 &&
          <TablaMovimientos
            titulo={"Ingresos"}
            tipo={ingresos}
            color={v.colorIngresos}
            data={filteredDatamovimientos.i}
            setOpenRegistro={setOpenRegistro}
            setDataSelect={setDataSelect}
            setAccion={setAccion} />
        }

        {(tipo.tipo == "g" || tipo.tipo == "b")
          && filteredDatamovimientos.g?.length > 0 &&
          <TablaMovimientos
            titulo={"Gastos"}
            tipo={gastos}
            color={v.colorGastos}
            data={filteredDatamovimientos.g}
            setOpenRegistro={setOpenRegistro}
            setDataSelect={setDataSelect}
            setAccion={setAccion} />
        }

        {(tipo.tipo == "t" || tipo.tipo == "b")
          && filteredDatamovimientos.t?.length > 0 &&
          <TablaTransferencias
            titulo={"Transferencias"}
            tipo={transferencias}
            color={v.colorTransferencias}
            data={filteredDatamovimientos.t}
            setOpenRegistro={setOpenRegistro}
            setDataSelect={setDataSelect}
            setAccion={setAccion} />
        }
      </section>


      {(
        (tipo.tipo == "b" && filteredDatamovimientos.i?.length == 0 && filteredDatamovimientos.g?.length == 0 && filteredDatamovimientos.t?.length == 0) ||
        (tipo.tipo == "i" && filteredDatamovimientos.i?.length == 0) ||
        (tipo.tipo == "g" && filteredDatamovimientos.g?.length == 0) ||
        (tipo.tipo == "t" && filteredDatamovimientos.t?.length == 0)
      ) && (
          <EmptyState className="empty">
            <Lottieanimacion
              alto={300}
              ancho={300}
              animacion={tipo.tipo == "i" ? vacioverde : (tipo.tipo == "g" ? vaciorojo : vacioazul)}
            />
            <div className="empty-copy">
              <h2>No hay movimientos para mostrar</h2>
              <p>
                Probá cambiar el tipo, ajustar la categoría o registrar un nuevo movimiento para empezar a ver actividad en esta vista.
              </p>
            </div>
          </EmptyState>
        )}
    </Container>
  );
}
