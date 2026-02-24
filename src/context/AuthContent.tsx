import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, InsertarUsuarios, Database, useUsuariosStore } from "../index";
import { useLocation, useNavigate } from "react-router-dom";

type UsuarioInsert = Database["public"]["Tables"]["usuarios"]["Insert"];


interface AuthContextType {
  user: { name: string; picture: string } | null;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setUsuario } = useUsuariosStore();


  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session == null) {
          setUser(null);
          navigate("/login", { replace: true });
        } else {
          const metadata = session.user.user_metadata;

          const user = {
            name: metadata.name,
            idauth_supabase: session.user.id,
            picture: metadata.picture
          };

          setUser(user);

          // Insert usuario con timeout para evitar que se cuelgue
          try {
            const timeoutPromise = new Promise<null>((resolve) => {
              setTimeout(() => {
                console.warn('Timeout al insertar usuario en AuthContext, continuando sin esperar...');
                resolve(null);
              }, 5000); // 5 segundo timeout
            });

            await Promise.race([
              insertarUsuarios(user, session.user.id),
              timeoutPromise,
            ]);
          } catch (error) {
            console.error('Error al insertar usuario en AuthContext:', error);
            // Continuar de todas formas, el usuario se cargará desde ObtenerUsuarioActual
          }

          if (pathname === "/login") {
            navigate("/", { replace: true });
            return;
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const insertarUsuarios = async (
    dataProvider: { name: string; picture: string },
    idAuthSupabase: string
  ) => {
    const p: UsuarioInsert = {
      nombres: dataProvider.name,
      foto: dataProvider.picture,
      idauth_supabase: idAuthSupabase,
    };

    const usuario = await InsertarUsuarios(p, idAuthSupabase);
    if (usuario == null) {
      return;
    }
    setUsuario(usuario);
  };

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within an AuthContextProvider");
  }
  return context;
};