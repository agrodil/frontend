import { formatPhone } from "@/shared/utils/formatPhone";
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .max(50, "Máximo 50 caracteres")
      .optional()
      .or(z.literal("")),
    middle_name: z
      .string()
      .max(50, "Máximo 50 caracteres")
      .optional()
      .or(z.literal("")),
    surname: z
      .string()
      .max(50, "Máximo 50 caracteres")
      .optional()
      .or(z.literal("")),
    second_surname: z
      .string()
      .max(50, "Máximo 50 caracteres")
      .optional()
      .or(z.literal("")),
    company_name: z
      .string()
      .max(50, "Máximo 50 caracteres")
      .optional()
      .or(z.literal("")),
    document_type: z.string().min(1, "Selecciona el tipo de documento"),
    document_number: z
      .string()
      .min(1, "El número de documento es requerido")
      .regex(/^\d+$/, "Solo se permiten números"),
    township_id: z.string().min(1, "Selecciona un municipio"),
    phone: z
      .string()
      .min(1, "El teléfono es requerido")
      .refine(
        (val) => /^\d{10}$/.test(formatPhone(val)),
        "Ingresa 10 dígitos sin código de país (ej: 4129968751)",
      ),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Correo electrónico inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }

    if (data.document_type === "J") {
      if (!data.company_name || data.company_name.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "El nombre de la empresa es requerido",
          path: ["company_name"],
        });
      }
    } else if (data.document_type === "V") {
      if (!data.first_name || data.first_name.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "El nombre es requerido",
          path: ["first_name"],
        });
      }
      if (!data.surname || data.surname.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "El apellido es requerido",
          path: ["surname"],
        });
      }
    }
  });
