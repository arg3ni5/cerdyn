import styled from "styled-components";
import { CalendarioLineal, Header, Tabs, ContentFiltros, Btndesplegable, ListaMenuDesplegable, DataDesplegableMovimientos, useOperaciones, Tipo, useUsuariosStore, v, DataMovimientos, MovimientosMesAnioAll, useMovimientosStore, SpinnerLoader } from "../../index";
import { JSX, useEffect, useState } from "react";
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
  const { idusuario } = useUsuariosStore();
  const { datamovimientos, mostrarMovimientos } = useMovimientosStore();
  const [stateTipo, setStateTipo] = useState<boolean>(false);
  const [state, setState] = useState<boolean>(false);
  const [exporting, setExporting] = useState<'json' | 'excel' | 'pdf' | null>(null);
  const [showMinimumLoading, setShowMinimumLoading] = useState<boolean>(true);
  const openTipo = (): void => {
    setStateTipo(!stateTipo);
    setState(false);
  };
  const cambiarTipo = (p: Tipo): void => {
    setTipoMovimientos(p);
    setStateTipo(!stateTipo);
    setState(false);
  };

  const getPeriodo = (): string =>
    `${date.year()}-${String(date.month() + 1).padStart(2, '0')}`;

  const getParams = () => ({
    anio: date.year(),
    mes: date.month() + 1,
    iduser: idusuario,
    tipocategoria: tipo.tipo,
  });

  const { isLoading: isLoadingMovimientos, error: errorMovimientos } = useQuery<DataMovimientos, Error>({
    queryKey: ['movimientos informes', tipo.tipo, idusuario, date.format('YYYY-MM')],
    queryFn: () => mostrarMovimientos(getParams()),
    enabled: !!idusuario && !!tipo?.tipo,
  });

  useEffect(() => {
    setShowMinimumLoading(true);
    const timeoutId = window.setTimeout(() => {
      setShowMinimumLoading(false);
    }, MIN_LOADING_TIME_MS);

    return () => window.clearTimeout(timeoutId);
  }, [tipo.tipo, idusuario, date]);

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

  const getRowsForJsonExport = (): MovimientosMesAnioAll => {
    const data = getDataForExport();
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
        });
      });
    });

    return rows.sort((a, b) => b.fecha.localeCompare(a.fecha));
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
      await exportToExcel(getDataForExport(), `informe-${getPeriodo()}.xlsx`);
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
        data: getDataForExport(),
        filename: `informe-${getPeriodo()}.pdf`,
      });
    } catch (error) {
      logger.error('Error al exportar PDF', { error });
      showErrorMessage('No se pudo exportar el informe en formato PDF.');
    } finally {
      setExporting(null);
    }
  };

  const exportDisabled = exporting !== null || isLoadingMovimientos || !idusuario;

  if (showMinimumLoading || isLoadingMovimientos || !idusuario) {
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
        />
      </header>
      <section className="area1">
        <ContentFiltros>
          <div
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
        </ContentFiltros>
        <h1>Informes</h1>
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
      <section className="area2">
        <CalendarioLineal/>
      </section>
      <section className="main">
        <Tabs />
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
    "area1" 100px
    "area2" 70px
    "main" auto;

  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
  .area1 {
    grid-area: area1;
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }
  .area2 {
    grid-area: area2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
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
