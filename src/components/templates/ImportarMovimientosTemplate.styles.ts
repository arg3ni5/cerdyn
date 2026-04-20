import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  gap: 18px;
  grid-template:
    'header' 100px
    'hero' auto
    'panel' auto
    'main' auto;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }

  .hero {
    grid-area: hero;
  }

  .panel {
    grid-area: panel;
  }

  .main {
    grid-area: main;
    display: grid;
    gap: 16px;
  }
`;

export const Card = styled.section`
  border-radius: 24px;
  background: ${({ theme }) => theme.bg3};
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  padding: 20px;
`;

export const StepList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  button {
    border: none;
    border-radius: 999px;
    padding: 8px 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.bg4};
    cursor: pointer;
  }

  .active {
    background: ${({ theme }) => theme.primary};
    color: white;
  }
`;

export const ActionRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  button {
    border: none;
    border-radius: 14px;
    padding: 10px 14px;
    font-weight: 700;
    cursor: pointer;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 14px;

  > div {
    border-radius: 16px;
    padding: 12px;
    background: ${({ theme }) => theme.bgtotal};
  }

  strong {
    display: block;
    font-size: 1.4rem;
    margin-top: 4px;
  }
`;

export const ErrorList = styled.ul`
  margin: 12px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 6px;
`;

export const PreviewTableWrap = styled.div`
  overflow: auto;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.bg4};

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }

  th,
  td {
    padding: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.bg4};
    text-align: left;
    font-size: 0.9rem;
  }

  th {
    background: ${({ theme }) => theme.bgtotal};
    font-weight: 700;
  }
`;

export const GroupCard = styled.div`
  border: 1px solid ${({ theme }) => theme.bg4};
  border-radius: 16px;
  padding: 12px;
  display: grid;
  gap: 10px;

  select {
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.bg4};
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    padding: 8px 10px;
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
