import { useQuery } from '@tanstack/react-query';
import { JSX } from 'react';
import { SpinnerLoader } from '../components/moleculas/SpinnerLoader';
import { ImportarMovimientosTemplate } from '../components/templates/ImportarMovimientosTemplate';
import { useUsuariosStore } from '../store/UsuariosStore';
import { supabase } from '../supabase/supabase.config';
import { CategoriaImportRef, CuentaImportRef } from '../utils/import/movimientosExcelImport';

export const ImportarMovimientos = (): JSX.Element => {
  const { usuario } = useUsuariosStore();
  const userId = usuario?.id ?? 0;

  const categoriasQuery = useQuery<CategoriaImportRef[], Error>({
    queryKey: ['import-categorias', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, idusuario, tipo, descripcion')
        .eq('idusuario', userId);

      if (error) throw error;
      return data;
    },
    enabled: userId > 0,
    staleTime: 5 * 60 * 1000,
  });

  const cuentasQuery = useQuery<CuentaImportRef[], Error>({
    queryKey: ['import-cuentas', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cuenta')
        .select('id, idusuario, descripcion')
        .eq('idusuario', userId);

      if (error) throw error;
      return data;
    },
    enabled: userId > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (categoriasQuery.isLoading || cuentasQuery.isLoading || userId === 0) {
    return <SpinnerLoader />;
  }

  if (categoriasQuery.error || cuentasQuery.error) {
    return <h1>Error: {(categoriasQuery.error ?? cuentasQuery.error)?.message}</h1>;
  }

  return (
    <ImportarMovimientosTemplate
      userId={userId}
      categorias={categoriasQuery.data ?? []}
      cuentas={cuentasQuery.data ?? []}
    />
  );
};
