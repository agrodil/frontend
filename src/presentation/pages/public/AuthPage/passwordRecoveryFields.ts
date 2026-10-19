import type { FormField } from "@/presentation/interfaces/ui/FormProps";
import { PASSWORD_HINT } from "@/shared/utils/passwordPolicy";

export const forgotPasswordFields: FormField[] = [
  {
    name: "email",
    type: "email",
    label: "Correo Electrónico",
    placeholder: "juan@email.com",
    required: true,
  },
];

export const resetPasswordFields: FormField[] = [
  {
    name: "code",
    type: "text",
    label: "Código de Recuperación",
    placeholder: "123456",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Nueva Contraseña",
    placeholder: PASSWORD_HINT,
    required: true,
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirmar Nueva Contraseña",
    placeholder: "••••••••",
    required: true,
  },
];
