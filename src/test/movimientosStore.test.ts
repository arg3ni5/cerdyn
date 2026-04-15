import { describe, it, expect } from 'vitest';
import { esPagado, calcularTotalesBalance } from '../utils/totalesUtils';

const mkItem = (valor: number, estado: boolean | number | string) => ({ valor, estado });

describe('esPagado', () => {
  it('returns true for boolean true', () => {
    expect(esPagado(true)).toBe(true);
  });

  it('returns false for boolean false', () => {
    expect(esPagado(false)).toBe(false);
  });

  it('returns true for numeric 1', () => {
    expect(esPagado(1)).toBe(true);
  });

  it('returns false for numeric 0', () => {
    expect(esPagado(0)).toBe(false);
  });

  it('returns true for string "1"', () => {
    expect(esPagado('1')).toBe(true);
  });

  it('returns true for string "true"', () => {
    expect(esPagado('true')).toBe(true);
  });

  it('returns false for other strings', () => {
    expect(esPagado('false')).toBe(false);
    expect(esPagado('')).toBe(false);
  });
});

describe('calcularTotalesBalance', () => {
  it('calculates ingresosPagadosMes and gastosPagadosMes separately', () => {
    const ingresos = [mkItem(100, true), mkItem(50, false)];
    const gastos = [mkItem(30, true), mkItem(20, false)];

    const result = calcularTotalesBalance(ingresos, gastos);

    expect(result.ingresosPagadosMes).toBe(100);
    expect(result.gastosPagadosMes).toBe(30);
  });

  it('calculates totalMesAñoPagados as ingresos pagados minus gastos pagados', () => {
    const ingresos = [mkItem(200, true)];
    const gastos = [mkItem(80, true)];

    const result = calcularTotalesBalance(ingresos, gastos);

    expect(result.totalMesAñoPagados).toBe(120);
  });

  it('calculates totalMesAño as total ingresos minus total gastos', () => {
    const ingresos = [mkItem(200, true), mkItem(50, false)];
    const gastos = [mkItem(80, true), mkItem(20, false)];

    const result = calcularTotalesBalance(ingresos, gastos);

    expect(result.totalMesAño).toBe(150); // (200+50) - (80+20)
  });

  it('calculates totalMesAñoPendientes correctly', () => {
    const ingresos = [mkItem(100, true), mkItem(60, false)];
    const gastos = [mkItem(30, true), mkItem(25, false)];

    const result = calcularTotalesBalance(ingresos, gastos);

    expect(result.totalMesAñoPendientes).toBe(35); // 60 - 25
  });

  it('returns all zeros when lists are empty', () => {
    const result = calcularTotalesBalance([], []);

    expect(result.ingresosPagadosMes).toBe(0);
    expect(result.gastosPagadosMes).toBe(0);
    expect(result.totalMesAñoPagados).toBe(0);
    expect(result.totalMesAño).toBe(0);
    expect(result.totalMesAñoPendientes).toBe(0);
  });

  it('handles negative balance (gastos > ingresos)', () => {
    const ingresos = [mkItem(50, true)];
    const gastos = [mkItem(120, true)];

    const result = calcularTotalesBalance(ingresos, gastos);

    expect(result.totalMesAñoPagados).toBe(-70);
    expect(result.ingresosPagadosMes).toBe(50);
    expect(result.gastosPagadosMes).toBe(120);
  });
});
