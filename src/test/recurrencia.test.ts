import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { generarFechasIntervalo, generarFechasMensual } from '../utils/recurrencia';

// Fix "today" to 2024-03-15 for deterministic tests
const FIXED_NOW = new Date('2024-03-15T12:00:00.000Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

describe('generarFechasIntervalo', () => {
  it('generates the correct number of dates', () => {
    const fechas = generarFechasIntervalo('2024-01-01', 30, 3);
    expect(fechas).toHaveLength(3);
  });

  it('first date equals the base date', () => {
    const fechas = generarFechasIntervalo('2024-01-01', 15, 2);
    expect(fechas[0]).toBe('2024-01-01');
  });

  it('subsequent dates are separated by intervaloDias', () => {
    const fechas = generarFechasIntervalo('2024-01-01', 15, 3);
    expect(fechas[1]).toBe('2024-01-16');
    expect(fechas[2]).toBe('2024-01-31');
  });

  it('returns empty array when repeticiones is 0', () => {
    const fechas = generarFechasIntervalo('2024-01-01', 10, 0);
    expect(fechas).toHaveLength(0);
  });
});

describe('generarFechasMensual', () => {
  it('generates the correct number of dates', () => {
    const fechas = generarFechasMensual(15, 3, 'este_mes');
    expect(fechas).toHaveLength(3);
  });

  it('proximo_mes always starts next month', () => {
    // Fixed date: 2024-03-15; diaMes=20; next month = April
    const fechas = generarFechasMensual(20, 2, 'proximo_mes');
    expect(fechas[0]).toBe('2024-04-20');
    expect(fechas[1]).toBe('2024-05-20');
  });

  it('este_mes uses current month when day has not passed', () => {
    // Fixed date: 2024-03-15; diaMes=20 (not passed yet)
    const fechas = generarFechasMensual(20, 2, 'este_mes');
    expect(fechas[0]).toBe('2024-03-20');
    expect(fechas[1]).toBe('2024-04-20');
  });

  it('este_mes moves to next month when day has already passed', () => {
    // Fixed date: 2024-03-15; diaMes=10 (already passed in March)
    const fechas = generarFechasMensual(10, 2, 'este_mes');
    expect(fechas[0]).toBe('2024-04-10');
    expect(fechas[1]).toBe('2024-05-10');
  });

  it('clamps to last day of month for day 31 in a 30-day month', () => {
    // April has 30 days
    const fechas = generarFechasMensual(31, 1, 'proximo_mes');
    // next month from March is April
    expect(fechas[0]).toBe('2024-04-30');
  });

  it('clamps to last day for day 29 in February (non-leap)', () => {
    // Fixed: March 2024; proximo_mes from March would be April...
    // Let's test from a non-leap February context using a different call
    // We can test Feb 2025 (non-leap) by generating enough months
    const fechas = generarFechasMensual(29, 12, 'proximo_mes');
    // April=29, May=29... until Feb 2025 which has 28 days
    const feb2025 = fechas.find((f) => f.startsWith('2025-02'));
    expect(feb2025).toBe('2025-02-28');
  });
});
