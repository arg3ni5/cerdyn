import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JSX } from "react";
import { ConvertirCapitalize, useOperaciones } from "../../index";
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export const CalendarioLineal = (): JSX.Element => {
  const { colorCategoria, setToday, date, addMonth, substractMonth } = useOperaciones();

  return (
    <Container className="wrapper" $colortext={colorCategoria}>
      <header>
        <div className="subcontainer">
          <button type="button" onClick={substractMonth} className="atras" aria-label="Mes anterior">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <section className="contentValue">
            <button type="button" onClick={setToday}>
              {ConvertirCapitalize(date.format('MMMM YYYY'))}
            </button>
          </section>

          <button type="button" onClick={addMonth} className="adelante" aria-label="Mes siguiente">
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>
      </header>
    </Container>
  );
};

interface ContainerProps {
  $colortext: string;
}
const Container = styled.div<ContainerProps>`
  width: 100%;
  border-radius: 18px;
  height: 100%;
  display: flex;
  justify-content: center;
  header {
    display: flex;
    align-items: center;
    padding: 18px 24px;
    justify-content: space-between;
    height: 100%;

    .subcontainer {
      display: flex;
      color: ${(props) => props.$colortext};
      align-items: center;
      justify-content: center;
      gap: 12px;

      .contentValue {
        border: 2px solid ${(props) => props.$colortext};
        border-radius: 999px;
        text-align: center;
        display: flex;
        align-items: center;
        padding: 0;

        button {
          border: none;
          background: transparent;
          color: ${(props) => props.$colortext};
          padding: 10px 18px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
        }
      }
      .atras {
        cursor: pointer;
      }
      .adelante {
        cursor: pointer;
      }

      .atras,
      .adelante {
        width: 42px;
        height: 42px;
        border: none;
        border-radius: 999px;
        background: ${({ theme }) => theme.bgAlpha};
        color: ${(props) => props.$colortext};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 0;

        svg {
          display: block;
        }
      }
    }
    .current-date {
      font-size: 1.45rem;
      font-weight: 500;
    }
  }
`;
