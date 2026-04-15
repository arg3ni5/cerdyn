import { z } from 'zod';

// Base Movimiento schema
export const movimientoSchema = z.object({
  id: z.number().int().positive(),
  descripcion: z.string().nullable(),
  tipo: z.string(),
  valor: z.number().nullable(),
  fecha: z.string().nullable(),
  estado: z.boolean().nullable(),
  idcategoria: z.number().int().positive().nullable(),
  idcuenta: z.number().int().positive().nullable(),
  idcuenta_origen: z.number().int().positive().nullable().optional(),
  idcuenta_destino: z.number().int().positive().nullable().optional(),
});
const tipoEnum = ['i', 'g', 't'] as const;
// Schema for inserting a new Movimiento
export const movimientoInsertSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(200, 'La descripción no puede exceder 200 caracteres').nullable().optional(),
  tipo: z.enum(tipoEnum).default('i'),
  valor: z.number()
    .positive('El valor debe ser un número positivo')
    .nullable()
    .optional(),
  fecha: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD')
    .or(z.string().datetime({ message: 'La fecha debe ser una fecha válida en formato ISO' }))
    .nullable()
    .optional(),
  estado: z.boolean(),
  idcategoria: z.number().int().positive('El ID de categoría debe ser un número positivo').nullable().optional(),
  idcuenta: z.number().int().positive('El ID de cuenta debe ser un número positivo').nullable().optional(),
  idcuenta_origen: z.number().int().positive('El ID de cuenta origen debe ser un número positivo').nullable().optional(),
  idcuenta_destino: z.number().int().positive('El ID de cuenta destino debe ser un número positivo').nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === 't') {
    if (!data.idcuenta_origen) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La cuenta origen es requerida para transferencias', path: ['idcuenta_origen'] });
    }
    if (!data.idcuenta_destino) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La cuenta destino es requerida para transferencias', path: ['idcuenta_destino'] });
    }
    if (data.idcuenta_origen && data.idcuenta_destino && data.idcuenta_origen === data.idcuenta_destino) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La cuenta origen y destino deben ser diferentes', path: ['idcuenta_destino'] });
    }
  }
});

// Schema for updating a Movimiento
export const movimientoUpdateSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(200, 'La descripción no puede exceder 200 caracteres').nullable().optional(),
  tipo: z.enum(tipoEnum).optional(),
  valor: z.number()
    .positive('El valor debe ser un número positivo')
    .nullable()
    .optional(),
  fecha: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD')
    .or(z.string().datetime({ message: 'La fecha debe ser una fecha válida en formato ISO' }))
    .nullable()
    .optional(),
  estado: z.boolean().optional(),
  idcategoria: z.number().int().positive().nullable().optional(),
  idcuenta: z.number().int().positive().nullable().optional(),
  idcuenta_origen: z.number().int().positive().nullable().optional(),
  idcuenta_destino: z.number().int().positive().nullable().optional(),
});

// Type exports
export type MovimientoSchema = z.infer<typeof movimientoSchema>;
export type MovimientoInsertSchema = z.infer<typeof movimientoInsertSchema>;
export type MovimientoUpdateSchema = z.infer<typeof movimientoUpdateSchema>;
