import ExcelJS from 'exceljs';
import { downloadBlob } from './downloadUtils';
import type { DataMovimientos } from '../../store/MovimientosStore';

export interface ExcelRow {
  Fecha: string;
  Descripción: string;
  Categoría: string;
  Cuenta: string;
  Valor: number;
  Estado: string;
  Tipo: string;
}

const TIPO_LABELS: Record<string, string> = {
  i: 'Ingreso',
  g: 'Gasto',
  t: 'Transferencia',
};

type MovimientoExportable = DataMovimientos[keyof DataMovimientos][number] & {
  cuenta_origen?: string | null;
  cuenta_destino?: string | null;
};

const getCuenta = (tipo: 'i' | 'g' | 't', item: MovimientoExportable): string => {
  if (tipo === 't') {
    const origen = item.cuenta_origen || '';
    const destino = item.cuenta_destino || '';
    return origen || destino ? `${origen} -> ${destino}` : item.cuenta ?? '';
  }

  return item.cuenta ?? '';
};

const getCategoria = (tipo: 'i' | 'g' | 't', item: MovimientoExportable): string => {
  if (tipo === 't') return 'Transferencia';
  return item.categoria ?? '';
};

const buildRows = (data: DataMovimientos): ExcelRow[] => {
  const rows: ExcelRow[] = [];

  const addMovimientos = (tipo: 'i' | 'g' | 't') => {
    (data[tipo] || []).forEach((item) => {
      const movimiento = item as MovimientoExportable;
      rows.push({
        Fecha: item.fecha ?? '',
        Descripción: item.descripcion ?? '',
        Categoría: getCategoria(tipo, movimiento),
        Cuenta: getCuenta(tipo, movimiento),
        Valor: Number(item.valor),
        Estado: item.estado ? 'Pagado' : 'Pendiente',
        Tipo: TIPO_LABELS[tipo],
      });
    });
  };

  addMovimientos('i');
  addMovimientos('g');
  addMovimientos('t');

  rows.sort((a, b) => a.Fecha.localeCompare(b.Fecha));
  return rows;
};

export const exportToExcel = async (
  data: DataMovimientos,
  filename: string
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cerdyn';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Movimientos');

  sheet.columns = [
    { header: 'Fecha', key: 'Fecha', width: 14 },
    { header: 'Descripción', key: 'Descripción', width: 30 },
    { header: 'Categoría', key: 'Categoría', width: 20 },
    { header: 'Cuenta', key: 'Cuenta', width: 20 },
    { header: 'Valor', key: 'Valor', width: 14 },
    { header: 'Estado', key: 'Estado', width: 12 },
    { header: 'Tipo', key: 'Tipo', width: 14 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF9955FF' },
  };

  const rows = buildRows(data);
  rows.forEach((row) => sheet.addRow(row));

  // Format valor column as number
  sheet.getColumn('Valor').numFmt = '#,##0.00';

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, filename);
};
