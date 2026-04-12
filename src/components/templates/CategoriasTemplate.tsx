import styled from "styled-components";
import {
  Header,
  Btndesplegable,
  useOperaciones,
  ListaMenuDesplegable,
  DataDesplegableTipo,
  v,
  TablaCategorias,
  RegistrarCategorias,
  Lottieanimacion,
  Tipo,
  CategoriaInsert,
  CategoriaUpdate,
  Categoria,
  Accion,
  useLoading,
} from "../../index";
import { JSX, useState } from "react";
import vacioverde from "../../assets/vacioverde.json";
import vaciorojo from "../../assets/vaciorojo.json";

interface CategoriasTemplateProps {
  data: Categoria[];
}

export const CategoriasTemplate = ({ data }: CategoriasTemplateProps): JSX.Element => {
  const { isLoading } = useLoading();
  const [openRegistro, setOpenRegistro] = useState(false);
  const [accion, setAccion] = useState("");
  const [dataSelect, setDataSelect] = useState<CategoriaInsert | CategoriaUpdate>();
  const [state, setState] = useState(false);
  const [stateTipo, setStateTipo] = useState(false);
  const { setTipoCategoria, selectTipoCategoria } = useOperaciones();

  const cambiarTipo = (p: Tipo): void => {
    setTipoCategoria(p);
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

  const nuevoRegistro = (): void => {
    setOpenRegistro(!openRegistro);
    setAccion("Nuevo");
    setDataSelect({});
  };

  const categoryTypeLabel = selectTipoCategoria.tipo === "i" ? "Ingresos" : "Gastos";
  const categoryTypeDescription =
    selectTipoCategoria.tipo === "i"
      ? "Organizá las categorías que usás para registrar ingresos y entradas de dinero."
      : "Ordená tus categorías de gasto para analizar mejor en qué se va tu presupuesto.";

  return (
    <Container onClick={cerrarDesplegables}>
      {openRegistro && (
        <RegistrarCategorias
          dataSelect={dataSelect || {}}
          onClose={() => setOpenRegistro(!openRegistro)}
          accion={accion as Accion}
        />
      )}

      <header className="header">
        <Header stateConfig={{ state, setState: openUser }} />
      </header>

      <section className="hero">
        <HeroCopy>
          <Eyebrow>Categorías</Eyebrow>
          <h1>{categoryTypeLabel} bien organizados</h1>
          <p>{categoryTypeDescription}</p>
        </HeroCopy>

        <HeroStats>
          <span>Total visible</span>
          <strong>{data.length}</strong>
          <small>{data.length === 1 ? "categoría" : "categorías"}</small>
          <TypeBadge
            $textcolor={selectTipoCategoria.color}
            $bgcolor={selectTipoCategoria.bgcolor}
          >
            {selectTipoCategoria.text}
          </TypeBadge>
        </HeroStats>
      </section>

      <section className="toolbar">
        <ToolbarCard
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ToolbarLabel>Tipo de categoría</ToolbarLabel>
          <ToolbarDescription>Cambiá entre ingresos y gastos para revisar cada grupo.</ToolbarDescription>
          <ToolbarActions>
            <Btndesplegable
              textcolor={selectTipoCategoria.color}
              bgcolor={selectTipoCategoria.bgcolor}
              text={selectTipoCategoria.text}
              funcion={openTipo}
            />
            {stateTipo && (
              <ListaMenuDesplegable
                data={DataDesplegableTipo}
                top="112%"
                funcion={(p) => cambiarTipo(p as Tipo)}
              />
            )}
          </ToolbarActions>
        </ToolbarCard>

        <ActionCard>
          <ToolbarLabel>Nueva categoría</ToolbarLabel>
          <ToolbarDescription>Creá una categoría con color e ícono para identificarla rápido.</ToolbarDescription>
          <PrimaryAction
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nuevoRegistro();
            }}
            $bgcolor={selectTipoCategoria.bgcolor}
            $textcolor={selectTipoCategoria.color}
          >
            <span className="icon">
              <v.agregar />
            </span>
            <span>Agregar Categoría</span>
          </PrimaryAction>
        </ActionCard>
      </section>

      <section className="main">
        {data.length === 0 && !isLoading && (
          <EmptyState>
            <Lottieanimacion
              alto={260}
              ancho={260}
              animacion={selectTipoCategoria.tipo === "i" ? vacioverde : vaciorojo}
            />
            <div className="empty-copy">
              <h2>No hay categorías todavía</h2>
              <p>
                Empezá creando tu primera categoría de {categoryTypeLabel.toLowerCase()} para que
                los movimientos queden mejor organizados.
              </p>
            </div>
          </EmptyState>
        )}

        {Array.isArray(data) && data.length > 0 && (
          <TableShell>
            <TablaCategorias
              data={data}
              setOpenRegistro={setOpenRegistro}
              setdataSelect={setDataSelect}
              setAccion={setAccion}
            />
          </TableShell>
        )}
      </section>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  gap: 22px;
  grid-template:
    "header" 100px
    "hero" auto
    "toolbar" auto
    "main" auto;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }

  .hero {
    grid-area: hero;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(250px, 0.75fr);
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .toolbar {
    grid-area: toolbar;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.8fr);
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .main {
    grid-area: main;
  }
`;

const HeroCopy = styled.div`
  h1 {
    margin: 8px 0 10px;
    font-size: clamp(2.1rem, 5vw, 3.4rem);
    line-height: 0.94;
    text-wrap: balance;
  }

  p {
    max-width: 44rem;
    margin: 0;
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 1rem;
    text-wrap: pretty;
  }
`;

const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.primary};
`;

const HeroStats = styled.aside`
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(198, 228, 255, 0.8));
  color: #172335;
  display: grid;
  align-content: start;
  gap: 8px;
  box-shadow: 0 20px 40px rgba(45, 98, 166, 0.12);

  span {
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #47627f;
  }

  strong {
    font-size: 2.6rem;
    line-height: 1;
  }

  small {
    color: #47627f;
    font-size: 0.98rem;
  }
`;

const TypeBadge = styled.div<{ $bgcolor: string; $textcolor: string }>`
  width: fit-content;
  margin-top: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: ${({ $textcolor }) => $textcolor};
  font-weight: 800;
`;

const ToolbarCard = styled.div`
  position: relative;
  padding: 22px;
  border-radius: 26px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
`;

const ActionCard = styled(ToolbarCard)`
  display: grid;
  align-content: start;
  gap: 14px;
`;

const ToolbarLabel = styled.span`
  display: block;
  font-weight: 800;
  font-size: 1rem;
`;

const ToolbarDescription = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colorSubtitle};
`;

const ToolbarActions = styled.div`
  width: fit-content;
  margin-top: 14px;
`;

const PrimaryAction = styled.button<{ $bgcolor: string; $textcolor: string }>`
  border: none;
  border-radius: 18px;
  padding: 14px 18px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: ${({ $textcolor }) => $textcolor};
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 32px rgba(0, 0, 0, 0.12);
    filter: brightness(1.02);
  }
`;

const EmptyState = styled.div`
  min-height: 420px;
  border-radius: 30px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  display: grid;
  place-items: center;
  gap: 6px;
  padding: 24px;
  text-align: center;

  .empty-copy {
    display: grid;
    gap: 8px;
    max-width: 32rem;
  }

  h2 {
    margin: 0;
    font-size: 1.65rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

const TableShell = styled.div`
  border-radius: 30px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  overflow: hidden;
`;
