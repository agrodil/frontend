// import { townships } from "../../../constants/townships";
import type { User } from "../../../interfaces/auth/AuthProps";
import type { FormField } from "../../../interfaces/components/FormProps";

export const buildProfileFields = (user: User): FormField[] => [
  {
    name: "firstName",
    type: "text",
    placeholder: "Nombre",
    required: true,
    defaultValue: user.firstName ?? "",
  },
  {
    name: "middleName",
    type: "text",
    placeholder: "Segundo Nombre",
    defaultValue: user.middleName ?? "",
  },
  {
    name: "lastName",
    type: "text",
    placeholder: "Apellido",
    required: true,
    defaultValue: user.lastName ?? "",
  },
  {
    name: "secondLastName",
    type: "text",
    placeholder: "Segundo Apellido",
    defaultValue: user.secondLastName ?? "",
  },
  // {
  //   name: "municipality",
  //   type: "select",
  //   placeholder: "Municipio",
  //   options: townships.map((t) => ({
  //     label: t.label,
  //     value: t.value.toString(),
  //   })),
  //   required: true,
  //   defaultValue: user.municipality ?? "",
  // },
  {
    name: "phone",
    type: "tel",
    placeholder: "Teléfono",
    required: true,
    defaultValue: user.phone ?? "",
  },
  {
    name: "email",
    type: "email",
    placeholder: "Correo electrónico",
    required: true,
    defaultValue: user.email,
  },
  {
    name: "password",
    type: "password",
    placeholder: "Nueva contraseña (opcional)",
  },
  {
    name: "confirmPassword",
    type: "password",
    placeholder: "Confirmar nueva contraseña",
  },
];
