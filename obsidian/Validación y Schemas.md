# Validación y Schemas Zod

Zod es la librería para validar datos de manera type-safe.

Ver: [[Distribución de Carpetas#✅ src/schemas/ - Validación Zod]]

---

## 🎯 Qué es Zod

- Librería de validación de esquemas con TypeScript
- Type-safe: inferir tipos a partir de schemas
- Mensajes de error descriptivos
- Validación en cliente O servidor

---

## 📋 Schemas Disponibles

| Archivo | Propósito |
|---------|----------|
| `usuario.schema.ts` | Validar campos de usuario |
| `cuenta.schema.ts` | Validar cuentas bancarias |
| `categoria.schema.ts` | Validar categorías |
| `movimiento.schema.ts` | Validar movimientos/transacciones |
| `conexion.schema.ts` | Validar conexiones a bancos |

---

## 💡 Ejemplo: Schema de Movimiento

```typescript
// src/schemas/movimiento.schema.ts

import { z } from "zod";

export const MovimientoSchema = z.object({
  id: z.string().uuid().optional(),
  usuario_id: z.string().uuid(),
  cuenta_id: z.string().uuid(),
  categoria_id: z.string().uuid(),

  tipo: z.enum(["ingreso", "egreso"]),
  monto: z.number()
    .positive("Monto debe ser positivo")
    .min(0.01),

  descripcion: z.string().optional(),
  fecha: z.date(),

  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

// Inferir tipo TypeScript del schema
export type Movimiento = z.infer<typeof MovimientoSchema>;

// Schema para input del usuario (sin id, created_at)
export const MovimientoInputSchema = MovimientoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export type MovimientoInput = z.infer<typeof MovimientoInputSchema>;
```

---

## 🔄 Uso en la App

### Validar en Formulario

```typescript
// En componente
const handleSubmit = async (formData: any) => {
  try {
    // Validar con Zod
    const validado = MovimientoSchema.parse(formData);

    // Si llega aquí, es válido
    // TypeScript now knows validado: Movimiento
    await agregarMovimiento(validado);

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Error de validación
      error.errors.forEach(err => {
        console.log(`${err.path}: ${err.message}`);
      });
    }
  }
};
```

### Validar en Store

```typescript
// En MovimientosStore
agregarMovimiento: async (input: MovimientoInput) => {
  // Validar
  const validado = MovimientoInputSchema.parse(input);

  // Enviar a BD
  const { data, error } = await supabase
    .from('movimientos')
    .insert([validado]);

  // ...
}
```

### Validar en Server (Supabase Function)

```typescript
// Function serverless de Supabase
export async function validarMovimiento(movimiento: unknown) {
  const validado = MovimientoSchema.parse(movimiento);
  // Continuar con operación
}
```

---

## 📐 Patrones de Schemas

### Schema Anidado

```typescript
const CuentaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).max(100),
  tipo: z.enum(["banco", "tarjeta", "efectivo"]),
  saldo: z.number().min(0),

  // Nested: Moneda es un objeto
  moneda: z.object({
    codigo: z.string().length(3), // "USD", "MXN"
    simbolo: z.string()
  })
});

type Cuenta = z.infer<typeof CuentaSchema>;
// type Cuenta = {
//   id: string;
//   nombre: string;
//   tipo: "banco" | "tarjeta" | "efectivo";
//   saldo: number;
//   moneda: { codigo: string; simbolo: string };
// }
```

### Schema con Validación Personalizada

```typescript
const CuentaSchema = z.object({
  nombre: z.string()
    .min(1, "Nombre requerido")
    .max(100, "Máximo 100 caracteres"),

  tipo: z.enum(["banco", "tarjeta", "efectivo"], {
    errorMap: () => ({ message: "Tipo inválido" })
  }),

  saldo: z.number()
    .min(0, "Saldo no puede ser negativo")
    .superRefine((val, ctx) => {
      if (val > 1000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Saldo muy alto (máximo 1M)"
        });
      }
    })
});
```

### Schema Condicional

```typescript
const TransferSchema = z.object({
  tipo: z.enum(["transferencia", "deposito"]),
  monto: z.number(),

  // Si tipo === "transferencia", cuentaDestino requerido
  cuentaDestino: z.string().uuid().optional()
}).refine(
  (data) => data.tipo !== "transferencia" || data.cuentaDestino,
  {
    message: "Cuenta destino requerida para transferencias",
    path: ["cuentaDestino"]
  }
);
```

---

## 🔗 Tipos Automáticos

Una gran ventaja de Zod: los tipos se infieren automáticamente.

```typescript
// De aquí
export const CuentaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  saldo: z.number()
});

// Obtienes automáticamente
export type Cuenta = z.infer<typeof CuentaSchema>;

// Es equivalente a escribir:
// type Cuenta = {
//   id: string;
//   nombre: string;
//   saldo: number;
// }

// Y lo mejor: Si cambias el schema, el tipo se actualiza automáticamente
```

---

## 🎯 Mejores Prácticas

### ✅ Qué Hacer

1. **Usar schemas en formularios**
   ```typescript
   const handleSubmit = (data: any) => {
     const validado = CuentaSchema.parse(data);
     // Ahora sabes que data es válido
   };
   ```

2. **Inferir tipos, no escribirlos manualmente**
   ```typescript
   // BIEN
   type Cuenta = z.infer<typeof CuentaSchema>;

   // MAL
   type Cuenta = { id: string, nombre: string, saldo: number };
   ```

3. **Usar omit() para variaciones**
   ```typescript
   // Schema completo
   const CuentaSchema = z.object({...});

   // Sin id para creación
   const CuentaInputSchema = CuentaSchema.omit({ id: true });
   ```

4. **Mensajes de error en español**
   ```typescript
   z.string()
     .min(1, "Campo requerido")
     .max(100, "Máximo 100 caracteres")
   ```

### ❌ Qué Evitar

- ❌ No validar datos del usuario
  - SIEMPRE valida entrada externa

- ❌ Escribir tipos manualmente si tienes schema
  ```typescript
  // ❌ MAL - Duplicación
  const CuentaSchema = z.object({...});
  type Cuenta = { id: string; ... };  // Igual al schema!

  // ✅ BIEN
  const CuentaSchema = z.object({...});
  type Cuenta = z.infer<typeof CuentaSchema>;
  ```

- ❌ No usar Try/Catch con parse()
  ```typescript
  // MAL - Crash si datos inválidos
  const validado = schema.parse(data);

  // BIEN - Manejo de errores
  const result = schema.safeParse(data);
  if (!result.success) {
    console.log(result.error.errors);
  } else {
    // result.data es válido
  }
  ```

---

## 🆚 parse() vs safeParse()

```typescript
// parse() - Lanza excepción si inválido
try {
  const validado = MovimientoSchema.parse(data);
} catch (error) {
  // Error si datos inválidos
}

// safeParse() - Retorna objeto con status
const result = MovimientoSchema.safeParse(data);

if (result.success) {
  const validado = result.data;    // Datos válidos
  // Continuar
} else {
  const errores = result.error.errors;
  // Mostrar errores
  errores.forEach(err => {
    console.log(`${err.path}: ${err.message}`);
  });
}
```

---

## 📝 Flujo Típico con Validación

```
Usuario Completa Formulario
           ↓
Click "Guardar"
           ↓
try {
  validado = InputSchema.parse(formData)
           ↓
  await agregarMovimiento(validado)
} catch (error instanceof ZodError) {
  showErrorMessages(error.errors)
           ↓
  Usuario ve errores en formulario
           ↓
  Arregla y intenta de nuevo
}
           ↓
Si validación ÉXITO:
  await agregarMovimiento(validado)
           ↓
  Store envía a Supabase
           ↓
  BD rechaza si constraints fallan
           ↓
  Mostrar error si aplica
```

---

## 🔗 Relaciones de Notas

- [[Supabase y CRUD]] - validar antes de INSERT
- [[Componentes]] - uso en formularios
- [[Stores Zustand]] - validar en acciones
- [[Stack Tecnológico]] - Zod en tech stack
- [[Flujo de Datos]] - validación en el flujo
