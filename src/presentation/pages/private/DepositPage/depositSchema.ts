import { z } from "zod";

// Solo campos de texto: el archivo lo valida la página + el hook. Zod ignora
// las claves extra del objeto (receipt_image) por defecto.
export const depositSchema = z.object({
  reference_number: z
    .string()
    .min(1, "La referencia es requerida")
    .max(50, "Máximo 50 caracteres")
    .regex(/^\d+$/, "La referencia debe ser solo números"),
  amount_bs: z
    .string()
    .min(1, "El monto es requerido")
    .regex(/^\d+([.,]\d{1,2})?$/, "Monto inválido (máximo 2 decimales)")
    .refine(
      (v) => Number(v.replace(",", ".")) >= 0.01,
      "El monto debe ser mayor a 0",
    ),
});
