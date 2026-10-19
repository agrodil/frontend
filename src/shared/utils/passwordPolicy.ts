import { z } from "zod";

// AUT-08: debe coincidir con agrodil-backend/src/common/password.policy.ts.
// Mínimo 8 caracteres, con mayúscula, minúscula, número y un carácter especial.
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/\p{Lu}/u, "Debe incluir al menos una mayúscula")
  .regex(/\p{Ll}/u, "Debe incluir al menos una minúscula")
  .regex(/\p{N}/u, "Debe incluir al menos un número")
  .regex(
    /[^\p{L}\p{N}\s]/u,
    "Debe incluir al menos un carácter especial (por ejemplo ! @ # $ %)",
  );

export const PASSWORD_HINT = "Mín. 8, mayúscula, minúscula, número y símbolo";
