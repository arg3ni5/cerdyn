import styled from "styled-components";
export const ContentHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: space-between;
  gap: 16px;

  .header-main {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
    flex: 1;
  }

  .page-heading {
    display: grid;
    gap: 8px;
    min-width: 0;
  }

  .page-eyebrow {
    color: ${({ theme }) => theme.primary};
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    line-height: 1;
    text-transform: uppercase;
  }

  .page-title {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 900;
    line-height: 1;
    color: ${({ theme }) => theme.text};
    min-width: 0;
    text-wrap: balance;
  }

  .header-actions {
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .header-actions .wrapper {
    width: auto;
  }

  .header-actions .wrapper header {
    padding: 0;
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 8px;

    .header-main {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .header-actions,
    .header-actions .wrapper {
      width: 100%;
    }

    .header-actions .wrapper {
      justify-content: flex-start;
    }
  }
`;
