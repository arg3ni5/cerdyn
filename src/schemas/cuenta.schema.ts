import { z } from 'zod';

// Base Cuenta schema
export const cuentaSchema = z.object({
  id: z.number().int().positive(),
  descripcion: z.string().min(1, 'La descripción es requerida').max(100, 'La descripción no puede exceder 100 caracteres'),
  icono: z.string().nullable(),
  tipo: z.string().nullable(),
  subtipo: z.string().nullable().optional(),
  idusuario: z.number().int().positive().nullable(),
  saldo_actual: z.number().nullable(),
  limite_credito: z.number().nullable().optional(),
  dia_corte: z.number().int().min(1).max(31).nullable().optional(),
  dia_pago: z.number().int().min(1).max(31).nullable().optional(),
  tasa_interes: z.number().nullable().optional(),
  pago_minimo_config: z.number().nullable().optional()
});

// Schema for inserting a new Cuenta
export const cuentaInsertSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(100, 'La descripción no puede exceder 100 caracteres'),
  icono: z.string().nullable().optional(),
  tipo: z.string().min(1, 'El tipo es requerido').nullable(),
  subtipo: z.string().nullable().optional(),
  idusuario: z.number().int().positive('El ID de usuario debe ser un número positivo').nullable().optional(),
  saldo_actual: z.number().finite('El saldo debe ser un número válido').nullable().optional().default(0),
  limite_credito: z.number().finite('El límite de crédito debe ser un número válido').positive('El límite de crédito debe ser mayor a cero').nullable().optional(),
  dia_corte: z.number().int('El día de corte debe ser entero').min(1, 'El día de corte debe estar entre 1 y 31').max(31, 'El día de corte debe estar entre 1 y 31').nullable().optional(),
  dia_pago: z.number().int('El día de pago debe ser entero').min(1, 'El día de pago debe estar entre 1 y 31').max(31, 'El día de pago debe estar entre 1 y 31').nullable().optional(),
  tasa_interes: z.number().finite('La tasa de interés debe ser un número válido').min(0, 'La tasa de interés no puede ser negativa').nullable().optional(),
  pago_minimo_config: z.number().finite('El pago mínimo debe ser un número válido').min(0, 'El pago mínimo no puede ser negativo').nullable().optional()
}).superRefine((data, ctx) => {
  if (data.tipo === 'c' && (data.limite_credito == null || data.limite_credito <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El límite de crédito es requerido para tarjetas',
      path: ['limite_credito']
    });
  }
});

// Schema for updating a Cuenta
export const cuentaUpdateSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(100, 'La descripción no puede exceder 100 caracteres').optional(),
  icono: z.string().nullable().optional(),
  tipo: z.string().nullable().optional(),
  subtipo: z.string().nullable().optional(),
  idusuario: z.number().int().positive().nullable().optional(),
  saldo_actual: z.number().finite('El saldo debe ser un número válido').nullable().optional(),
  limite_credito: z.number().finite('El límite de crédito debe ser un número válido').positive('El límite de crédito debe ser mayor a cero').nullable().optional(),
  dia_corte: z.number().int('El día de corte debe ser entero').min(1, 'El día de corte debe estar entre 1 y 31').max(31, 'El día de corte debe estar entre 1 y 31').nullable().optional(),
  dia_pago: z.number().int('El día de pago debe ser entero').min(1, 'El día de pago debe estar entre 1 y 31').max(31, 'El día de pago debe estar entre 1 y 31').nullable().optional(),
  tasa_interes: z.number().finite('La tasa de interés debe ser un número válido').min(0, 'La tasa de interés no puede ser negativa').nullable().optional(),
  pago_minimo_config: z.number().finite('El pago mínimo debe ser un número válido').min(0, 'El pago mínimo no puede ser negativo').nullable().optional()
});

// Type exports
export type CuentaSchema = z.infer<typeof cuentaSchema>;
export type CuentaInsertSchema = z.infer<typeof cuentaInsertSchema>;
export type CuentaUpdateSchema = z.infer<typeof cuentaUpdateSchema>;
