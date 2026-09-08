import type { FormField } from "@/presentation/interfaces/ui/FormProps";
import { BANK_ACCOUNT_TYPE_OPTIONS } from "@/shared/constants/bank-account-type.catalog";

// Campos condicionales por account_type (dependsOn = igualdad simple).
//   mobile_payment → teléfono + cédula + código de banco
//   transfer       → número de cuenta
export const bankAccountFields: FormField[] = [
  {
    name: "account_type",
    type: "select",
    label: "Tipo de cuenta",
    options: BANK_ACCOUNT_TYPE_OPTIONS.map((o) => ({
      label: o.label,
      value: o.value,
    })),
    required: true,
    defaultValue: "mobile_payment",
  },
  {
    name: "account_name",
    type: "text",
    label: "Titular",
    placeholder: "Nombre del titular",
    required: true,
  },
  {
    name: "bank_name",
    type: "text",
    label: "Banco",
    placeholder: "Ej: Mercantil",
    optional: true,
  },
  {
    name: "phone_number",
    type: "tel",
    label: "Teléfono",
    placeholder: "04121234567",
    dependsOn: { fieldName: "account_type", value: "mobile_payment" },
  },
  {
    name: "cedula",
    type: "text",
    label: "Cédula / RIF",
    placeholder: "V-12345678",
    dependsOn: { fieldName: "account_type", value: "mobile_payment" },
  },
  {
    name: "bank_code",
    type: "text",
    label: "Código de banco (4 dígitos)",
    placeholder: "0105",
    dependsOn: { fieldName: "account_type", value: "mobile_payment" },
  },
  {
    name: "account_number",
    type: "text",
    label: "Número de cuenta",
    placeholder: "01050000000000000000",
    dependsOn: { fieldName: "account_type", value: "transfer" },
  },
];
