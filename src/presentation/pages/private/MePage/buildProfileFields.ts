import { states } from "@/shared/constants/state.catalog";
import {
  TOWNSHIP_BY_ID,
  townshipsByState,
} from "@/shared/constants/townships.catalog";
import type { User } from "@/adapters/contexts/AuthProps";
import type { FormField } from "@/presentation/interfaces/ui/FormProps";

/**
 * Resuelve el municipio del usuario contra el catálogo. Devuelve los values ya
 * como string porque el <select> de Form compara siempre contra strings del DOM.
 * Si el id no está en el catálogo ambos quedan vacíos y el usuario re-selecciona.
 */
const getLocationSelectValues = (
  user: User,
): { stateId: string; townshipId: string } => {
  const townshipId = user.townshipId ?? user.township_id;
  const township = townshipId ? TOWNSHIP_BY_ID[Number(townshipId)] : undefined;

  return township
    ? { stateId: String(township.stateId), townshipId: String(township.id) }
    : { stateId: "", townshipId: "" };
};

export const buildProfileFields = (
  user: User,
  filters?: string[],
): FormField[] => {
  const location = getLocationSelectValues(user);

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
      name: "stateId",
      type: "select",
      placeholder: "Estado",
      options: states,
      required: true,
      defaultValue: location.stateId,
    },
    {
      name: "townshipId",
      type: "select",
      placeholder: "Municipio",
      required: true,
      defaultValue: location.townshipId,
      optionsFrom: {
        fieldName: "stateId",
        getOptions: (stateId) => townshipsByState[Number(stateId)] ?? [],
        emptyPlaceholder: "Selecciona primero un estado",
      },
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
