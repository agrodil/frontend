import { z } from "zod";

export function normalizeVenezuelanPhone(raw: string): string {
  let phone = raw.replace(/[\s\-]/g, "");
  if (phone.startsWith("+58")) phone = phone.slice(3);
  else if (phone.startsWith("0058")) phone = phone.slice(4);
  else if (phone.startsWith("58") && phone.length === 12) phone = phone.slice(2);
  if (phone.startsWith("0")) phone = phone.slice(1);
  return phone;
}

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
      .min(1, "El nombre es requerido")
      .max(50, "Máximo 50 caracteres"),
    middle_name: z.string().optional(),
    surname: z
      .string()
      .min(1, "El apellido es requerido")
      .max(50, "Máximo 50 caracteres"),
    second_surname: z.string().optional(),
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
        (val) => /^\d{10}$/.test(normalizeVenezuelanPhone(val)),
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
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
