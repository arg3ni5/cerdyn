/**
 * Pure helpers for computing movement totals.
 * Extracted from MovimientosStore to allow unit testing without the full React tree.
 */

export const esPagado = (estado: unknown): boolean => {
  if (typeof estado === 'boolean') return estado;
  if (typeof estado === 'number') return estado === 1;
  if (typeof estado === 'string') {
    const valor = estado.trim().toLowerCase();
    return valor === '1' || valor === 'true';
  }
  return false;
};

export interface ValorConEstado {
  valor: number | string;
  estado: unknown;
}

export interface TotalesBalance {
  totalMesAño: number;
  totalMesAñoPagados: number;
  totalMesAñoPendientes: number;
  ingresosPagadosMes: number;
  gastosPagadosMes: number;
}

export const calcularTotalesBalance = (
  ingresos: ValorConEstado[],
  gastos: ValorConEstado[]
): TotalesBalance => {
  const sum = (items: ValorConEstado[]) =>
    items.reduce((acc, item) => acc + Number(item.valor), 0);
  const sumPagados = (items: ValorConEstado[]) =>
    items.filter((item) => esPagado(item.estado)).reduce((acc, item) => acc + Number(item.valor), 0);
  const sumPendientes = (items: ValorConEstado[]) =>
    items.filter((item) => !esPagado(item.estado)).reduce((acc, item) => acc + Number(item.valor), 0);

  const totalIngresos = sum(ingresos);
  const totalGastos = sum(gastos);
  const ingPagados = sumPagados(ingresos);
  const gasPagados = sumPagados(gastos);
  const ingPendientes = sumPendientes(ingresos);
  const gasPendientes = sumPendientes(gastos);

  return {
    totalMesAño: totalIngresos - totalGastos,
    totalMesAñoPagados: ingPagados - gasPagados,
    totalMesAñoPendientes: ingPendientes - gasPendientes,
    ingresosPagadosMes: ingPagados,
    gastosPagadosMes: gasPagados,
  };
};
