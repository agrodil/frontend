import { townships } from "@/shared/constants/townships.catalog";
import type { User } from "@/adapters/contexts/AuthProps";
import type { FormField } from "@/presentation/interfaces/ui/FormProps";

/**
 * Obtiene el value del municipio para el select basado en el ID del usuario
 * Busca en la constante townships y retorna el value como string
 */
const getTownshipSelectValue = (user: User): string => {
  const townshipId = user.townshipId ?? user.township_id;
  if (!townshipId) return "";

  const township = townships.find((t) => t.value === Number(townshipId));
  return township ? String(township.value) : "";
};

export const buildProfileFields = (
  user: User,
  filters?: string[],
): FormField[] => {
  const fields: FormField[] = [
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
    {
      name: "townshipId",
      type: "select",
      placeholder: "Municipio",
      options: townships.map((t) => ({
        label: t.label,
        value: t.value.toString(),
      })),
      required: true,
      defaultValue: getTownshipSelectValue(user),
    },
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

  return fields.filter((field) => !filters || !filters.includes(field.name));
};
