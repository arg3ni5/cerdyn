create unique index if not exists conexiones_usuarios_unique_identity_idx
  on public.conexiones_usuarios (idusuario, canal, canal_user_id);

create index if not exists conexiones_usuarios_idusuario_idx
  on public.conexiones_usuarios (idusuario);
