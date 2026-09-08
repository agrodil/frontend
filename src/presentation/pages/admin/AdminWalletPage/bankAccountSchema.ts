import { z } from "zod";

// Coincide con CreateBankAccountDto del backend. Los campos condicionales se
// exigen según account_type vía superRefine.
export const bankAccountSchema = z
  .object({
    account_type: z.enum(["mobile_payment", "transfer"]),
    account_name: z
      .string()
      .min(1, "El titular es requerido")
      .max(100, "Máximo 100 caracteres"),
    bank_name: z.string().max(50, "Máximo 50 caracteres").optional(),
    phone_number: z.string().optional(),
    cedula: z.string().optional(),
    bank_code: z.string().optional(),
    account_number: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.account_type === "mobile_payment") {
      if (!/^\+?\d{10,15}$/.test(v.phone_number ?? "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone_number"],
          message: "Teléfono inválido (10 a 15 dígitos)",
        });
      }
      if (!v.cedula || v.cedula.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cedula"],
          message: "Cédula / RIF requerido (máx. 15)",
        });
      }
      if (!/^\d{4}$/.test(v.bank_code ?? "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bank_code"],
          message: "El código de banco debe tener 4 dígitos",
        });
      }
    } else {
      if (!/^\d{10,20}$/.test(v.account_number ?? "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["account_number"],
          message: "Número de cuenta inválido (10 a 20 dígitos)",
        });
      }
    }
  });
