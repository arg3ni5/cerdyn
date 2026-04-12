import {
  Header,
  ContentFiltros,
  Btndesplegable,
  useOperaciones,
  ListaMenuDesplegable,
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
  BtnIcono,
  TablaMovimientos,
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
  Container,
  ContentFiltro,
  DesktopOnly,
  EmptyState,
  Eyebrow,
  HeroCopy,
  HeroStats,
  MobileOnly,
  PrimaryAction,
  SearchCard,
  ToolbarActions,
  ToolbarCard,
  ToolbarDescription,
  ToolbarLabel,
  TypeBadge,
} from './MovimientosTemplate.styles';


export const MovimientosTemplate = (): JSX.Element => {
  const [openRegistro, setOpenRegistro] = useState(false);
  const [accion, setAccion] = useState<Accion>("Nuevo");
  const [state, setState] = useState(false);
  const [stateTipo, setStateTipo] = useState(false);
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
    setStateTipo(!stateTipo);
    setState(false);
  };

  const cerrarDesplegables = (): void => {
    setStateTipo(false);
    setState(false);
  };

  const openTipo = (): void => {
    setStateTipo(!stateTipo);
    setState(false);
  };
  const openUser = (): void => {
    setState(!state);
    setStateTipo(false);
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
  const tipoAlterno = tipo.tipo === "g" ? tipos.i : tipos.g;
  const tipoTercero = tipo.tipo === "b" ? tipos.i : tipos.b;
  const accionAlterno = tipo.tipo === "g" ? ingresos : gastos;
  const accionTercero = tipo.tipo === "b" ? ingresos : balance;

  const nuevoRegistro = (): void => {
    setOpenRegistro(!openRegistro);
    setAccion("Nuevo");
    setDataSelect(undefined);
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
    (filteredDatamovimientos.i?.length || 0) +
    (filteredDatamovimientos.g?.length || 0) +
    (filteredDatamovimientos.t?.length || 0);
  const typeDescriptionMap: Record<TipoMovimiento, string> = {
    g: "Revisá tus gastos del período, filtrá rápido por categoría y encontrá en qué se está yendo el dinero.",
    i: "Seguile la pista a tus ingresos con una vista más limpia para detectar entradas registradas, pagadas y pendientes.",
    b: "Compará ingresos, gastos y transferencias en una sola vista para entender cómo viene tu balance general.",
    t: "Controlá tus transferencias entre cuentas y revisá cuáles ya quedaron registradas dentro del período activo.",
  };

  return (
    <Container onClick={cerrarDesplegables} $isBalanceActive={isBalanceActive}>
      {openRegistro && (
        <RegistrarMovimientos
          accion={accion}
          dataSelect={dataSelect}
          state={openRegistro}
          setState={() => setOpenRegistro(!openRegistro)}
        />
      )}

      <header className="header">
        <Header stateConfig={{ state: state, setState: openUser }} />
      </header>

      <section className="hero">
        <HeroCopy>
          <Eyebrow>Movimientos</Eyebrow>
          <h1>{tipoActual.text}s con más contexto</h1>
          <p>{typeDescriptionMap[tipo.tipo as TipoMovimiento]}</p>
        </HeroCopy>

        <HeroStats>
          <span>Movimientos visibles</span>
          <strong>{totalVisible}</strong>
          <small>{totalVisible === 1 ? "registro filtrado" : "registros filtrados"}</small>
          <TypeBadge $bgcolor={tipoActual.bgcolor} $textcolor={tipoActual.color}>
            {tipoActual.text}
          </TypeBadge>
        </HeroStats>
      </section>

      <section className="toolbar">
        <ToolbarCard
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ToolbarLabel>Tipo de movimiento</ToolbarLabel>
          <ToolbarDescription>
            Alterná entre ingresos, gastos, balance y transferencias sin perder el contexto del período.
          </ToolbarDescription>
          <ToolbarActions>
            <ContentFiltros>
              <DesktopOnly>
                <div className="filtros-activo">
                  <BtnIcono
                    active
                    icono={tipoActual.icono}
                    textcolor={tipoActual.color}
                    bgcolor={tipoActual.bgcolor}
                    text={`${tipoActual.text}s`}
                    funcion={() => { }}
                  />
                </div>

                <div className="filtros-secundarios">
                  <BtnIcono
                    icono={tipoAlterno.icono}
                    textcolor={tipoAlterno.color}
                    bgcolor={tipoAlterno.bgcolor}
                    text={`Ver ${tipoAlterno.text}s`}
                    funcion={() => { cambiarTipo(accionAlterno) }}
                  />

                  <BtnIcono
                    icono={tipoTercero.icono}
                    textcolor={tipoTercero.color}
                    bgcolor={tipoTercero.bgcolor}
                    text={`Ver ${tipoTercero.text}s`}
                    funcion={() => cambiarTipo(accionTercero)}
                  />
                </div>
              </DesktopOnly>

              <MobileOnly
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Btndesplegable
                  icono={tipoActual.icono}
                  textcolor={tipoActual.color}
                  bgcolor={tipoActual.bgcolor}
                  text={tipoActual.text}
                  active
                  funcion={openTipo}
                />
                {stateTipo && (
                  <ListaMenuDesplegable
                    data={[ingresos, gastos, balance, transferencias]}
                    top="112%"
                    funcion={(p) => cambiarTipo(p as Tipo)}
                  />
                )}
              </MobileOnly>
            </ContentFiltros>
          </ToolbarActions>
        </ToolbarCard>

        <ActionCard>
          <ToolbarLabel>Nuevo movimiento</ToolbarLabel>
          <ToolbarDescription>
            Registrá un movimiento manual para mantener el período al día desde esta misma pantalla.
          </ToolbarDescription>
          <PrimaryAction
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nuevoRegistro();
            }}
            $bgcolor={tipo.bgcolor}
            $textcolor={tipo.color}
          >
            <span className="icon">
              <v.agregar />
            </span>
            <span>Agregar Movimiento</span>
          </PrimaryAction>
        </ActionCard>
      </section>

      <section className="busqueda">
        <SearchCard>
          <div>
            <ToolbarLabel>Búsqueda rápida</ToolbarLabel>
            <ToolbarDescription>
              Encontrá un movimiento por descripción o monto sin salir del período actual.
            </ToolbarDescription>
          </div>
          <InputBuscadorLista
            placeholder="Buscar por descripción o monto..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltros(e.target.value, filtroCategoria)}
          />
        </SearchCard>
        <SearchCard
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div>
            <ToolbarLabel>Filtrar por categoría</ToolbarLabel>
            <ToolbarDescription>
              Enfocá la lista en una categoría puntual para revisar mejor el detalle.
            </ToolbarDescription>
          </div>
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
        </SearchCard>
      </section>

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
          <TablaMovimientos
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
