import {
  Header,
  useOperaciones,
  v,
  Lottieanimacion,
  Tipo,
  Accion,
  Movimiento,
  useMovimientosStore,
  RegistrarMovimientos,
  CardTotales,
  InputBuscadorLista,
  Selector,
  ListaGenerica,
  useCategoriasStore,
  DataMovimientos,
  CalendarioLineal,
  obtenerTitulo,
  TablaMovimientos,
  TablaTransferencias,
  TipoMovimiento,
} from "../../index";
import { JSX, useState } from "react";
import vacioverde from "../../assets/vacioverde.json";
import vaciorojo from "../../assets/vaciorojo.json";
import vacioazul from "../../assets/vacioazul.json";
import { DataDesplegables } from '../../utils/dataEstatica';
import {
  ActionCard,
  CalendarShell,
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
} from './MovimientosTemplate.styles';


export const MovimientosTemplate = (): JSX.Element => {
  const [openRegistro, setOpenRegistro] = useState(false);
  const [accion, setAccion] = useState<Accion>("Nuevo");
  const [state, setState] = useState(false);
  const [stateAccionesRegistro, setStateAccionesRegistro] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState<Tipo | undefined>(undefined);
  const { setTipoMovimientos, selectTipoMovimiento: tipo } = useOperaciones();
  const {
    datamovimientos,
    filtroDescripcion,
    filtroCategoria,
    setFiltros,
  } = useMovimientosStore();

  const { datacategoria } = useCategoriasStore();
  const [stateListaCategorias, setStateListaCategorias] = useState(false);

  const [dataSelect, setDataSelect] = useState<Movimiento | undefined>(undefined);

  const cambiarTipo = (p: Tipo): void => {
    setTipoMovimientos(p);
    setState(false);
    setStateListaCategorias(false);
    setFiltros(filtroDescripcion, "");
  };

  const cerrarDesplegables = (): void => {
    setState(false);
    setStateAccionesRegistro(false);
    setStateListaCategorias(false);
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
      const matchCategoria = filtroCategoria === "" || item.categoria === filtroCategoria;
      return (matchDescripcion || matchMonto) && matchCategoria;
    });
  };

  const filteredDatamovimientos: DataMovimientos = {
    i: filterMovimientos(datamovimientos?.i || []),
    g: filterMovimientos(datamovimientos?.g || []),
    t: filterMovimientos(datamovimientos?.t || []),
  };

  const calculateFilteredTotals = (tipoMovimiento: "i" | "g" | "b" | "t") => {
    const esPagadoLocal = (estado: unknown): boolean => {
      if (typeof estado === "boolean") return estado;
      if (typeof estado === "number") return estado === 1;
      if (typeof estado === "string") {
        const valor = estado.trim().toLowerCase();
        return valor === "1" || valor === "true";
      }
      return false;
    };

    if (tipoMovimiento === "b") {
      const ing = filteredDatamovimientos.i;
      const gas = filteredDatamovimientos.g;

      const tIng = ing.reduce((sum, item) => sum + Number(item.valor), 0);
      const tGas = gas.reduce((sum, item) => sum + Number(item.valor), 0);
      const pIng = ing.filter(item => esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const pGas = gas.filter(item => esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const penIng = ing.filter(item => !esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const penGas = gas.filter(item => !esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);

      return {
        total: tIng - tGas,
        pagados: pIng - pGas,
        pendientes: penIng - penGas
      };
    } else if (tipoMovimiento === "t") {
      const movs = filteredDatamovimientos.t;
      const total = movs.reduce((sum, item) => sum + Number(item.valor), 0);
      const pagados = movs.filter(item => esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const pendientes = movs.filter(item => !esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      return { total, pagados, pendientes };
    } else {
      const movs = filteredDatamovimientos[tipoMovimiento as "i" | "g"];
      const total = movs.reduce((sum, item) => sum + Number(item.valor), 0);
      const pagados = movs.filter(item => esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      const pendientes = movs.filter(item => !esPagadoLocal(item.estado)).reduce((sum, item) => sum + Number(item.valor), 0);
      return { total, pagados, pendientes };
    }
  };

  const totals = calculateFilteredTotals(tipo.tipo as "i" | "g" | "b" | "t");
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
        <Header stateConfig={{ state: state, setState: openUser }} eyebrow="Movimientos" title={tituloMovimientos} />
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

            {mostrarFiltroCategoria && (
              <CategoryFilter>
                <ContentFiltro>
                  <Selector
                    color={tipo.color}
                    texto1="Categoría: "
                    texto2={filtroCategoria || "Todas"}
                    funcion={() => setStateListaCategorias(!stateListaCategorias)}
                    state={stateListaCategorias}
                  />
                  {stateListaCategorias && (
                    <ListaGenerica
                      data={[
                        { icono: "📁", descripcion: "Todas" },
                        ...(datacategoria?.map(c => ({ icono: c.icono, descripcion: c.descripcion })) || [])
                      ]}
                      setState={() => setStateListaCategorias(false)}
                      funcion={(item) => setFiltros(filtroDescripcion, item.descripcion === "Todas" ? "" : item.descripcion)}
                    />
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

      <section className="calendario">
        <CalendarShell>
          <CalendarioLineal />
        </CalendarShell>
      </section>

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
