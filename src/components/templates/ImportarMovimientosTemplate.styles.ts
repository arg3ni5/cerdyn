import styled from 'styled-components';

interface StatCardProps {
  $tone?: 'neutral' | 'success' | 'warning' | 'transfer';
}

interface ChipProps {
  $kind: 'i' | 'g' | 't' | 'unknown';
}

export const Container = styled.div`
  max-width: 100%;
  overflow-x: hidden;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  gap: 22px;
  grid-template:
    'header' auto
    'hero' auto
    'main' auto;

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
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.45fr);
    gap: 18px;
    align-items: stretch;

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
    }
  }

  .main {
    grid-area: main;
    display: grid;
    gap: 18px;
  }
`;

export const Card = styled.section`
  border-radius: 24px;
  background: ${({ theme }) => theme.bg3};
  border: 1px solid rgba(151, 151, 151, 0.12);
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  padding: 20px;

  h1,
  h2,
  h3,
  p {
    margin-top: 0;
  }

  h1 {
    font-size: clamp(1.8rem, 4vw, 2.45rem);
    line-height: 1;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 1.15rem;
    margin-bottom: 12px;
  }

  p {
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

export const ImportHeroCard = styled(Card)`
  min-height: 280px;
  padding: 22px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 18px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 5px;
    background: linear-gradient(90deg, #10b981, #3b82f6, #ef4444);
  }

  .hero-title {
    display: grid;
    gap: 8px;

    h1 {
      margin-bottom: 0;
    }

    p {
      max-width: 46rem;
      margin-bottom: 0;
    }
  }
`;

export const UploadZone = styled.div`
  min-height: 150px;
  border: 1px dashed rgba(151, 151, 151, 0.35);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0)),
    ${({ theme }) => theme.bgAlpha};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  padding: 18px;

  .upload-icon {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: rgba(59, 130, 246, 0.14);
    color: #3b82f6;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .upload-copy {
    display: grid;
    gap: 4px;
    min-width: 0;

    strong {
      font-size: 1.06rem;
    }

    span {
      color: ${({ theme }) => theme.colorSubtitle};
      line-height: 1.35;
    }
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const StatusPanel = styled(Card)`
  padding: 18px;
  display: grid;
  align-content: start;
  gap: 14px;

  .status-heading {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .status-kicker {
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .status-title {
    margin: 4px 0 0;
    font-size: 1.18rem;
    line-height: 1.15;
  }

  .status-icon {
    width: 44px;
    height: 44px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.bgAlpha};
    color: ${({ theme }) => theme.primary};
    flex: 0 0 auto;
  }

  .status-note {
    margin: 0;
    font-size: 0.92rem;
  }
`;

export const HealthBadge = styled.div<{ $state: 'empty' | 'ready' | 'issues' }>`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  background: ${({ $state }) =>
    $state === 'ready' ? 'rgba(16, 185, 129, 0.14)' : $state === 'issues' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(59, 130, 246, 0.12)'};
  color: ${({ $state }) => ($state === 'ready' ? '#10b981' : $state === 'issues' ? '#ef4444' : '#3b82f6')};
`;

export const StepList = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  max-width: 680px;

  &::before {
    content: "";
    position: absolute;
    left: 18px;
    right: 18px;
    top: 20px;
    height: 2px;
    background: rgba(151, 151, 151, 0.18);
    pointer-events: none;
  }

  button {
    position: relative;
    z-index: 1;
    border: 1px solid rgba(151, 151, 151, 0.14);
    border-radius: 16px;
    min-height: 42px;
    padding: 7px 10px 7px 7px;
    font-weight: 800;
    color: ${({ theme }) => theme.colorSubtitle};
    background: ${({ theme }) => theme.bg3};
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 9px;
    text-align: left;
    min-width: 0;
    transition: transform 0.2s ease, background-color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      background: ${({ theme }) => theme.bgAlpha};
      color: ${({ theme }) => theme.text};
    }

    > span:last-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.88rem;
    }
  }

  .step-index {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    background: ${({ theme }) => theme.bgAlpha};
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.86rem;
    line-height: 1;
  }

  .active {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.34);
    color: ${({ theme }) => theme.text};
    box-shadow: 0 10px 24px rgba(59, 130, 246, 0.1);

    .step-index {
      background: ${({ theme }) => theme.primary};
      color: #ffffff;
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;

    &::before {
      display: none;
    }
  }
`;

export const ActionRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  button {
    border: none;
    border-radius: 18px;
    min-height: 44px;
    padding: 10px 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s ease, filter 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.02);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.62;
    }
  }

  .primary {
    background: ${({ theme }) => theme.primary};
    color: white;
  }

  .secondary {
    background: ${({ theme }) => theme.bg4};
    color: ${({ theme }) => theme.text};
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
  gap: 12px;
`;

export const StatCard = styled.div<StatCardProps>`
  min-width: 0;
  border-radius: 20px;
  padding: 15px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0)),
    ${({ theme }) => theme.bg3};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'success'
        ? 'rgba(16, 185, 129, 0.22)'
        : $tone === 'warning'
          ? 'rgba(239, 68, 68, 0.22)'
          : $tone === 'transfer'
            ? 'rgba(59, 130, 246, 0.24)'
            : 'rgba(151, 151, 151, 0.12)'};
  box-shadow: 0 14px 28px rgba(18, 47, 79, 0.06);
  display: grid;
  gap: 9px;

  span {
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    font-size: 1.65rem;
    line-height: 1;
    color: ${({ $tone, theme }) =>
      $tone === 'success' ? '#10b981' : $tone === 'warning' ? '#ef4444' : $tone === 'transfer' ? '#3b82f6' : theme.text};
  }

  small {
    color: ${({ theme }) => theme.colorSubtitle};
    line-height: 1.3;
  }
`;

export const ErrorList = styled.ul`
  margin: 12px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 6px;

  li {
    color: ${({ theme }) => theme.text};
    line-height: 1.35;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;

  h2,
  p {
    margin-bottom: 0;
  }

  @media (max-width: 640px) {
    display: grid;
  }
`;

export const PreviewTableWrap = styled.div`
  overflow: auto;
  border-radius: 18px;
  border: 1px solid rgba(151, 151, 151, 0.12);

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }

  th,
  td {
    padding: 11px 12px;
    border-bottom: 1px solid rgba(151, 151, 151, 0.12);
    text-align: left;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  th {
    background: ${({ theme }) => theme.bgAlpha};
    font-weight: 700;
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.bgAlpha};
    }
  }
`;

export const TypeChip = styled.span<ChipProps>`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  background: ${({ $kind }) =>
    $kind === 'i' ? 'rgba(16, 185, 129, 0.14)' : $kind === 'g' ? 'rgba(239, 68, 68, 0.14)' : $kind === 't' ? 'rgba(59, 130, 246, 0.14)' : 'rgba(151, 151, 151, 0.16)'};
  color: ${({ $kind }) => ($kind === 'i' ? '#10b981' : $kind === 'g' ? '#ef4444' : $kind === 't' ? '#3b82f6' : 'inherit')};
`;

export const GroupCard = styled.div`
  border: 1px solid rgba(151, 151, 151, 0.12);
  border-radius: 18px;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.5fr) auto;
  gap: 12px;
  align-items: center;
  background: ${({ theme }) => theme.bgAlpha};

  p {
    margin-bottom: 0;
    font-size: 0.92rem;
  }

  select {
    border-radius: 10px;
    border: 1px solid rgba(151, 151, 151, 0.18);
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    padding: 8px 10px;
    min-height: 42px;
  }

  ${ActionRow} {
    margin-top: 0;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const ProgressBar = styled.div`
  margin-top: 12px;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.bg4};
  overflow: hidden;

  > div {
    height: 100%;
    background: ${({ theme }) => theme.primary};
  }
`;
