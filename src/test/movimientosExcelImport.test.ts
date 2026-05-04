import { describe, expect, it } from 'vitest';
import {
  applyCategoryCorrection,
  chunkRows,
  groupCategoryIssues,
  normalizeTipo,
  ParsedMovimientoRow,
  validateImportRows,
} from '../utils/import/movimientosExcelImport';

describe('normalizeTipo', () => {
  it('normalizes ingreso/gasto and detects transfer', () => {
    expect(normalizeTipo('ingreso')).toMatchObject({ kind: 'valid', value: 'i' });
    expect(normalizeTipo('g')).toMatchObject({ kind: 'valid', value: 'g' });
    expect(normalizeTipo('transferencia')).toMatchObject({ kind: 'transfer', value: null });
  });
});

describe('validateImportRows', () => {
  const categorias = [
    { id: 1, tipo: 'g', idusuario: 10, descripcion: 'Supermercado' },
    { id: 2, tipo: 'i', idusuario: 10, descripcion: 'Salario' },
  ];
  const cuentas = [{ id: 100, idusuario: 10, descripcion: 'Cuenta principal' }];

  it('marks valid rows and reports invalid category/account/transfer issues', () => {
    const rows: ParsedMovimientoRow[] = [
      {
        rowNumber: 2,
        fecha: '2026-01-10',
        descripcion: 'Compra',
        tipoRaw: 'gasto',
        tipo: 'g',
        valor: 1000,
        idcategoria: 1,
        idcuenta: 100,
      },
      {
        rowNumber: 3,
        fecha: '2026-01-11',
        descripcion: 'Sueldo',
        tipoRaw: 'ingreso',
        tipo: 'i',
        valor: 2500,
        idcategoria: 99,
        idcuenta: 100,
      },
      {
        rowNumber: 4,
        fecha: '2026-01-12',
        descripcion: 'Pase',
        tipoRaw: 'transferencia',
        tipo: null,
        valor: 100,
        idcategoria: 1,
        idcuenta: 999,
      },
    ];

    const result = validateImportRows(rows, categorias, cuentas, 10);
    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(2);
    expect(result.transferCount).toBe(1);
    expect(result.issues.some((issue) => issue.code === 'INVALID_CATEGORY')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'TRANSFER_NOT_ALLOWED')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'INVALID_ACCOUNT')).toBe(true);
  });
});

describe('groupCategoryIssues and applyCategoryCorrection', () => {
  it('groups category issues and applies correction to all rows in a group', () => {
    const rows: ParsedMovimientoRow[] = [
      {
        rowNumber: 2,
        fecha: '2026-01-10',
        descripcion: 'A',
        tipoRaw: 'gasto',
        tipo: 'g',
        valor: 100,
        idcategoria: null,
        idcuenta: null,
      },
      {
        rowNumber: 3,
        fecha: '2026-01-11',
        descripcion: 'B',
        tipoRaw: 'gasto',
        tipo: 'g',
        valor: 200,
        idcategoria: null,
        idcuenta: null,
      },
    ];

    const validation = validateImportRows(rows, [], [], 10);
    const groups = groupCategoryIssues(validation.issues, rows);
    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(2);

    const fixed = applyCategoryCorrection(rows, groups[0], 5);
    expect(fixed[0].idcategoria).toBe(5);
    expect(fixed[1].idcategoria).toBe(5);
  });
});

describe('chunkRows', () => {
  it('splits rows in fixed chunks', () => {
    expect(chunkRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
