import { JSX, useMemo, useState } from "react";
import React from "react";
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
import { v } from "../../../styles/variables";
import { convertToMovimiento } from "../../../supabase/crudMovimientos";
import { ConfirmDialog } from "../../moleculas/ConfirmDialog";
import { AnimatePresence } from "motion/react";

interface TablaTransferenciasProps {
  titulo?: string;
  tipo: Tipo;
  color: string;
  data: MovimientosMesAnio | null;
  setOpenRegistro: (value: boolean) => void;
  setDataSelect: (data: Movimiento) => void;
  setAccion: (value: Accion) => void;
}

export const TablaTransferencias = ({
  titulo,
  tipo,
  color,
  data,
  setOpenRegistro,
  setDataSelect,
  setAccion,
}: TablaTransferenciasProps): JSX.Element | null => {
  const [pagina, setPagina] = useState<number>(1);
  const [pendingDelete, setPendingDelete] = useState<Movimiento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { eliminarMovimiento } = useMovimientosStore();
  const porPagina = 10;

  const groupedData = useMemo(() => {
    const grupos: { [key: string]: MovimientosMesAnio } = {};

    (data || []).forEach((item) => {
      if (!grupos[item.fecha]) {
        grupos[item.fecha] = [];
      }
      grupos[item.fecha].push(item);
    });

    return Object.entries(grupos)
      .map(([fecha, movimientos]) => ({ fecha, movimientos }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [data]);

  if (data == null) {
    return null;
  }

  const maximo = Math.max(1, groupedData.length / porPagina);

  const esPagado = (estado: unknown): boolean => {
    if (typeof estado === "boolean") return estado;
    if (typeof estado === "number") return estado === 1;
    if (typeof estado === "string") {
      const valor = estado.trim().toLowerCase();
      return valor === "1" || valor === "true";
    }
    return false;
  };

  const obtenerCuenta = (item: MovimientosMesAnio[number]): string => {
    return item.cuenta || "-";
  };

  const editar = (item: MovimientosMesAnio[number]): void => {
    setOpenRegistro(true);
    setDataSelect({ ...convertToMovimiento(item), tipo: "t" } as Movimiento);
    setAccion("Editar");
  };

  const toggleEstado = async (item: MovimientosMesAnio[number]): Promise<void> => {
    await useMovimientosStore.getState().actualizarMovimientos({
      id: item.id,
      estado: !esPagado(item.estado),
    });
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await eliminarMovimiento({ id: pendingDelete.id } as Movimiento);
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {pendingDelete && (
          <ConfirmDialog
            title="¿Eliminar transferencia?"
            message="Una vez eliminada, no podrá recuperar este registro."
            confirmText="Sí, eliminar"
            onConfirm={handleConfirmDelete}
            onCancel={() => setPendingDelete(null)}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>

      <Container $color={tipo.color || ""}>
        {titulo && <h3>{titulo}</h3>}
        <div className="table-wrapper">
          <table className="responsive-table">
            <thead>
              <tr>
                <th scope="col">Pagado</th>
                <th scope="col">Descripción</th>
                <th scope="col">Cuenta</th>
                <th scope="col">Valor</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {groupedData
                .slice((pagina - 1) * porPagina, (pagina - 1) * porPagina + porPagina)
                .map((group, groupIndex) => (
                  <React.Fragment key={`transfer-group-${groupIndex}`}>
                    <tr className="group-header">
                      <td colSpan={5}>
                        <FechaHeader>
                          {(() => {
                            const [anio, mes, dia] = group.fecha.split("-").map(Number);
                            const date = new Date(anio, mes - 1, dia);
                            return date.toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                          })()}
                        </FechaHeader>
                      </td>
                    </tr>
                    {group.movimientos.map((item) => {
                      return (
                        <tr key={item.id}>
                          <th scope="row">
                            <span className="status-label">Estado</span>
                            <Pagado
                              $bgcolor={esPagado(item.estado) ? "#69e673" : "#b3b3b3"}
                              onClick={() => toggleEstado(item)}
                              title={esPagado(item.estado) ? "Clic para marcar como pendiente" : "Clic para marcar como pagado"}
                            />
                            <span className="status-text">{esPagado(item.estado) ? "Pagado" : "Pendiente"}</span>
                          </th>
                          <td data-title="Descripción">{item.descripcion || "Transferencia"}</td>
                          <td data-title="Cuenta">{obtenerCuenta(item)}</td>
                          <td data-title="Valor">{item.valorymoneda}</td>
                          <td data-title="Acciones">
                            <ContentAccionesTabla
                              funcionEditar={() => editar(item)}
                              funcionEliminar={() => setPendingDelete(convertToMovimiento(item))}
                            />
                          </td>
                        </tr>
                      );
                    })}
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
};

const Container = styled.div<{ $color: string }>`
  border-radius: 30px;
  width: 100%;
  background: ${({ theme }) => theme.bg3};
  --table-bg-solid: color-mix(in srgb, ${({ $color }) => $color} 14%, ${({ theme }) => theme.bg} 86%);
  box-shadow: 0 18px 36px rgba(18, 47, 79, 0.08);
  border: 1px solid ${({ theme }) => theme.text}10;
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
    scrollbar-color: ${({ theme }) => theme.text}40 transparent;
    scrollbar-width: thin;
  }

  .pagination {
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  .responsive-table {
    width: 100%;
    border-spacing: 0;

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
      }

      th {
        font-size: 0.88rem;
        font-weight: 700;
        text-align: center;
        color: ${({ theme }) => theme.text};
        background-color: var(--table-bg-solid);
        border-bottom: 1px solid rgba(115, 115, 115, 0.2);
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
      padding: 0.55rem 0.9rem;

      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.75em;
        text-align: center;
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
      }
    }

    tbody {
      display: block;
      padding: 0 12px 12px;

      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
        padding: 0;
      }

      tr {
        position: relative;
        margin-bottom: 14px;
        border-radius: 18px;
        background:
          linear-gradient(180deg, ${({ $color }) => hexToRgba($color, 0.08)} 0%, ${({ $color }) => hexToRgba($color, 0.03)} 100%),
          ${({ theme }) => theme.bg};
        border: 1px solid ${({ theme }) => theme.text}14;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.16);
        overflow: hidden;

        &::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 4px;
          background: ${({ $color }) => $color};
          opacity: 0.9;
        }

        @media (min-width: ${v.bpbart}) {
          display: table-row;
          background: transparent;
          border: 0;
          box-shadow: none;
          overflow: visible;

          &::before {
            content: none;
          }
        }

        &.group-header {
          background-color: transparent !important;
          border: 0;
          box-shadow: none;
          overflow: visible;

          &::before {
            content: none;
          }

          td {
            padding: 0 !important;
          }
        }
      }

      th[scope="row"] {
        align-items: center;
        display: flex;
        gap: 10px;
        justify-content: space-between;
        padding: 0.9rem 0.9rem 0.55rem;

        .status-label {
          color: ${({ theme }) => theme.colorSubtitle};
          font-size: 0.78em;
          font-weight: 700;
        }

        .status-text {
          color: ${({ theme }) => theme.text};
          font-size: 0.85em;
          font-weight: 800;
          margin-left: auto;
        }

        @media (min-width: ${v.bpbart}) {
          display: table-cell;
          padding: 0.75em;

          .status-label,
          .status-text {
            display: none;
          }
        }
      }

      td {
        text-align: right;

        @media (min-width: ${v.bpbart}) {
          text-align: center;
        }
      }

      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.78em;
        font-weight: 700;
        color: ${({ theme }) => theme.colorSubtitle};

        @media (min-width: ${v.bpbart}) {
          content: none;
        }
      }
    }
  }
`;

const Pagado = styled.div<{ $bgcolor: string }>`
  display: flex;
  justify-content: center;
  cursor: pointer;

  &::before {
    content: "";
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: ${({ $bgcolor }) => $bgcolor};
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:hover::before {
    transform: scale(1.2);
  }
`;

const FechaHeader = styled.div`
  font-weight: 700;
  font-size: 1em;
  padding: 14px 14px 10px;
  color: ${({ theme }) => theme.text};
  text-transform: capitalize;
  letter-spacing: 0.5px;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.text}10 0%, ${theme.text}05 100%)`};
  border-radius: 14px;
  margin: 10px 12px;
`;
