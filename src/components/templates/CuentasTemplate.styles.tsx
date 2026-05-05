import styled from "styled-components";

export const Container = styled.div`
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
    "total-summary" auto
    "tipo" auto
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

  .hero-copy {
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
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.primary};
  }

  .hero-side-card {
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

    .type-badge {
      width: fit-content;
      margin-top: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(23, 35, 53, 0.08);
      font-weight: 800;
    }
  }

  .total-summary {
    grid-area: total-summary;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;

    .total-card {
      background: linear-gradient(135deg, #1f6fd7 0%, #55a5ff 100%);
      color: white;
      padding: 1.6rem 2rem;
      border-radius: 22px;
      box-shadow: 0 14px 28px rgba(32, 92, 171, 0.25);
      width: 100%;
      max-width: 460px;
      text-align: center;

      h2 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        opacity: 0.92;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .total-amount {
        font-size: clamp(2rem, 4vw, 2.6rem);
        font-weight: 700;
        margin: 0;
      }
    }
  }

  .tipo {
    grid-area: tipo;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.8fr);
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .filter-card,
  .action-card {
    position: relative;
    padding: 22px;
    border-radius: 26px;
    background: ${({ theme }) => theme.bg3};
    box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  }

  .action-card {
    display: grid;
    align-content: start;
    gap: 14px;
  }

  .toolbar-label {
    display: block;
    font-weight: 800;
    font-size: 1rem;
  }

  .toolbar-description {
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colorSubtitle};
  }

  .primary-action {
    border: none;
    border-radius: 18px;
    padding: 14px 18px;
    background: ${({ theme }) => theme.primary};
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    width: fit-content;

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 18px 32px rgba(0, 0, 0, 0.12);
      filter: brightness(1.03);
    }
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
    padding: 0.5rem 0 1rem;

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.1rem;
    }

    .account-card {
      background: ${({ theme }) => theme.bg3};
      padding: 1.1rem;
      border-radius: 22px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      border: 1px solid rgba(151, 151, 151, 0.12);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 32px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.85rem;
      }

      .card-header-copy {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
      }

      .icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: ${({ theme }) => theme.bgAlpha};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
      }

      h3 {
        margin: 0;
        font-size: 1.05rem;
      }

      small {
        color: ${({ theme }) => theme.colorSubtitle};
      }

      .open-indicator {
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: ${({ theme }) => theme.primary};
      }

      .card-body {
        display: grid;
        gap: 4px;
      }

      .balance {
        font-size: 1.45rem;
        font-weight: 700;
        margin: 0.5rem 0 0;
      }

      .balance-label {
        color: ${({ theme }) => theme.colorSubtitle};
        font-size: 0.92rem;
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1.1rem;

        button {
          background: ${({ theme }) => theme.bgAlpha};
          border: none;
          cursor: pointer;
          width: 34px;
          height: 34px;
          padding: 0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, transform 0.2s ease;

          &:hover {
            background: ${({ theme }) => theme.bg4};
            transform: translateY(-1px);
          }

          &:disabled {
            cursor: wait;
            opacity: 0.65;
            transform: none;
          }
        }

        .recalculate-action:disabled svg {
          animation: spin 0.9s linear infinite;
        }
      }
    }

    .empty-state {
      min-height: 320px;
      display: grid;
      place-items: center;
    }

    .empty-card {
      width: min(560px, 100%);
      padding: 32px 24px;
      border-radius: 28px;
      background: ${({ theme }) => theme.bg3};
      box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
      text-align: center;

      h2 {
        margin: 0 0 10px;
        font-size: 1.7rem;
      }

      p {
        margin: 0;
        color: ${({ theme }) => theme.colorSubtitle};
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const ContentFiltro = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: fit-content;
  margin-top: 14px;
`;
