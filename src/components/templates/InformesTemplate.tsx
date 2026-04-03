import styled from "styled-components";
import { CalendarioLineal, Header, Tabs, ContentFiltros, Btndesplegable, ListaMenuDesplegable, DataDesplegableMovimientos, useOperaciones, Tipo, useMovimientosStore, useUsuariosStore, v } from "../../index";
import { JSX, useState } from "react";
import { downloadJson } from "../../utils/export/downloadUtils";
import { exportToExcel } from "../../utils/export/excelExport";
import { exportToPdf } from "../../utils/export/pdfExport";
export const InformesTemplate = (): JSX.Element => {
  const {
    setTipoMovimientos,
    selectTipoMovimiento: tipo,
    date,
  } = useOperaciones();
  const { idusuario } = useUsuariosStore();
  const { rptMovimientosAñoMesJson, mostrarMovimientos } = useMovimientosStore();
  const [stateTipo, setStateTipo] = useState<boolean>(false);
  const [state, setState] = useState<boolean>(false);
  const [exporting, setExporting] = useState<'json' | 'excel' | 'pdf' | null>(null);
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

  const handleExportJson = async (): Promise<void> => {
    setExporting('json');
    try {
      const data = await rptMovimientosAñoMesJson(getParams());
      if (data) {
        downloadJson(data, `informe-${getPeriodo()}.json`);
      }
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting('excel');
    try {
      const data = await mostrarMovimientos(getParams());
      await exportToExcel(data, `informe-${getPeriodo()}.xlsx`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async (): Promise<void> => {
    setExporting('pdf');
    try {
      const data = await mostrarMovimientos(getParams());
      exportToPdf({
        titulo: `Informe ${tipo.text}`,
        periodo: getPeriodo(),
        data,
        filename: `informe-${getPeriodo()}.pdf`,
      });
    } finally {
      setExporting(null);
    }
  };

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
            disabled={exporting !== null}
            title="Exportar JSON"
          >
            <v.iconocalculadora />
            {exporting === 'json' ? '...' : 'JSON'}
          </button>
          <button
            className="export-btn excel"
            onClick={() => { void handleExportExcel(); }}
            disabled={exporting !== null}
            title="Exportar Excel"
          >
            <v.iconobarsh />
            {exporting === 'excel' ? '...' : 'Excel'}
          </button>
          <button
            className="export-btn pdf"
            onClick={() => { void handleExportPdf(); }}
            disabled={exporting !== null}
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
