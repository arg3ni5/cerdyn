import { useEffect } from "react";
import {
  CategoriasTemplate,
  useCategoriasStore,
  useOperaciones,
  useUsuariosStore,
  Categoria,
  useLoading,
} from "../index";
import { useQuery } from "@tanstack/react-query";

interface QueryParams {
  idusuario: number;
  tipo: string;
}

export const Categorias = () => {
  const { selectTipoCategoria } = useOperaciones();
  const { mostrarCategorias } = useCategoriasStore();
  const { usuario } = useUsuariosStore();
  const { setIsLoading } = useLoading();

  const { data, isLoading, error } = useQuery<Categoria[], Error>({
    queryKey: ["mostrar categorias", selectTipoCategoria, usuario?.id],
    queryFn: () =>
      mostrarCategorias({
        idusuario: usuario?.id,
        tipo: selectTipoCategoria.tipo,
      } as QueryParams),
    enabled: !!usuario?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (renamed from cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    setIsLoading(isLoading);
    if (data) {
      useCategoriasStore.setState({ datacategoria: data });
    }
  }, [isLoading, setIsLoading, data]);

  if (error) {
    return <h1>Error: {error.message}</h1>;
  }

  return (
    <CategoriasTemplate data={data || []}>
    </CategoriasTemplate>
  );
};
