export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          color: string | null;
          descripcion: string | null;
          icono: string | null;
          id: number;
          idusuario: number | null;
          tipo: string | null;
        };
        Insert: {
          color?: string | null;
          descripcion?: string | null;
          icono?: string | null;
          id?: number;
          idusuario?: number | null;
          tipo?: string | null;
        };
        Update: {
          color?: string | null;
          descripcion?: string | null;
          icono?: string | null;
          id?: number;
          idusuario?: number | null;
          tipo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categorias_idusuario_fkey";
            columns: ["idusuario"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
        ];
      };
      conexiones_usuarios: {
        Row: {
          canal: string;
          canal_user_id: string;
          canal_username: string | null;
          id: number;
          idusuario: number;
          vinculado_en: string | null;
        };
        Insert: {
          canal: string;
          canal_user_id: string;
          canal_username?: string | null;
          id?: number;
          idusuario: number;
          vinculado_en?: string | null;
        };
        Update: {
          canal?: string;
          canal_user_id?: string;
          canal_username?: string | null;
          id?: number;
          idusuario?: number;
          vinculado_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conexiones_usuarios_usuario_id_fkey";
            columns: ["idusuario"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
        ];
      };
      cuenta: {
        Row: {
          descripcion: string;
          icono: string | null;
          tipo: string | null;
          id: number;
          idusuario: number | null;
          saldo_actual: number | null;
        };
        Insert: {
          descripcion?: string;
          icono?: string | null;
          tipo: string | null;
          id?: number;
          idusuario?: number | null;
          saldo_actual?: number | null;
        };
        Update: {
          descripcion?: string;
          icono?: string | null;
          id?: number;
          idusuario?: number | null;
          saldo_actual?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "cuenta_idusuario_fkey";
            columns: ["idusuario"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
        ];
      };
      movimientos: {
        Row: {
          descripcion: string | null;
          estado: boolean | null;
          fecha: string | null;
          id: number;
          idcategoria: number | null;
          idcuenta: number | null;
          idcuenta_origen: number | null;
          idcuenta_destino: number | null;
          tipo: string;
          valor: number | null;
        };
        Insert: {
          descripcion?: string | null;
          estado?: boolean | null;
          fecha?: string | null;
          id?: number;
          idcategoria?: number | null;
          idcuenta?: number | null;
          idcuenta_origen?: number | null;
          idcuenta_destino?: number | null;
          tipo: string;
          valor?: number | null;
        };
        Update: {
          descripcion?: string | null;
          estado?: boolean | null;
          fecha?: string | null;
          id?: number;
          idcategoria?: number | null;
          idcuenta?: number | null;
          idcuenta_origen?: number | null;
          idcuenta_destino?: number | null;
          tipo?: string;
          valor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "movimientos_idcategoria_fkey";
            columns: ["idcategoria"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimientos_idcuenta_fkey";
            columns: ["idcuenta"];
            isOneToOne: false;
            referencedRelation: "cuenta";
            referencedColumns: ["id"];
          },
        ];
      };
      usuarios: {
        Row: {
          foto: string | null;
          id: number;
          idauth_supabase: string | null;
          moneda: string | null;
          nombres: string;
          pais: string | null;
          tema: string | null;
        };
        Insert: {
          foto?: string | null;
          id?: number;
          idauth_supabase?: string | null;
          moneda?: string | null;
          nombres: string;
          pais?: string | null;
          tema?: string | null;
        };
        Update: {
          foto?: string | null;
          id?: number;
          idauth_supabase?: string | null;
          moneda?: string | null;
          nombres?: string;
          pais?: string | null;
          tema?: string | null;
        };
        Relationships: [];
      };
      resumen_mensual_cuentas: {
        Row: {
          balance: number | null;
          gastos: number | null;
          id: number;
          idcuenta: number | null;
          idusuario: number | null;
          ingresos: number | null;
          mes: number;
          anio: number;
        };
        Insert: {
          balance?: number | null;
          gastos?: number | null;
          id?: number;
          idcuenta?: number | null;
          idusuario?: number | null;
          ingresos?: number | null;
          mes: number;
          anio: number;
        };
        Update: {
          balance?: number | null;
          gastos?: number | null;
          id?: number;
          idcuenta?: number | null;
          idusuario?: number | null;
          ingresos?: number | null;
          mes?: number;
          anio?: number;
        };
        Relationships: [
          {
            foreignKeyName: "resumen_mensual_cuentas_idcuenta_fkey";
            columns: ["idcuenta"];
            isOneToOne: false;
            referencedRelation: "cuenta";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resumen_mensual_cuentas_idusuario_fkey";
            columns: ["idusuario"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      mmovimientosmesanio: {
        Args: {
          anio: number;
          mes: number;
          iduser: number;
          tipocategoria: string;
        };
        Returns: {
          id: number;
          descripcion: string;
          valor: number;
          fecha: string;
          estado: boolean;
          idcuenta: number | null;
          cuenta: string;
          idcategoria: number | null;
          categoria: string;
          valorymoneda: string;
          idcuenta_origen: number | null;
          cuenta_origen: string | null;
          idcuenta_destino: number | null;
          cuenta_destino: string | null;
        }[];
      };
      mmovimientosmesanio_all: {
        Args: {
          anio: number;
          mes: number;
          iduser: string;
        };
        Returns: {
          id: string;
          fecha: string;
          descripcion: string;
          cuenta: string;
          categoria: string;
          tipocategoria: string;
          estado: boolean;
          monto: number;
        }[];
      };
      mmovimientosmesaniotop5: {
        Args: {
          anio: number;
          mes: number;
          iduser: number;
        };
        Returns: {
          total: number;
          descripcion: string;
          valormoneda: string;
        }[];
      };
      rptmovimientos_anio_mes: {
        Args: {
          anio: number;
          mes: number;
          iduser: number;
          tipocategoria?: string;
        };
        Returns: {
          total: number;
          descripcion: string;
          icono: string;
          color: string;
        }[];
      };
      rptmovimientos_anio_mes_json: {
        Args: {
          anio: number;
          mes: number;
          iduser: number;
          tipocategoria?: string;
        };
        Returns: {
          i: {
            total: number;
            descripcion: string;
            icono: string;
            color: string;
          }[];
          g: {
            total: number;
            descripcion: string;
            icono: string;
            color: string;
          }[];
        };
      };
      fn_obtener_saldo_cuenta_a_fecha: {
        Args: {
          p_idcuenta: number;
          p_fecha: string;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"] : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"] : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"] : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
