import ExcelJS from 'exceljs';
import { downloadBlob } from '../export/downloadUtils';

export type ImportTipo = 'i' | 'g' | 't';
type CategoriaTipo = 'i' | 'g';

export interface ParsedMovimientoRow {
  rowNumber: number;
  fecha: string;
  descripcion: string;
  tipoRaw: string;
  tipo: ImportTipo | null;
  valor: number | null;
  idcategoria: number | null;
  idcuenta: number | null;
  idcuenta_origen: number | null;
  idcuenta_destino: number | null;
}

export interface CategoriaImportRef {
  id: number;
  tipo: string | null;
  idusuario: number | null;
  descripcion?: string | null;
}

export interface CuentaImportRef {
  id: number;
  idusuario: number | null;
  descripcion?: string | null;
}

export type ValidationIssueCode =
  | 'INVALID_DATE'
  | 'INVALID_VALUE'
  | 'INVALID_TYPE'
  | 'MISSING_CATEGORY'
  | 'INVALID_CATEGORY'
  | 'MISSING_ACCOUNT'
  | 'INVALID_ACCOUNT'
  | 'MISSING_TRANSFER_ACCOUNT'
  | 'INVALID_TRANSFER_ACCOUNT'
  | 'SAME_TRANSFER_ACCOUNT';

export interface ValidationIssue {
  code: ValidationIssueCode;
  rowNumber: number;
  message: string;
  groupKey?: string;
  tipo?: CategoriaTipo | null;
}

export interface ValidationResult {
  rows: ParsedMovimientoRow[];
  issues: ValidationIssue[];
  validCount: number;
  invalidCount: number;
  transferCount: number;
}

export interface CategoryIssueGroup {
  key: string;
  tipo: CategoriaTipo | null;
  count: number;
  rowNumbers: number[];
  currentCategoryId: number | null;
  label: string;
}

const HEADER_KEYS = ['fecha', 'descripcion', 'tipo', 'valor', 'idcategoria', 'idcuenta', 'idcuenta_origen', 'idcuenta_destino'] as const;

const normalizeHeader = (value: unknown): string => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
};

const asDateYyyyMmDd = (value: unknown): string => {
  if (value == null || value === '') return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsedDate = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().slice(0, 10);
    }
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return text;
};

const asNumber = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const sanitized = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeTipo = (tipo: unknown): { kind: 'valid' | 'invalid'; value: ImportTipo | null; raw: string } => {
  const raw = String(tipo ?? '').trim().toLowerCase();
  if (raw === 'i' || raw === 'ingreso') return { kind: 'valid', value: 'i', raw };
  if (raw === 'g' || raw === 'gasto') return { kind: 'valid', value: 'g', raw };
  if (raw === 't' || raw === 'transferencia') return { kind: 'valid', value: 't', raw };
  return { kind: 'invalid', value: null, raw };
};

const parseId = (value: unknown): number | null => {
  const parsed = asNumber(value);
  if (parsed == null) return null;
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const isRowEmpty = (row: ParsedMovimientoRow): boolean => {
  return (
    row.fecha.trim() === '' &&
    row.descripcion.trim() === '' &&
    row.tipoRaw.trim() === '' &&
    row.valor == null &&
    row.idcategoria == null &&
    row.idcuenta == null &&
    row.idcuenta_origen == null &&
    row.idcuenta_destino == null
  );
};

export const parseMovimientosWorkbook = async (buffer: ArrayBuffer): Promise<ParsedMovimientoRow[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet('Movimientos') ?? workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No se encontró la hoja "Movimientos" en el archivo.');
  }

  const headerRow = worksheet.getRow(1);
  const indexes: Record<string, number> = {};

  headerRow.eachCell((cell, colNumber) => {
    const value = normalizeHeader(cell.value);
    if (value) indexes[value] = colNumber;
  });

  const requiredHeaders = ['fecha', 'descripcion', 'tipo', 'valor', 'idcategoria', 'idcuenta'];
  const missingHeaders = requiredHeaders.filter((header) => !(header in indexes));
  if (missingHeaders.length > 0) {
    throw new Error(`Faltan columnas obligatorias en la hoja Movimientos: ${missingHeaders.join(', ')}`);
  }

  const rows: ParsedMovimientoRow[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const values: Record<(typeof HEADER_KEYS)[number], unknown> = {
      fecha: '',
      descripcion: '',
      tipo: '',
      valor: '',
      idcategoria: '',
      idcuenta: '',
      idcuenta_origen: '',
      idcuenta_destino: '',
    };

    for (const key of HEADER_KEYS) {
      const index = indexes[key];
      if (index) values[key] = row.getCell(index).value;
    }

    const tipoResult = normalizeTipo(values.tipo);
    const parsed: ParsedMovimientoRow = {
      rowNumber,
      fecha: asDateYyyyMmDd(values.fecha),
      descripcion: String(values.descripcion ?? '').trim(),
      tipoRaw: String(values.tipo ?? '').trim(),
      tipo: tipoResult.value,
      valor: asNumber(values.valor),
      idcategoria: parseId(values.idcategoria),
      idcuenta: parseId(values.idcuenta),
      idcuenta_origen: parseId(values.idcuenta_origen),
      idcuenta_destino: parseId(values.idcuenta_destino),
    };

    if (!isRowEmpty(parsed)) {
      rows.push(parsed);
    }
  }

  return rows;
};

const isValidDate = (dateString: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(`${dateString}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
};

const normalizeCategoryTipo = (tipo: string | null): CategoriaTipo | null => {
  const value = normalizeTipo(tipo).value;
  return value === 'i' || value === 'g' ? value : null;
};

export const validateImportRows = (
  rows: ParsedMovimientoRow[],
  categorias: CategoriaImportRef[],
  cuentas: CuentaImportRef[],
  idusuario: number
): ValidationResult => {
  const userCategories = categorias.filter((item) => item.idusuario === idusuario);
  const userAccounts = new Set(cuentas.filter((item) => item.idusuario === idusuario).map((item) => item.id));
  const categoryById = new Map(userCategories.map((item) => [item.id, item]));

  const issues: ValidationIssue[] = [];
  let transferCount = 0;

  for (const row of rows) {
    const tipoResult = normalizeTipo(row.tipoRaw);

    if (!isValidDate(row.fecha)) {
      issues.push({
        code: 'INVALID_DATE',
        rowNumber: row.rowNumber,
        message: `Fila ${row.rowNumber}: fecha inválida (${row.fecha || 'vacía'})`,
      });
    }

    if (row.valor == null || row.valor <= 0) {
      issues.push({
        code: 'INVALID_VALUE',
        rowNumber: row.rowNumber,
        message: `Fila ${row.rowNumber}: valor inválido (debe ser mayor a 0)`,
      });
    }

    if (tipoResult.value === 't') {
      transferCount += 1;
    }

    if (tipoResult.kind === 'invalid') {
      issues.push({
        code: 'INVALID_TYPE',
        rowNumber: row.rowNumber,
        message: `Fila ${row.rowNumber}: tipo inválido (${row.tipoRaw || 'vacío'}), usa ingreso, gasto o transferencia`,
      });
    }

    if (tipoResult.value === 'i' || tipoResult.value === 'g') {
      if (row.idcategoria == null) {
        issues.push({
          code: 'MISSING_CATEGORY',
          rowNumber: row.rowNumber,
          tipo: tipoResult.value,
          groupKey: `category:${tipoResult.value}:missing`,
          message: `Fila ${row.rowNumber}: falta idcategoria para ${tipoResult.value === 'i' ? 'ingreso' : 'gasto'}`,
        });
      } else {
        const category = categoryById.get(row.idcategoria);
        const categoryTipo = normalizeCategoryTipo(category?.tipo ?? null);
        if (!category || categoryTipo !== tipoResult.value) {
          issues.push({
            code: 'INVALID_CATEGORY',
            rowNumber: row.rowNumber,
            tipo: tipoResult.value,
            groupKey: `category:${tipoResult.value}:${row.idcategoria}`,
            message: `Fila ${row.rowNumber}: categoría inválida (${row.idcategoria}) para ${tipoResult.value === 'i' ? 'ingreso' : 'gasto'}`,
          });
        }
      }
    }

    if ((tipoResult.value === 'i' || tipoResult.value === 'g') && row.idcuenta == null) {
      issues.push({
        code: 'MISSING_ACCOUNT',
        rowNumber: row.rowNumber,
        message: `Fila ${row.rowNumber}: falta idcuenta para ${tipoResult.value === 'i' ? 'ingreso' : 'gasto'}`,
      });
    }

    if (row.idcuenta != null && !userAccounts.has(row.idcuenta)) {
      issues.push({
        code: 'INVALID_ACCOUNT',
        rowNumber: row.rowNumber,
        message: `Fila ${row.rowNumber}: idcuenta inválida (${row.idcuenta})`,
      });
    }

    if (tipoResult.value === 't') {
      if (row.idcuenta_origen == null) {
        issues.push({
          code: 'MISSING_TRANSFER_ACCOUNT',
          rowNumber: row.rowNumber,
          message: `Fila ${row.rowNumber}: falta idcuenta_origen para transferencia`,
        });
      } else if (!userAccounts.has(row.idcuenta_origen)) {
        issues.push({
          code: 'INVALID_TRANSFER_ACCOUNT',
          rowNumber: row.rowNumber,
          message: `Fila ${row.rowNumber}: idcuenta_origen inválida (${row.idcuenta_origen})`,
        });
      }

      if (row.idcuenta_destino == null) {
        issues.push({
          code: 'MISSING_TRANSFER_ACCOUNT',
          rowNumber: row.rowNumber,
          message: `Fila ${row.rowNumber}: falta idcuenta_destino para transferencia`,
        });
      } else if (!userAccounts.has(row.idcuenta_destino)) {
        issues.push({
          code: 'INVALID_TRANSFER_ACCOUNT',
          rowNumber: row.rowNumber,
          message: `Fila ${row.rowNumber}: idcuenta_destino inválida (${row.idcuenta_destino})`,
        });
      }

      if (row.idcuenta_origen != null && row.idcuenta_destino != null && row.idcuenta_origen === row.idcuenta_destino) {
        issues.push({
          code: 'SAME_TRANSFER_ACCOUNT',
          rowNumber: row.rowNumber,
          message: `Fila ${row.rowNumber}: la cuenta origen y destino deben ser diferentes`,
        });
      }
    }
  }

  const invalidRowNumbers = new Set(issues.map((issue) => issue.rowNumber));
  const invalidCount = invalidRowNumbers.size;
  const validCount = rows.length - invalidCount;

  return {
    rows,
    issues,
    validCount,
    invalidCount,
    transferCount,
  };
};

export const groupCategoryIssues = (issues: ValidationIssue[], rows: ParsedMovimientoRow[]): CategoryIssueGroup[] => {
  const grouped = new Map<string, CategoryIssueGroup>();
  const rowMap = new Map(rows.map((row) => [row.rowNumber, row]));

  for (const issue of issues) {
    if (!issue.groupKey || (issue.code !== 'MISSING_CATEGORY' && issue.code !== 'INVALID_CATEGORY')) continue;

    const row = rowMap.get(issue.rowNumber);
    const existing = grouped.get(issue.groupKey);

    if (existing) {
      existing.count += 1;
      existing.rowNumbers.push(issue.rowNumber);
      continue;
    }

    grouped.set(issue.groupKey, {
      key: issue.groupKey,
      tipo: issue.tipo ?? null,
      count: 1,
      rowNumbers: [issue.rowNumber],
      currentCategoryId: row?.idcategoria ?? null,
      label: issue.code === 'MISSING_CATEGORY'
        ? `Falta categoría (${issue.tipo === 'i' ? 'ingreso' : 'gasto'})`
        : `Categoría inválida ${row?.idcategoria != null ? `(${row.idcategoria})` : ''}`,
    });
  }

  return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
};

export const applyCategoryCorrection = (
  rows: ParsedMovimientoRow[],
  group: CategoryIssueGroup,
  newCategoryId: number
): ParsedMovimientoRow[] => {
  const rowSet = new Set(group.rowNumbers);
  return rows.map((row) => {
    if (!rowSet.has(row.rowNumber)) return row;
    return {
      ...row,
      idcategoria: newCategoryId,
    };
  });
};

export const chunkRows = <T,>(rows: T[], size: number): T[][] => {
  if (size <= 0) return [rows];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
};

export interface TemplateCategory {
  id: number;
  tipo: string | null;
  descripcion: string | null;
}

export interface TemplateCuenta {
  id: number;
  descripcion: string | null;
}

export const downloadMovimientosImportTemplate = async (categories: TemplateCategory[], cuentas: TemplateCuenta[]): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cerdyn';
  workbook.created = new Date();

  const movimientosSheet = workbook.addWorksheet('Movimientos');
  movimientosSheet.addRow(['fecha', 'descripcion', 'tipo', 'valor', 'idcategoria', 'idcuenta', 'idcuenta_origen', 'idcuenta_destino']);
  movimientosSheet.addRow(['2026-01-15', 'Ejemplo supermercado', 'gasto', 24500, 1, 1, '', '']);
  movimientosSheet.addRow(['2026-01-20', 'Ejemplo salario', 'ingreso', 850000, 2, 1, '', '']);
  movimientosSheet.addRow(['2026-01-25', 'Ejemplo transferencia a ahorros', 'transferencia', 50000, '', '', 1, 2]);
  movimientosSheet.columns = [
    { key: 'fecha', width: 14 },
    { key: 'descripcion', width: 42 },
    { key: 'tipo', width: 14 },
    { key: 'valor', width: 14 },
    { key: 'idcategoria', width: 14 },
    { key: 'idcuenta', width: 12 },
    { key: 'idcuenta_origen', width: 18 },
    { key: 'idcuenta_destino', width: 18 },
  ];
  movimientosSheet.getRow(1).font = { bold: true };
  movimientosSheet.getCell('A1').note = 'Formato YYYY-MM-DD';
  movimientosSheet.getCell('C1').note = 'Ingreso, gasto o transferencia';
  movimientosSheet.getCell('D1').note = 'Número mayor a 0';
  movimientosSheet.getCell('E1').note = 'Requerido solo para ingresos y gastos';
  movimientosSheet.getCell('F1').note = 'Requerido solo para ingresos y gastos';
  movimientosSheet.getCell('G1').note = 'Requerido solo para transferencias';
  movimientosSheet.getCell('H1').note = 'Requerido solo para transferencias';

  const categoriasSheet = workbook.addWorksheet('Categorias');
  categoriasSheet.addRow(['tipo', 'idcategoria', 'descripcion']);
  categories.forEach((item) => {
    const tipo = normalizeTipo(item.tipo).value;
    if (!tipo) return;
    categoriasSheet.addRow([
      tipo === 'i' ? 'ingreso' : 'gasto',
      item.id,
      item.descripcion ?? '',
    ]);
  });
  categoriasSheet.columns = [
    { key: 'tipo', width: 14 },
    { key: 'idcategoria', width: 14 },
    { key: 'descripcion', width: 42 },
  ];
  categoriasSheet.getRow(1).font = { bold: true };

  const cuentasSheet = workbook.addWorksheet('Cuentas');
  cuentasSheet.addRow(['idcuenta', 'descripcion']);
  cuentas.forEach((item) => {
    cuentasSheet.addRow([item.id, item.descripcion ?? '']);
  });
  cuentasSheet.columns = [
    { key: 'idcuenta', width: 14 },
    { key: 'descripcion', width: 42 },
  ];
  cuentasSheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, 'plantilla-importar-movimientos.xlsx');
};
