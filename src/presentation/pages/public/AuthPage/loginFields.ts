import type { FormField } from "@/presentation/interfaces/ui/FormProps";

export const loginFields: FormField[] = [
  {
    name: "email",
    type: "email",
    label: "Correo Electrónico",
    placeholder: "juan@email.com",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Contraseña",
    placeholder: "••••••••",
    required: true,
  },
  {
    name: "remember_me",
    type: "checkbox",
    label: "Recordarme",
  },
];
