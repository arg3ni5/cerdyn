import styled from "styled-components";
import {
  Header,
  Selector,
  v,
  ListaPaises,
  useUsuariosStore,
  ListaGenerica,
  TemasData,
  BtnForm,
  CardEliminarData,
} from "../../index";
import { useMemo, useState } from "react";

type SelectedCountry = {
  symbol?: string;
  countryName?: string;
};

type SelectedTheme = {
  tema?: string;
  descripcion?: string;
  icono?: string;
};

export function ConfiguracionTemplate() {
  const { usuario, editartemamonedauser } = useUsuariosStore();
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry>({});
  const [selectedTheme, setSelectedTheme] = useState<SelectedTheme>({});
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [countryListOpen, setCountryListOpen] = useState(false);
  const [themeListOpen, setThemeListOpen] = useState(false);

  const monedaActual = selectedCountry.symbol ?? usuario?.moneda ?? "CRC";
  const paisActual = selectedCountry.countryName ?? usuario?.pais ?? "Costa Rica";
  const temaActual = useMemo(() => {
    const iconFromUser = usuario?.tema === "0" ? "🌞" : "🌚";
    const labelFromUser = usuario?.tema === "0" ? "light" : "dark";

    return {
      icono: selectedTheme.icono ?? iconFromUser,
      nombre: selectedTheme.tema ?? labelFromUser,
      valor: selectedTheme.descripcion ?? labelFromUser,
    };
  }, [selectedTheme, usuario?.tema]);

  if (!usuario) {
    return null;
  }

  const guardarPreferencias = async () => {
    const p = {
      tema: temaActual.valor === "light" ? "0" : "1",
      moneda: monedaActual,
      pais: paisActual,
      id: usuario.id,
    };

    await editartemamonedauser(p);
  };

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: headerMenuOpen, setState: () => setHeaderMenuOpen(!headerMenuOpen) }}
        />
      </header>

      <HeroSection>
        <div>
          <Eyebrow>Ajustes</Eyebrow>
          <h1>Personalizá tu espacio de trabajo</h1>
          <p>
            Ajustá moneda, país y tema visual para que el panel refleje mejor cómo registrás tus
            gastos todos los días.
          </p>
        </div>
        <SummaryCard>
          <span>Preferencias activas</span>
          <strong>{monedaActual}</strong>
          <small>{paisActual}</small>
          <ThemeBadge>{temaActual.icono} {temaActual.nombre}</ThemeBadge>
        </SummaryCard>
      </HeroSection>

      <ActionsRow>
        <BtnForm
          titulo="Administrar Conexiones"
          icono={<v.iconovercuenta />}
          bgcolor="linear-gradient(135deg, #8fd3ff 0%, #3a8dff 100%)"
          url="/conexiones"
        />
      </ActionsRow>

      <ContentGrid>
        <SettingsPanel>
          <PanelHeader>
            <h2>Preferencias</h2>
            <p>Guardá la configuración que querés usar en cada sesión.</p>
          </PanelHeader>

          <FieldCard>
            <FieldLabel>Moneda Principal</FieldLabel>
            <FieldDescription>Elegí el país base para tus registros y reportes.</FieldDescription>
            <Selector
              state={countryListOpen}
              color={v.colorselector}
              texto1={`🐷 ${monedaActual} ${paisActual}`}
              funcion={() => setCountryListOpen(!countryListOpen)}
            />
            {countryListOpen && (
              <ListaPaises
                setSelect={(pais) => setSelectedCountry(pais)}
                setState={() => setCountryListOpen(false)}
              />
            )}
          </FieldCard>

          <FieldCard>
            <FieldLabel>Tema Visual</FieldLabel>
            <FieldDescription>Alterná entre un entorno claro o uno oscuro.</FieldDescription>
            <Selector
              texto1={`${temaActual.icono} ${temaActual.nombre}`}
              color={v.colorselector}
              state={themeListOpen}
              funcion={() => setThemeListOpen(!themeListOpen)}
            />
            {themeListOpen && (
              <ListaGenerica
                bottom="88%"
                data={TemasData}
                setState={() => setThemeListOpen(false)}
                funcion={setSelectedTheme}
              />
            )}
          </FieldCard>

          <SaveRow>
            <BtnForm
              titulo="Guardar Preferencias"
              bgcolor="linear-gradient(135deg, #ffd667 0%, #ff9558 100%)"
              icono={<v.iconoguardar />}
              funcion={guardarPreferencias}
            />
          </SaveRow>
        </SettingsPanel>

        <DangerPanel>
          <PanelHeader>
            <h2>Privacidad</h2>
            <p>Gestioná el borrado de datos si necesitás reiniciar tu cuenta.</p>
          </PanelHeader>
          <CardEliminarData />
        </DangerPanel>
      </ContentGrid>
    </Container>
  );
}
const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  gap: 24px;
  grid-template:
    "header" auto
    "hero" auto
    "actions" auto
    "content" 1fr;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
`;
const HeroSection = styled.section`
  grid-area: hero;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
  gap: 18px;

  h1 {
    margin: 10px 0 12px;
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    line-height: 0.96;
    text-wrap: balance;
  }

  p {
    max-width: 42rem;
    margin: 0;
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 1rem;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
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
const SummaryCard = styled.aside`
  padding: 24px;
  border-radius: 26px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(198, 228, 255, 0.82));
  color: #172335;
  display: grid;
  gap: 8px;
  box-shadow: 0 20px 40px rgba(45, 98, 166, 0.12);

  span {
    font-size: 0.88rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #47627f;
  }

  strong {
    font-size: 2.4rem;
    line-height: 1;
  }

  small {
    font-size: 1rem;
    color: #3f5670;
  }
`;
const ThemeBadge = styled.div`
  width: fit-content;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(23, 35, 53, 0.08);
  font-weight: 700;
`;
const ActionsRow = styled.section`
  grid-area: actions;
  display: flex;
  justify-content: flex-start;
`;
const ContentGrid = styled.section`
  grid-area: content;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.9fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;
const SettingsPanel = styled.section`
  padding: 24px;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  display: grid;
  gap: 18px;
`;
const DangerPanel = styled(SettingsPanel)`
  background: linear-gradient(180deg, ${({ theme }) => theme.bg3}, rgba(255, 131, 131, 0.08));
`;
const PanelHeader = styled.div`
  display: grid;
  gap: 6px;

  h2 {
    margin: 0;
    font-size: 1.35rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;
const FieldCard = styled.div`
  position: relative;
  padding: 20px;
  border-radius: 22px;
  background: ${({ theme }) => theme.bgAlpha};
  display: grid;
  gap: 10px;
  justify-items: start;
`;
const FieldLabel = styled.span`
  font-size: 0.96rem;
  font-weight: 800;
`;
const FieldDescription = styled.span`
  color: ${({ theme }) => theme.colorSubtitle};
  font-size: 0.95rem;
`;
const SaveRow = styled.div`
  display: flex;
  justify-content: flex-start;
`;
