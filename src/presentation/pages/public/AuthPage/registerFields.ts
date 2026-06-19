import type { FormField } from "@/presentation/interfaces/ui/FormProps";
import { townships } from "@/shared/constants/townships.catalog";

export const registerFields: FormField[] = [
  {
    name: "document_type",
    type: "select",
    label: "Tipo de Documento",
    options: [
      { label: "V – Venezolano", value: "V" },
      { label: "J – Jurídico", value: "J" },
    ],
    defaultValue: "V",
    required: true,
  },
  {
    name: "document_number",
    type: "text",
    label: "Número de Documento",
    placeholder: "30217530",
    required: true,
  },
  {
    name: "names",
    type: "text",
    label: "Nombres",
    placeholder: "Juan Carlos",
    required: true,
    dependsOn: { fieldName: "document_type", value: "V" },
  },
  {
    name: "surnames",
    type: "text",
    label: "Apellidos",
    placeholder: "Pérez Vera",
    required: true,
    dependsOn: { fieldName: "document_type", value: "V" },
  },
  {
    name: "company_name",
    type: "text",
    label: "Nombre de la Empresa",
    placeholder: "Mi Empresa S.A.",
    required: true,
    dependsOn: { fieldName: "document_type", value: "J" },
  },
  {
    name: "township_id",
    type: "select",
    label: "Municipio",
    options: townships,
    required: true,
  },
  {
    name: "phone",
    type: "tel",
    label: "Teléfono",
    placeholder: "4129968751",
    required: true,
  },
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
    name: "confirmPassword",
    type: "password",
    label: "Confirmar Contraseña",
    placeholder: "••••••••",
    required: true,
  },
  {
    name: "remember_me",
    type: "checkbox",
    label: "Recordarme",
  },
];
