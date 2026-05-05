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
  grid-template: ${({ $isBalanceActive }) =>
    $isBalanceActive
      ? `
        "header" auto
        "hero" auto
        "balance-trace" auto
        "main" auto
        "empty" auto
      `
      : `
        "header" auto
        "hero" auto
        "totales" auto
        "main" auto
        "empty" auto
      `};

  .header {
    margin-left: 15px;
    grid-area: header;
    display: flex;
    align-items: center;
    min-height: 100px;

    @media (max-width: 640px) {
      margin-left: 0;
      min-height: 0;
      align-items: flex-start;
    }
  }

  .hero {
    grid-area: hero;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.32fr);
    gap: 18px;
    align-items: stretch;

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

export const BalanceTrace = styled.section`
  grid-area: balance-trace;
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: 28px;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid rgba(151, 151, 151, 0.12);
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);

  .trace-header {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(151, 151, 151, 0.18);
  }

  .trace-title {
    display: grid;
    gap: 6px;
    min-width: 0;

    span {
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${({ theme }) => theme.colorSubtitle};
    }

    small {
      color: ${({ theme }) => theme.colorSubtitle};
      font-size: 0.9rem;
    }
  }

  .trace-amount-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex-wrap: wrap;

    strong {
      font-size: clamp(1.55rem, 3vw, 2rem);
      line-height: 1;
    }
  }

  .trace-actions {
    display: inline-flex;
    gap: 6px;
    padding: 5px;
    border-radius: 999px;
    background: ${({ theme }) => theme.bgAlpha};
    border: 1px solid rgba(151, 151, 151, 0.16);

    button {
      min-height: 36px;
      border: none;
      border-radius: 999px;
      padding: 8px 12px;
      background: transparent;
      color: ${({ theme }) => theme.text};
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 800;
      white-space: nowrap;
      transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }

      &.active {
        background: ${({ theme }) => theme.primary};
        color: #ffffff;
      }
    }
  }

  .trace-formula {
    width: fit-content;
    padding: 9px 12px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.12);
    color: ${({ theme }) => theme.text};
    font-size: 0.82rem;
    font-weight: 800;

    .formula-ingreso {
      color: #10b981;
    }

    .formula-gasto {
      color: #ef4444;
    }
  }

  .trace-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .summary-item {
    min-width: 0;
    padding: 14px;
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0)),
      ${({ theme }) => theme.bgAlpha};
    border: 1px solid rgba(151, 151, 151, 0.12);
    display: grid;
    gap: 8px;

    span {
      color: ${({ theme }) => theme.colorSubtitle};
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    strong {
      font-size: 1.08rem;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }

    &.positivo strong {
      color: #10b981;
    }

    &.negativo strong {
      color: #ef4444;
    }

    &.neutro strong {
      color: #8b5cf6;
    }
  }

  .trace-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .trace-item {
    min-width: 0;
    padding: 14px;
    border-radius: 18px;
    background: ${({ theme }) => theme.bgAlpha};
    display: grid;
    gap: 8px;
    align-content: start;

    span,
    small {
      color: ${({ theme }) => theme.colorSubtitle};
    }

    span {
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    strong {
      font-size: 1.12rem;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }

    small {
      font-size: 0.82rem;
      line-height: 1.3;
    }

    &.ingreso strong {
      color: #10b981;
    }

    &.gasto strong {
      color: #ef4444;
    }

    &.transferencia strong {
      color: #3b82f6;
    }

    &.muted {
      opacity: 0.68;

      strong {
        color: ${({ theme }) => theme.colorSubtitle};
      }
    }
  }

  @media (max-width: 980px) {
    .trace-summary {
      grid-template-columns: 1fr;
    }

    .trace-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    padding: 16px;
    border-radius: 22px;

    .trace-header {
      display: grid;
    }

    .trace-actions {
      width: 100%;
      justify-content: stretch;

      button {
        flex: 1;
      }
    }

    .trace-grid {
      grid-template-columns: 1fr;
    }
  }
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

export const FilterBar = styled.div`
  min-width: 0;
  padding: 14px;
  border-radius: 24px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  display: grid;
  gap: 12px;

  .filter-row {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) minmax(210px, auto);
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  @media (max-width: 720px) {
    .filter-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 20px;
    gap: 10px;
  }
`;

export const FilterSearch = styled.div`
  min-width: 0;

  input {
    min-height: 46px;
  }
`;

export const TypeTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  min-width: 0;

  @media (max-width: 760px) {
    display: flex;
    overflow-x: auto;
    padding: 2px 2px 6px;
    scrollbar-width: thin;
    scroll-snap-type: x proximity;
  }
`;

export const TypeTabButton = styled.button<AccentProps & { $active: boolean }>`
  border: 1px solid ${({ $active, $bgcolor }) => ($active ? "transparent" : $bgcolor)};
  border-radius: 999px;
  padding: 10px 13px;
  min-height: 44px;
  min-width: 0;
  background: ${({ $active, $bgcolor }) => ($active ? $bgcolor : "transparent")};
  color: ${({ $active, $textcolor, theme }) => ($active ? $textcolor : theme.text)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 800;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;

  span {
    font-size: 17px;
    line-height: 1;
  }

  strong {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    transform: translateY(-1px);
    background: ${({ $bgcolor }) => $bgcolor};
    color: ${({ $textcolor }) => $textcolor};
  }

  @media (max-width: 760px) {
    flex: 0 0 auto;
    min-width: 124px;
    scroll-snap-align: start;
  }

  @media (max-width: 420px) {
    min-width: 112px;
    padding-inline: 10px;

    strong {
      font-size: 12px;
    }
  }
`;

export const CategoryFilter = styled.div`
  min-width: 210px;

  > div {
    width: 100%;
  }

  @media (max-width: 720px) {
    min-width: 0;
  }
`;

export const FloatingActionMenu = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;

  .opciones {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  @media (min-width: 768px) {
    right: 32px;
    bottom: 32px;
  }
`;

export const FloatingActionToggle = styled.button`
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #e14e19;
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(225, 78, 25, 0.28);
  transition: transform 0.2s ease, background-color 0.2s ease;

  svg {
    width: 28px;
    height: 28px;
  }

  &:hover {
    transform: scale(1.05);
    background: #c44214;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const FloatingActionOption = styled.button<AccentProps>`
  border: none;
  border-radius: 18px;
  padding: 12px 14px;
  min-width: 168px;
  background: ${({ $bgcolor }) => $bgcolor};
  color: ${({ $textcolor }) => $textcolor};
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
  transition: transform 0.2s ease, filter 0.2s ease;

  span {
    font-size: 20px;
    line-height: 1;
  }

  strong {
    font-size: 14px;
  }

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }
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
