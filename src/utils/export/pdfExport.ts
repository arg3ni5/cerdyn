import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadBlob } from './downloadUtils';
import type { DataMovimientos } from '../../store/MovimientosStore';

interface PdfExportOptions {
  titulo: string;
  periodo: string;
  data: DataMovimientos;
  filename: string;
  /**
   * Max rows to include in the PDF table. Defaults to 500.
   * For larger datasets use JSON or Excel export.
   */
  maxRows?: number;
}

const TIPO_LABELS: Record<string, string> = {
  i: 'Ingreso',
  g: 'Gasto',
  t: 'Transferencia',
};

export const exportToPdf = (options: PdfExportOptions): void => {
  const { titulo, periodo, data, filename, maxRows = 500 } = options;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title
  doc.setFontSize(16);
  doc.setTextColor(153, 85, 255);
  doc.text(titulo, 14, 16);

  // Period
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Período: ${periodo}`, 14, 24);

  // Summary
  const totalIngresos = (data.i || []).reduce((s, m) => s + Number(m.valor), 0);
  const totalGastos = (data.g || []).reduce((s, m) => s + Number(m.valor), 0);
  const balance = totalIngresos - totalGastos;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Ingresos: ${totalIngresos.toFixed(2)}   Gastos: ${totalGastos.toFixed(2)}   Balance: ${balance.toFixed(2)}`,
    14,
    30
  );

  // Build rows
  const allRows: string[][] = [];
  const addMovimientos = (tipo: 'i' | 'g' | 't') => {
    (data[tipo] || []).forEach((item) => {
      allRows.push([
        item.fecha ?? '',
        item.descripcion ?? '',
        item.categoria ?? '',
        item.cuenta ?? '',
        Number(item.valor).toFixed(2),
        item.estado ? 'Pagado' : 'Pendiente',
        TIPO_LABELS[tipo],
      ]);
    });
  };
  addMovimientos('i');
  addMovimientos('g');
  addMovimientos('t');

  allRows.sort((a, b) => a[0].localeCompare(b[0]));

  const rows = allRows.slice(0, maxRows);
  const truncated = allRows.length > maxRows;

  autoTable(doc, {
    startY: 35,
    head: [['Fecha', 'Descripción', 'Categoría', 'Cuenta', 'Valor', 'Estado', 'Tipo']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [153, 85, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 240, 255] },
  });

  if (truncated) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 200;
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0);
    doc.text(
      `Nota: se muestran ${maxRows} de ${allRows.length} registros. Use JSON o Excel para exportar todos.`,
      14,
      finalY + 6
    );
  }

  const blob = doc.output('blob');
  downloadBlob(blob, filename);
};
