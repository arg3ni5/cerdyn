import styled from "styled-components";
import { MdOutlineNavigateNext, MdArrowBackIos } from "react-icons/md";
import { JSX } from "react";
import { ConvertirCapitalize, useOperaciones } from "../../index";
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export const CalendarioLineal = (): JSX.Element => {
  const { colorCategoria, setToday, date, addMonth, substractMonth } = useOperaciones();

  return (
    <Container className="wrapper" $colortext={colorCategoria}>
      <header>

        <div className="subcontainer">
          <span onClick={substractMonth} className="atras">
            <MdArrowBackIos />
          </span>
          <section className="contentValue">
            <p onClick={setToday}>{ConvertirCapitalize(date.format('MMMM YYYY'))}</p>
          </section>

          <span onClick={addMonth} className="adelante">
            <MdOutlineNavigateNext />
          </span>
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
  border-radius: 10px;
  height: 100%;
  display: flex;
  justify-content: center;
  header {
    display: flex;
    align-items: center;
    padding: 25px 30px 10px;
    justify-content: space-between;
    height: 100%;

    .subcontainer {

      display: flex;
      color: ${(props) => props.$colortext};
      align-items: center;
      justify-content: center;

      .contentValue {
        border: 2px solid ${(props) => props.$colortext};
        border-radius: 30px;
        text-align: center;
        display: flex;
        align-items: center;
        padding: 10px;
      }
      .atras {
        cursor: pointer;
        margin-left: 20px;
        svg {
          width: 30px;
          height: 30px;
        }
      }
      .adelante {
        cursor: pointer;
          margin-right:20px;
        svg {
          width: 45px;
          height: 45px;
        }
      }
    }
    .current-date {
      font-size: 1.45rem;
      font-weight: 500;
    }
  }
`;
