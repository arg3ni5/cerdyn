import {
  Header,
  ContentFiltros,
  Btndesplegable,
  useOperaciones,
  ListaMenuDesplegable,
  Btnfiltro,
  v,
  Lottieanimacion,
  Tipo,
  Accion,
  Movimiento,
  useMovimientosStore,
  RegistrarMovimientos,
  CardTotales,
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
import { Container, ContentFiltro, TipoBar, MobileOnly, DesktopOnly } from './MovimientosTemplate.styles';


export const MovimientosTemplate = (): JSX.Element => {
  const [openRegistro, setOpenRegistro] = useState(false);
  const [accion, setAccion] = useState<Accion>("Nuevo");
  const [state, setState] = useState(false);
  const [stateTipo, setStateTipo] = useState(false);
  const { setTipoMovimientos, selectTipoMovimiento: tipo } = useOperaciones();
  const {
    totalMesAño,
    totalMesAñoPagados,
    totalMesAñoPendientes,
    datamovimientos,
  } = useMovimientosStore();

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

  const tipos: Record<TipoMovimiento, Tipo> = {
    g: gastos,
    i: ingresos,
    b: balance
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

      <TipoBar className="tipo">
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
                data={[ingresos, gastos, balance]}
                top="112%"
                funcion={(p) => cambiarTipo(p as Tipo)}
              />
            )}
          </MobileOnly>
        </ContentFiltros>
        {/* boton agregar */}
        <ContentFiltro>
          <Btnfiltro
            funcion={nuevoRegistro}
            bgcolor={tipo.bgcolor}
            textcolor={tipo.color}
            icono={<v.agregar />}
          />
        </ContentFiltro>
      </TipoBar>

      <section className="totales">
        <CardTotales
          total={totalMesAñoPendientes}
          title={obtenerTitulo(tipo.tipo as "i" | "g" | "b", "pendientes")}
          color={tipo.color}
          icono={<v.flechaarribalarga />}
        />
        <CardTotales
          total={totalMesAñoPagados}
          title={obtenerTitulo(tipo.tipo as "i" | "g" | "b", "pagados")}
          color={tipo.color}
          icono={<v.flechaabajolarga />}
        />
        <CardTotales
          total={totalMesAño}
          title="Total"
          color={tipo.color}
          icono={<v.balance />}
        />
      </section>

      <section className="calendario">
        <CalendarioLineal />
      </section>

      <section className="main">

        {(tipo.tipo == "i" || tipo.tipo == "b")
          && datamovimientos.i?.length > 0 &&
          <TablaMovimientos
            titulo={"Ingresos"}
            tipo={ingresos}
            color={v.colorIngresos}
            data={datamovimientos.i}
            setOpenRegistro={setOpenRegistro}
            setDataSelect={setDataSelect}
            setAccion={setAccion} />
        }

        {(tipo.tipo == "g" || tipo.tipo == "b")
          && datamovimientos.g?.length > 0 &&
          <TablaMovimientos
            titulo={"Gastos"}
            tipo={gastos}
            color={v.colorGastos}
            data={datamovimientos.g}
            setOpenRegistro={setOpenRegistro}
            setDataSelect={setDataSelect}
            setAccion={setAccion} />
        }
      </section>


      {(
        (tipo.tipo == "b" && datamovimientos.i?.length == 0 && datamovimientos.g?.length == 0) ||
        (tipo.tipo == "i" && datamovimientos.i?.length == 0) ||
        (tipo.tipo == "g" && datamovimientos.g?.length == 0)
      ) && (
          <section className="empty">
            <Lottieanimacion
              alto={300}
              ancho={300}
              animacion={tipo.tipo == "i" ? vacioverde : (tipo.tipo == "g" ? vaciorojo : vacioazul)}
            />
          </section>
        )}
    </Container>
  );
}
