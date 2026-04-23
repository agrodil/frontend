import type { FormField } from "../../../interfaces/components/FormProps";

export const verifyFields: FormField[] = [
  {
    name: "code",
    type: "text",
    placeholder: "Código de 6 dígitos",
    required: true,
  },
];
