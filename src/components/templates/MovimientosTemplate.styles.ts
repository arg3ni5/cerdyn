import styled from "styled-components";
import { Device } from "../../index";

interface ContainerProps {
  $isBalanceActive: boolean;
}

interface AccentProps {
  $bgcolor: string;
  $textcolor: string;
}

export const Container = styled.div<ContainerProps>`
  max-width: 100%;
  overflow-x: hidden;
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
    "busqueda" auto
    "totales" auto
    "calendario" auto
    "main" auto
    "empty" auto;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }

  .hero {
    grid-area: hero;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.85fr);
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .toolbar {
    grid-area: toolbar;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.9fr);
    gap: 18px;

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
    }
  }

  .busqueda {
    grid-area: busqueda;
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.7fr);
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .totales {
    grid-area: totales;
    display: grid;    
    align-items: stretch;
    grid-template-columns: 1fr;
    gap: 14px;

    @media ${Device.tablet} {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .calendario {
    grid-area: calendario;
  }

  .main {
    grid-area: main;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 16px;

    > * {
      flex: 1 1 100%;
      max-width: 100%;
    }

    @media ${Device.tablet} {
      > * {
        flex: ${({ $isBalanceActive }) => ($isBalanceActive ? "1 1 calc(50% - 8px)" : "1 1 100%")};
        max-width: ${({ $isBalanceActive }) => ($isBalanceActive ? "calc(50% - 8px)" : "100%")};
      }
    }
  }

  .empty {
    grid-area: empty;
  }

  .filtros-activo {
    display: flex;
    justify-content: flex-start;
    margin-right: auto;
  }

  .filtros-secundarios {
    display: flex;
    margin-left: auto;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

export const HeroCopy = styled.div`
  h1 {
    margin: 8px 0 10px;
    font-size: clamp(2.1rem, 5vw, 3.45rem);
    line-height: 0.94;
    text-wrap: balance;
  }

  p {
    max-width: 48rem;
    margin: 0;
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 1rem;
    text-wrap: pretty;
  }
`;

export const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.primary};
`;

export const HeroStats = styled.aside`
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
    font-size: 2.45rem;
    line-height: 1;
  }

  small {
    color: #47627f;
    font-size: 0.98rem;
  }
`;

export const TypeBadge = styled.div<AccentProps>`
  width: fit-content;
  margin-top: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: ${({ $textcolor }) => $textcolor};
  font-weight: 800;
`;

export const ContentFiltro = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

export const TipoBar = styled.section`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;

  > :first-child {
    width: 100%;
    min-width: 0;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const ToolbarCard = styled.div`
  position: relative;
  padding: 22px;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
`;

export const ToolbarLabel = styled.span`
  display: block;
  font-weight: 800;
  font-size: 1rem;
`;

export const ToolbarDescription = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colorSubtitle};
  text-wrap: pretty;
`;

export const ToolbarActions = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const SearchCard = styled(ToolbarCard)`
  display: grid;
  gap: 14px;
`;

export const ActionCard = styled(ToolbarCard)`
  display: grid;
  align-content: start;
  gap: 14px;
`;

export const PrimaryAction = styled.button<AccentProps>`
  border: none;
  border-radius: 18px;
  padding: 14px 18px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: ${({ $textcolor }) => $textcolor};
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

export const CalendarShell = styled.div`
  width: 100%;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  padding: 8px 10px;
`;

export const EmptyState = styled.section`
  min-height: 420px;
  border-radius: 30px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 24px;
  text-align: center;

  .empty-copy {
    display: grid;
    gap: 8px;
    max-width: 34rem;
  }

  h2 {
    margin: 0;
    font-size: 1.7rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

export const MobileOnly = styled.div`
  display: block;

  @media ${Device.tablet} {
    display: none;
  }
`;

export const DesktopOnly = styled.div`
  display: none;

  @media ${Device.tablet} {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: 10px;
  }
`;
