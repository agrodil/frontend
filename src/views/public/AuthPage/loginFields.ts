import type { FormField } from "../../../interfaces/components/FormProps";

export const loginFields: FormField[] = [
  {
    name: "email",
    type: "email",
    placeholder: "Correo electrónico",
    required: true,
  },
  {
    name: "password",
    type: "password",
    placeholder: "Contraseña",
    required: true,
  },
  {
    name: "remember_me",
    type: "checkbox",
    checkboxLabel: "Recordarme",
  },
];
