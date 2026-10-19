import { z } from "zod";
import { passwordSchema } from "@/shared/utils/passwordPolicy";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });
