import type { FormField } from "../../../interfaces/components/FormProps";

export const verifyFields: FormField[] = [
  {
    name: "code",
    type: "text",
    label: "Código de Verificación",
    placeholder: "123456",
    required: true,
  },
];
