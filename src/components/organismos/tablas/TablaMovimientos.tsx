import styled from "styled-components";
import {
  Accion,
  ContentAccionesTabla,
  hexToRgba,
  Movimiento,
  MovimientosMesAnio,
  Paginacion,
  Tipo,
  useMovimientosStore,
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { JSX, useState, useMemo } from "react";
import React from "react";
import { convertToMovimiento } from '../../../supabase/crudMovimientos';

interface TablaMovimientosProps {
  titulo?: string;
  tipo: Tipo;
  color: string;
  data: MovimientosMesAnio | null;
  setOpenRegistro: (value: boolean) => void;
  setDataSelect: (data: Movimiento) => void;
  setAccion: (value: Accion) => void;
}

export const TablaMovimientos = ({
  titulo,
  tipo,
  color,
  data,
  setOpenRegistro,
  setDataSelect,
  setAccion,
}: TablaMovimientosProps): JSX.Element | null => {
  if (data == null) {
    return null;
  }

  const [pagina, setPagina] = useState<number>(1);
  const porPagina = 10;

  // Agrupar movimientos por fecha
  const groupedData = useMemo(() => {
    const grupos: { [key: string]: typeof data } = {};

    data.forEach((item) => {
      const fecha = item.fecha;
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(item);
    });

    // Convertir a array ordenado por fecha descendiente
    return Object.entries(grupos)
      .map(([fecha, movimientos]) => ({
        fecha,
        movimientos,
      }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [data]);

  const mx = groupedData.length / porPagina;
  const maximo = mx < 1 ? 1 : mx;

  const { eliminarMovimiento } = useMovimientosStore();

  const eliminar = (p: Movimiento): void => {
    Swal.fire({
      title: "¿Estás seguro(a)(e)?",
      text: "Una vez eliminado, ¡no podrá recuperar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarMovimiento({ id: p.id } as Movimiento);
      }
    });
  };

  const editar = (data: Movimiento): void => {
    setOpenRegistro(true);
    setDataSelect({ ...data, tipo: tipo.tipo } as Movimiento);
    setAccion("Editar");
  };

  const esPagado = (estado: unknown): boolean => {
    if (typeof estado === "boolean") return estado;
    if (typeof estado === "number") return estado === 1;
    if (typeof estado === "string") {
      const valor = estado.trim().toLowerCase();
      return valor === "1" || valor === "true";
    }
    return false;
  };

  return (
    <>
      <Container $bgcolor={tipo.bgcolor || ''} $color={tipo.color || ''}>
        {titulo && (<h3>{titulo}</h3>)}
        <div className="table-wrapper">
          <table className="responsive-table">
            <thead>
              <tr>
                <th scope="col">Pagado</th>
                <th scope="col">Descripcion</th>
                <th scope="col">Categoria</th>
                <th scope="col">Cuenta</th>
                <th scope="col">Valor</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
            {groupedData
              .slice(
                (pagina - 1) * porPagina,
                (pagina - 1) * porPagina + porPagina
              )
              .map((group, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  <tr className="group-header">
                    <td colSpan={6}>
                      <FechaHeader>
                        {(() => {
                          const [año, mes, día] = group.fecha.split('-').map(Number);
                          const date = new Date(año, mes - 1, día);
                          return date.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          });
                        })()}
                      </FechaHeader>
                    </td>
                  </tr>
                  {group.movimientos.map((item) => (
                    <tr key={item.id}>
                      <th scope="row">
                        <Pagado
                          $bgcolor={esPagado(item.estado) ? "#69e673" : "#b3b3b3"}
                        ></Pagado>
                      </th>
                      <td data-title="Descripcion">
                        {item.descripcion}
                      </td>
                      <td data-title="Categoria">{item.categoria}</td>
                      <td data-title="Cuenta">{item.cuenta}</td>
                      <td data-title="Monto">{item.valorymoneda}</td>
                      <td data-title="Acciones">
                        <ContentAccionesTabla
                          funcionEditar={() => editar({
                            ...convertToMovimiento(item),
                            cuenta: item.cuenta,
                            categoria: item.categoria,
                          } as Movimiento)}
                          funcionEliminar={() => eliminar(convertToMovimiento(item))}
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">

          {maximo > 1 && <Paginacion pagina={pagina} setPagina={setPagina} maximo={maximo} color={color} />}
        </div>
      </Container>
    </>
  );
}
interface ContainerProps {
  $bgcolor: string;
  $color: string;
}
const Container = styled.div<ContainerProps>`
  border-radius: 30px;
  width: 100%;
  background:
    linear-gradient(180deg, ${({ theme }) => theme.bg3} 0%, ${({ theme }) => theme.bg3} 100%),
    ${(props) => hexToRgba(props.$color, 0.14)};
  --table-bg: ${(props) => hexToRgba(props.$color, 0.14)};
  --table-bg-solid: color-mix(in srgb, ${(props) => props.$color} 14%, ${({ theme }) => theme.bg} 86%);
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  border: 1px solid ${({ theme }) => theme.text}10;

  position: relative;

  margin: 0;
  flex: 1 1 100%;

  h3 {
    margin: 0;
    padding: 18px 22px 8px;
    font-size: 1.15rem;
    font-weight: 800;
  }
  .table-wrapper {
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 0 0 30px 30px;

    /* Estilo del scrollbar */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.text}40;
      border-radius: 4px;

      &:hover {
        background: ${({ theme }) => theme.text}60;
      }
    }

    /* Firefox */
    scrollbar-color: ${({ theme }) => theme.text}40 transparent;
    scrollbar-width: thin;
  }
  .pagination{
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .responsive-table {
    width: 100%;
    margin-bottom: 0;
    border-spacing: 0;
    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }
    @media (min-width: ${v.bpmarge}) {
      font-size: 1em;
    }
    thead {
      position: absolute;

      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
      @media (min-width: ${v.bpbart}) {
        position: sticky;
        top: 0;
        z-index: 2;
        height: auto;
        width: auto;
        overflow: visible;
        background-color: var(--table-bg-solid);
        border-bottom: 2px solid rgba(115, 115, 115, 0.32);
      }
      th {
        border-bottom: 1px solid rgba(115, 115, 115, 0.2);
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-align: center;
        color: ${({ theme }) => theme.text};
        background-color: var(--table-bg-solid);
        &:first-of-type {
          text-align: center;
        }
      }
    }
    tbody,
    tr,
    th,
    td {
      display: block;
      padding: 0;
      text-align: left;
      white-space: normal;
    }
    tr {
      @media (min-width: ${v.bpbart}) {
        display: table-row;
      }
    }

    th,
    td {
      padding: 0.5em;
      vertical-align: middle;
      @media (min-width: ${v.bplisa}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.5em;
      }
      @media (min-width: ${v.bpmarge}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bphomer}) {
        padding: 0.75em;
      }
    }
    tbody {
      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
      }
      tr {
        margin-bottom: 0.9em;
        border-radius: 18px;
        background: ${({ theme }) => theme.bg};
        box-shadow: 0 10px 22px rgba(18, 47, 79, 0.06);
        @media (min-width: ${v.bpbart}) {
          display: table-row;
          border-width: 1px;
          background: transparent;
          box-shadow: none;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
        &.group-header {
          background-color: transparent !important;
          margin-bottom: 0.5em;
          margin-top: 1em;

          @media (min-width: ${v.bpbart}) {
            background-color: transparent !important;
          }

          td {
            padding: 0 !important;
            @media (min-width: ${v.bpbart}) {
              padding: 0 !important;
            }
          }
        }
        &:nth-of-type(even) {
          @media (min-width: ${v.bpbart}) {
            background-color: rgba(151, 151, 151, 0.08);
          }
        }
      }
      th[scope="row"] {
        padding: 1rem 0.9rem 0.45rem;
        @media (min-width: ${v.bplisa}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        }
        @media (min-width: ${v.bpbart}) {
          background-color: transparent;
          text-align: center;
          color: ${({ theme }) => theme.text};
          padding: 0.75em;
        }
      }
      .Colordiv {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80px;
        @media (min-width: ${v.bpbart}) {
          justify-content: center;
        }
      }
      td {
        padding: 0.55rem 0.9rem;
        text-align: right;
        @media (min-width: ${v.bpbart}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
          text-align: center;
        }

      }
      td[data-type="currency"] {
        font-weight:600;
      }
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.78em;
        font-weight: 700;
        color: ${({ theme }) => theme.colorSubtitle};
        @media (min-width: ${v.bplisa}) {
          font-size: 0.9em;
        }
        @media (min-width: ${v.bpbart}) {
          content: none;
        }
      }
    }
  }
`;
interface PagadoProps {
  $bgcolor: string;
}

const Pagado = styled.div<PagadoProps>`
  display: flex;
  justify-content: center;
  &::before {
    content: "";
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${(props) => props.$bgcolor};
  }
`;
const FechaHeader = styled.div`
  font-weight: 700;
  font-size: 1em;
  padding: 14px 14px 10px;
  color: ${({ theme }) => theme.text};
  text-transform: capitalize;
  letter-spacing: 0.5px;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.text}10 0%, ${theme.text}05 100%)`};
  border-radius: 14px;
  margin: 10px 12px;
`;
