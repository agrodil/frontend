import type {
  FormField,
  SelectOption,
} from "@/presentation/interfaces/ui/FormProps";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";
import {
  POST_CATEGORY,
  isLivestockCategory,
} from "@/shared/utils/resolvePostPricing";

// Paso 1 — datos generales: qué se publica y, si es ganado, rubro + tipo de
// venta (ambos deciden qué campos particulares pide el paso 2).
export const buildStep1Fields = (
  categories: SelectOption[],
  livestockSectors: SelectOption[],
): FormField[] => [
  {
    name: "postCategoryId",
    label: "¿Qué quieres publicar?",
    placeholder: "Selecciona una categoría",
    type: "select",
    required: true,
    options: categories,
  },
  {
    name: "postName",
    label: "Título de la publicación",
    placeholder: "Ingrese el título de la publicación",
    type: "text",
    required: true,
  },
  {
    name: "livestockSectorId",
    label: "Rubro",
    placeholder: "Seleccione el rubro",
    type: "select",
    required: true,
    options: livestockSectors,
    visibleWhen: (v) => isLivestockCategory(Number(v.postCategoryId)),
  },
  {
    name: "saleTypeId",
    label: "Tipo de venta",
    placeholder: "Seleccione el tipo de venta",
    type: "select",
    required: true,
    options: [
      { value: 1, label: "Por peso" },
      { value: 2, label: "Por unidad de animales" },
    ],
    visibleWhen: (v) => isLivestockCategory(Number(v.postCategoryId)),
  },
];

export const buildStep2Fields = (params: {
  postCategoryId: number;
  saleTypeId: number | null;
  livestockSubcategories: SelectOption[];
}): FormField[] => {
  const { postCategoryId, saleTypeId, livestockSubcategories } = params;
  const fields: FormField[] = [];

  if (isLivestockCategory(postCategoryId)) {
    fields.push(
      {
        name: "sex",
        label: "Sexo",
        placeholder: "Seleccione el sexo del lote",
        type: "select",
        required: true,
        options: SEX_LABEL,
      },
      {
        name: "predominantBreed",
        label: "Raza predominante",
        placeholder: "Ej: Brahman, Mestizo, Cruza Brahman x Cebu",
        type: "text",
        required: true,
      },
    );

    if (postCategoryId === POST_CATEGORY.BOVINO) {
      fields.push({
        name: "postSubcategoryId",
        label: "Tipo de animal",
        placeholder: "Seleccione el tipo de animal",
        type: "select",
        optional: true,
        options: livestockSubcategories,
      });
    }

    fields.push({
      name: "quantity",
      label: "Cantidad",
      placeholder: "Ingrese la cantidad de animales del lote",
      type: "number",
      required: true,
    });

    if (saleTypeId === 1) {
      fields.push(
        {
          name: "avgWeightKg",
          label: "Peso promedio (kg)",
          placeholder: "Ej: 450",
          type: "number",
          required: true,
        },
        {
          name: "pricePerKg",
          label: "Precio (USD $/Kg)",
          placeholder: "Ej: 2.50",
          type: "number",
          required: true,
        },
        {
          name: "priceWeightBasis",
          label: "Base del precio",
          placeholder: "Seleccione la base del precio",
          type: "select",
          required: true,
          options: [
            { value: "Pie", label: "En pie (animal vivo)" },
            { value: "Canal", label: "En canal (animal faenado)" },
          ],
        },
      );
    } else {
      fields.push({
        name: "pricePerUnit",
        label: "Precio (USD)",
        placeholder: "Ej: 1200",
        type: "number",
        required: true,
      });
    }
  } else if (postCategoryId === POST_CATEGORY.MAQUINARIA) {
    fields.push(
      {
        name: "postBrand",
        label: "Marca",
        placeholder: "Ej: John Deere",
        type: "text",
        optional: true,
      },
      {
        name: "pricePerUnit",
        label: "Precio (USD)",
        placeholder: "Ej: 1200",
        type: "number",
        required: true,
      },
    );
  } else if (postCategoryId === POST_CATEGORY.FINCAS) {
    fields.push(
      {
        name: "farmHectares",
        label: "Hectáreas",
        placeholder: "Ej: 50",
        type: "number",
        required: true,
      },
      {
        name: "pricePerHectare",
        label: "Precio por hectárea (USD)",
        placeholder: "Ej: 1200",
        type: "number",
        required: true,
      },
    );
  } else if (postCategoryId === POST_CATEGORY.INSUMOS) {
    fields.push({
      name: "pricePerUnit",
      label: "Precio (USD)",
      placeholder: "Ej: 1200",
      type: "number",
      required: true,
    });
  }

  fields.push(
    {
      name: "details",
      label: "Detalles",
      placeholder: "Agrega detalles adicionales",
      type: "textarea",
      required: false,
    },
    {
      name: "media",
      label: "Fotos y videos",
      placeholder: "Agregar",
      type: "media",
      required: true,
      accept: "image/*,video/*",
      maxFiles: 10,
    },
  );

  return fields;
};
