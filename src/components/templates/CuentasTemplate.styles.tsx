import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template:
    "header" 100px
    "total-summary" auto
    "tipo" 100px
    "main" auto;

  .header {
    grid-area: header;
    /* background-color: rgba(103, 93, 241, 0.14); */
    display: flex;
    align-items: center;
  }

  .total-summary {
    grid-area: total-summary;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;

    .total-card {
      background: linear-gradient(135deg, ${({ theme }) => theme.primary || '#667df4'} 0%, ${({ theme }) => theme.primaryLight || '#8b9aff'} 100%);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 400px;
      text-align: center;

      h2 {
        font-size: 1rem;
        font-weight: 500;
        margin: 0 0 0.5rem 0;
        opacity: 0.9;
      }

      .total-amount {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
      }
    }
  }

  .tipo {
    grid-area: tipo;
    /* background-color: rgba(107, 214, 14, 0.14); */
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .area1 {
    grid-area: area1;
    display: flex;
    align-items: center;
    h1 {
      font-size: 2rem;
      margin-left: 1rem;
    }
  }
  /* .area2 eliminada para quitar espacio extra */
  .main {
    grid-area: main;
    padding: 1rem;

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .account-card {
      background: ${({ theme }) => theme.bg};
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .balance {
        font-size: 1.25rem;
        font-weight: 500;
        margin: 0.5rem 0;
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;

        button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;

          &:hover {
            background: ${({ theme }) => theme.bgAlpha};
          }
        }
      }
    }
  }
`;

export const ContentFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
`;