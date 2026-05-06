import styled from "styled-components";
import { CalendarioLineal, Header, Tabs, Btndesplegable, ListaMenuDesplegable, DataDesplegableMovimientos, useOperaciones, Tipo, useUsuariosStore, v, DataMovimientos, MovimientosMesAnioAll, useMovimientosStore, SpinnerLoader, useCuentaStore, Cuenta, DataRptMovimientosAñoMes, Selector, ListaGenerica } from "../../index";
import { JSX, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { downloadJson } from "../../utils/export/downloadUtils";
import { exportToExcel } from "../../utils/export/excelExport";
import { exportToPdf } from "../../utils/export/pdfExport";
import { logger } from "../../utils/logger";
import { showErrorMessage } from "../../utils/sweetAlertUtils";

const MIN_LOADING_TIME_MS = 500;

export const InformesTemplate = (): JSX.Element => {
  const {
    setTipoMovimientos,
    selectTipoMovimiento: tipo,
    date,
  } = useOperaciones();
  const { idusuario, usuario } = useUsuariosStore();
  const { datamovimientos, mostrarMovimientos } = useMovimientosStore();
  const { mostrarCuentas } = useCuentaStore();
  const [stateTipo, setStateTipo] = useState<boolean>(false);
  const [stateCuenta, setStateCuenta] = useState<boolean>(false);
  const [state, setState] = useState<boolean>(false);
  const [cuentaSeleccionadaId, setCuentaSeleccionadaId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<'json' | 'excel' | 'pdf' | null>(null);
  const [showMinimumLoading, setShowMinimumLoading] = useState<boolean>(true);
  const openTipo = (): void => {
    setStateTipo(!stateTipo);
    setStateCuenta(false);
    setState(false);
  };
  const cambiarTipo = (p: Tipo): void => {
    setTipoMovimientos(p);
    setStateTipo(!stateTipo);
    setStateCuenta(false);
    setState(false);
  };
  const toggleCuenta = (): void => {
    setStateCuenta(!stateCuenta);
    setStateTipo(false);
    setState(false);
  };

  const getPeriodo = (): string =>
    `${date.year()}-${String(date.month() + 1).padStart(2, '0')}`;

  const getParams = () => ({
    anio: date.year(),
    mes: date.month() + 1,
    iduser: idusuario,
    tipocategoria: tipo.tipo,
    p_idcuenta: cuentaSeleccionadaId,
  });

  const { data: cuentas = [], isLoading: isLoadingCuentas } = useQuery<Cuenta[], Error>({
    queryKey: ['cuentas informes', idusuario],
    queryFn: async () => await mostrarCuentas({ idusuario } as Cuenta) || [],
    enabled: !!idusuario,
  });
  const cuentaSeleccionada = cuentas.find((cuenta) => cuenta.id === cuentaSeleccionadaId);
  const cuentasFiltro = [
    { id: null, descripcion: 'Todas', icono: '' },
    ...cuentas.map((cuenta) => ({
      ...cuenta,
      descripcion: cuenta.descripcion || '',
      icono: cuenta.icono || '',
    })),
  ];

  const { isLoading: isLoadingMovimientos, error: errorMovimientos } = useQuery<DataMovimientos, Error>({
    queryKey: ['movimientos informes', tipo.tipo, idusuario, date.format('YYYY-MM'), cuentaSeleccionadaId],
    queryFn: () => mostrarMovimientos(getParams()),
    enabled: !!idusuario && !!tipo?.tipo,
  });

  useEffect(() => {
    setShowMinimumLoading(true);
    const timeoutId = window.setTimeout(() => {
      setShowMinimumLoading(false);
    }, MIN_LOADING_TIME_MS);

    return () => window.clearTimeout(timeoutId);
  }, [tipo.tipo, idusuario, date, cuentaSeleccionadaId]);

  const getCuentaExport = (tipoMovimiento: 'i' | 'g' | 't', item: DataMovimientos['i'][number]): string => {
    if (tipoMovimiento === 't') {
      const origen = item.cuenta_origen || '';
      const destino = item.cuenta_destino || '';
      return origen || destino ? `${origen} -> ${destino}` : item.cuenta ?? '';
    }

    return item.cuenta ?? '';
  };

  const getDataForExport = (): DataMovimientos => {
    const tipoActivo = tipo.tipo;

    return {
      i: tipoActivo === 'i' || tipoActivo === 'b' ? datamovimientos?.i || [] : [],
      g: tipoActivo === 'g' || tipoActivo === 'b' ? datamovimientos?.g || [] : [],
      t: tipoActivo === 't' || tipoActivo === 'b' ? datamovimientos?.t || [] : [],
    };
  };

  const reportData = useMemo(() => getDataForExport(), [datamovimientos, tipo.tipo]);

  const reportSummary = useMemo(() => {
    const ingresos = reportData.i || [];
    const gastos = reportData.g || [];
    const transferencias = reportData.t || [];
    const sum = (items: DataMovimientos['i']): number =>
      items.reduce((total, item) => total + Number(item.valor || 0), 0);

    return {
      totalIngresos: sum(ingresos),
      totalGastos: sum(gastos),
      totalTransferencias: sum(transferencias),
      totalRegistros: ingresos.length + gastos.length + transferencias.length,
    };
  }, [reportData]);

  const hasReportRows = reportSummary.totalRegistros > 0;

  const formatCurrency = (valor: number): string =>
    `${usuario?.moneda || '$'} ${new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 0,
    }).format(valor)}`;

  const getRowsForJsonExport = (): MovimientosMesAnioAll => {
    const data = reportData;
    const rows: MovimientosMesAnioAll = [];

    (['i', 'g', 't'] as const).forEach((tipoMovimiento) => {
      (data[tipoMovimiento] || []).forEach((item) => {
        rows.push({
          id: item.id,
          fecha: item.fecha,
          descripcion: item.descripcion,
          cuenta: getCuentaExport(tipoMovimiento, item),
          categoria: tipoMovimiento === 't' ? 'Transferencia' : item.categoria,
          tipocategoria: tipoMovimiento,
          estado: item.estado,
          monto: item.valor,
          idcuenta_origen: item.idcuenta_origen,
          cuenta_origen: item.cuenta_origen,
          idcuenta_destino: item.idcuenta_destino,
          cuenta_destino: item.cuenta_destino,
        });
      });
    });

    return rows.sort((a, b) => b.fecha.localeCompare(a.fecha));
  };

  const getChartDataForCuenta = (): DataRptMovimientosAñoMes | null => {
    if (cuentaSeleccionadaId == null) return null;

    const groupByCategoria = (items: DataMovimientos['i']): DataRptMovimientosAñoMes['i'] => {
      const grouped = new Map<string, { total: number; descripcion: string; icono: string; color: string }>();

      items.forEach((item) => {
        const descripcion = item.categoria || 'Sin categoría';
        const current = grouped.get(descripcion) || {
          total: 0,
          descripcion,
          icono: '',
          color: '',
        };

        current.total += Number(item.valor || 0);
        grouped.set(descripcion, current);
      });

      return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
    };

    return {
      i: groupByCategoria(datamovimientos?.i || []),
      g: groupByCategoria(datamovimientos?.g || []),
    };
  };

  const handleExportJson = async (): Promise<void> => {
    setExporting('json');
    try {
      downloadJson(getRowsForJsonExport(), `informe-${getPeriodo()}.json`);
    } catch (error) {
      logger.error('Error al exportar JSON', { error });
      showErrorMessage('No se pudo exportar el informe en formato JSON.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting('excel');
    try {
      await exportToExcel(reportData, `informe-${getPeriodo()}.xlsx`);
    } catch (error) {
      logger.error('Error al exportar Excel', { error });
      showErrorMessage('No se pudo exportar el informe en formato Excel.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async (): Promise<void> => {
    setExporting('pdf');
    try {
      exportToPdf({
        titulo: `Informe ${tipo.text}`,
        periodo: getPeriodo(),
        data: reportData,
        filename: `informe-${getPeriodo()}.pdf`,
      });
    } catch (error) {
      logger.error('Error al exportar PDF', { error });
      showErrorMessage('No se pudo exportar el informe en formato PDF.');
    } finally {
      setExporting(null);
    }
  };

  const exportDisabled = exporting !== null || isLoadingMovimientos || isLoadingCuentas || !idusuario || !hasReportRows;

  if (showMinimumLoading || isLoadingMovimientos || isLoadingCuentas || !idusuario) {
    return <SpinnerLoader />;
  }

  if (errorMovimientos) {
    logger.error('Error al cargar movimientos en Informes', { error: errorMovimientos });
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error al cargar los informes</h2>
        <p>{errorMovimientos.message}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>Por favor, recarga la página o intenta más tarde</p>
      </div>
    );
  }

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
          eyebrow="Informes"
          title={tipo.text}
          actions={<CalendarioLineal />}
        />
      </header>
      <section className="area1">
        <FilterToolbar>
          <FilterGroup>
            <span className="filter-label">Tipo</span>
            <div
              className="tipo-filter"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Btndesplegable
                textcolor={tipo.color}
                bgcolor={tipo.bgcolor}
                text={tipo.text}
                funcion={openTipo}
              />
              {stateTipo && (
                <ListaMenuDesplegable
                  data={DataDesplegableMovimientos}
                  top="112%"
                  funcion={(p) => cambiarTipo(p as Tipo)}
                />
              )}
            </div>
          </FilterGroup>
          <CuentaFilter $active={stateCuenta}>
            <label>Cuenta</label>
            <Selector
              color="#9955ff"
              state={stateCuenta}
              texto1={cuentaSeleccionada?.icono || ''}
              texto2={cuentaSeleccionada?.descripcion || 'Todas'}
              funcion={toggleCuenta}
            />
            {stateCuenta && (
              <div className="cuenta-list">
                <ListaGenerica
                  placement="down"
                  mobilePlacement="down"
                  scroll="auto"
                  filterable
                  filterPlaceholder="Buscar cuenta..."
                  emptyMessage="No hay cuentas que coincidan."
                  filterBy={["descripcion"]}
                  minItemsToFilter={4}
                  setState={() => setStateCuenta(false)}
                  data={cuentasFiltro}
                  funcion={(item) => {
                    setCuentaSeleccionadaId(item.id == null ? null : Number(item.id));
                  }}
                />
              </div>
            )}
          </CuentaFilter>
        </FilterToolbar>
        <ExportButtons>
          <button
            className="export-btn json"
            onClick={() => { void handleExportJson(); }}
            disabled={exportDisabled}
            title="Exportar JSON"
          >
            <v.iconocalculadora />
            {exporting === 'json' ? '...' : 'JSON'}
          </button>
          <button
            className="export-btn excel"
            onClick={() => { void handleExportExcel(); }}
            disabled={exportDisabled}
            title="Exportar Excel"
          >
            <v.iconobarsh />
            {exporting === 'excel' ? '...' : 'Excel'}
          </button>
          <button
            className="export-btn pdf"
            onClick={() => { void handleExportPdf(); }}
            disabled={exportDisabled}
            title="Exportar PDF"
          >
            <v.iconopie />
            {exporting === 'pdf' ? '...' : 'PDF'}
          </button>
        </ExportButtons>
      </section>
      <SummaryGrid aria-label="Resumen del informe">
        <SummaryCard $tone="income">
          <span>Ingresos</span>
          <strong>{formatCurrency(reportSummary.totalIngresos)}</strong>
        </SummaryCard>
        <SummaryCard $tone="expense">
          <span>Gastos</span>
          <strong>{formatCurrency(reportSummary.totalGastos)}</strong>
        </SummaryCard>
        <SummaryCard $tone="transfer">
          <span>Transferencias</span>
          <strong>{formatCurrency(reportSummary.totalTransferencias)}</strong>
        </SummaryCard>
        <SummaryCard $tone="count">
          <span>Registros</span>
          <strong>{reportSummary.totalRegistros}</strong>
        </SummaryCard>
      </SummaryGrid>
      <section className="main">
        {hasReportRows ? (
          <Tabs dataOverride={getChartDataForCuenta()} />
        ) : (
          <EmptyState>
            <strong>No hay movimientos para este filtro</strong>
            <span>Cambia el mes, el tipo o la cuenta para ver datos y habilitar la exportación.</span>
          </EmptyState>
        )}
      </section>
    </Container>
  );
}
const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  grid-template:
    "header" 100px
    "area1" auto
    "summary" auto
    "main" auto;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
    margin-left: 15px;

    @media (max-width: 640px) {
      margin-left: 0;
    }
  }
  .area1 {
    grid-area: area1;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    padding-bottom: 18px;
  }
  .main {
    grid-area: main;
  }
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;

  .export-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.json {
      background: ${({ theme }) => theme.bg};
      color: ${({ theme }) => theme.text};
      border: 1.5px solid #9955ff;
    }

    &.excel {
      background: #22863a;
      color: #fff;
    }

    &.pdf {
      background: #e53935;
      color: #fff;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const FilterToolbar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.text}12;
  border-radius: 22px;
  background: ${({ theme }) => theme.bg}cc;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);

  @media (max-width: 620px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const FilterGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;

  .filter-label {
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.72rem;
    font-weight: 800;
    padding-left: 13px;
  }

  .tipo-filter > div:first-child {
    min-height: 40px;
    padding: 0.55rem 1.05rem;
    font-size: 15px;
    border-radius: 16px;
  }

  .tipo-filter h6 {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1;
  }
`;

const CuentaFilter = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 210px;

  label {
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.72rem;
    font-weight: 800;
    padding-left: 13px;
  }

  > div:first-of-type {
    min-height: 40px;
    border-radius: 16px;
    border-color: ${({ $active }) => $active ? '#9955ff' : '#9955ff'};
    box-shadow: ${({ $active }) => $active ? '0 0 0 3px rgba(153, 85, 255, 0.14)' : '4px 9px 20px -12px #9955ff'};
    background: ${({ theme }) => theme.bgAlpha || theme.bg};
    padding: 8px 12px;
  }

  > div:first-of-type:hover {
    background: #9955ff;
    color: #fff;
  }

  > div:first-of-type > div {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  > div:first-of-type > div span:first-child {
    flex: 0 0 auto;
    line-height: 1;
  }

  > div:first-of-type > div span:last-child {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }

  .cuenta-list {
    position: relative;
  }

  .cuenta-list > div {
    width: 100%;
    min-width: 260px;
  }
`;

const SummaryGrid = styled.section`
  grid-area: summary;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin: 0 0 18px;
`;

const SummaryCard = styled.article<{ $tone: 'income' | 'expense' | 'transfer' | 'count' }>`
  border-radius: 20px;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ $tone }) => {
    const colors = {
      income: '#22c55e',
      expense: '#ef4444',
      transfer: '#9955ff',
      count: '#0ea5e9',
    };
    return colors[$tone];
  }}33;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.08);

  span {
    display: block;
    color: ${({ theme }) => theme.colorSubtitle};
    font-size: 0.78rem;
    font-weight: 800;
    margin-bottom: 8px;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.text};
    font-size: clamp(1.15rem, 2vw, 1.55rem);
    line-height: 1.15;
  }
`;

const EmptyState = styled.div`
  width: min(100%, 760px);
  margin: 32px auto;
  padding: 34px 24px;
  border: 1px dashed #9955ff66;
  border-radius: 26px;
  background: ${({ theme }) => theme.bg}cc;
  color: ${({ theme }) => theme.text};
  text-align: center;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.08);

  strong {
    display: block;
    font-size: clamp(1.2rem, 2vw, 1.6rem);
    margin-bottom: 8px;
  }

  span {
    color: ${({ theme }) => theme.colorSubtitle};
    display: block;
    line-height: 1.5;
  }
`;
