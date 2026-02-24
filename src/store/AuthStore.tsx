import { create } from "zustand";
import { supabase } from "../index";
import { logger } from "../utils/logger";
import { showErrorMessage } from "../utils/messages";

interface GoogleUserData {
  provider: string;
  url: string;
}

interface AuthStore {
  isAuth: boolean;
  datauserGoogle: GoogleUserData[];
  signInWithGoogle: () => Promise<GoogleUserData | undefined>;
  signout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuth: false,
  datauserGoogle: [],

  signInWithGoogle: async () => {
    try {
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;

      if (!data) {
        logger.error('No se recibieron datos de autenticación');
        showErrorMessage('No se pudo completar la autenticación. Por favor, intenta nuevamente.');
        return undefined;
      }

      set({ isAuth: true });
      logger.info('Autenticación con Google exitosa', { provider: data.provider });

      // Return provider and url if available
      return { provider: data.provider, url: data.url || "" };
    } catch (error) {
      logger.error('Error inesperado durante signInWithGoogle', { error });
      showErrorMessage('Error inesperado durante la autenticación.');
      return undefined;
    }
  },

  signout: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Error durante cierre de sesión', { error: error.message });
        showErrorMessage('Ocurrió un error durante el cierre de sesión.');
        throw new Error("Ocurrió un error durante el cierre de sesión");
      }

      set({ isAuth: false });
      logger.info('Cierre de sesión exitoso');
    } catch (error) {
      logger.error('Error inesperado durante signout', { error });
      set({ isAuth: false }); // Clear auth state even on error
      throw error;
    }
  },
}));
