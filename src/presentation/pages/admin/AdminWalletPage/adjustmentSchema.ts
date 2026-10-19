import { z } from "zod";

export const adjustmentSchema = z.object({
  usd_amount: z
    .string()
    .min(1, "El monto es requerido")
    .regex(/^-?\d+([.,]\d{1,2})?$/, "Monto inválido (máximo 2 decimales)")
    .refine(
      (v) => Number(v.replace(",", ".")) !== 0,
      "El monto no puede ser cero",
    ),
  reason: z
    .string()
    .min(1, "El motivo es requerido")
    .max(300, "Máximo 300 caracteres"),
});
