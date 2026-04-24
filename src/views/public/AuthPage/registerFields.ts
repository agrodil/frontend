import type { FormField } from "../../../interfaces/components/FormProps";
import { townships } from "../../../constants/townships";

export const registerFields: FormField[] = [
  {
    name: "first_name",
    type: "text",
    placeholder: "Nombre",
    required: true,
  },
  { name: "middle_name", type: "text", placeholder: "Segundo Nombre" },
  {
    name: "surname",
    type: "text",
    placeholder: "Apellido",
    required: true,
  },
  { name: "second_surname", type: "text", placeholder: "Segundo Apellido" },
  {
    name: "document_type",
    type: "select",
    placeholder: "Cédula de Identidad / RIF",
    options: [
      { label: "V – Venezolano", value: "V" },
      { label: "J – Jurídico", value: "J" },
    ],
    required: true,
  },
  {
    name: "document_number",
    type: "text",
    placeholder: "Número de documento",
    required: true,
  },
  {
    name: "township_id",
    type: "select",
    placeholder: "Municipio",
    options: townships,
    required: true,
  },
  { name: "phone", type: "tel", placeholder: "Teléfono (ej: 4129968751)", required: true },
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
    name: "confirmPassword",
    type: "password",
    placeholder: "Confirmar contraseña",
    required: true,
  },
  {
    name: "remember_me",
    type: "checkbox",
    checkboxLabel: "Recordarme",
  },
];
