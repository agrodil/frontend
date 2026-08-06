import type {
  FormField,
  SelectOption,
} from "@/presentation/interfaces/ui/FormProps";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";
import { POST_CATEGORY } from "@/shared/utils/resolvePostPricing";

// Un solo listado de campos para las 4 categorías: cada campo se muestra según
// `dependsOn`/`visibleWhen` sobre `postCategoryId` (y, para Ganado Bovino,
// también sobre `saleTypeId`). Form.tsx limpia en cascada el valor de un campo
// apenas deja de ser visible, así que no hace falta reconstruir este array por
// categoría — cambiar de categoría ya vacía los campos de la anterior.
export const buildNewPostFields = (
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

  // ---- Ganado Bovino ----
  {
    name: "livestockSectorId",
    label: "Rubro",
    placeholder: "Seleccione el rubro",
    type: "select",
    required: true,
    options: livestockSectors,
    dependsOn: {
      fieldName: "postCategoryId",
      value: POST_CATEGORY.GANADO_BOVINO,
    },
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
    dependsOn: {
      fieldName: "postCategoryId",
      value: POST_CATEGORY.GANADO_BOVINO,
    },
  },
  {
    name: "sex",
    label: "Sexo",
    placeholder: "Seleccione el sexo del lote",
    type: "select",
    required: true,
    options: SEX_LABEL,
    dependsOn: {
      fieldName: "postCategoryId",
      value: POST_CATEGORY.GANADO_BOVINO,
    },
  },
  {
    name: "postSubcategoryName",
    label: "Raza predominante",
    placeholder: "Ej: Brahman, Mestizo, Cruza Brahman x Cebu",
    type: "text",
    required: true,
    dependsOn: {
      fieldName: "postCategoryId",
      value: POST_CATEGORY.GANADO_BOVINO,
    },
  },
  {
    name: "quantity",
    label: "Cantidad",
    placeholder: "Ingrese la cantidad de animales del lote",
    type: "number",
    required: true,
    dependsOn: {
      fieldName: "postCategoryId",
      value: POST_CATEGORY.GANADO_BOVINO,
    },
  },
  // Ganado Bovino (tipo de venta "por peso") o Minerales (peso por saco).
  // Condición compuesta → visibleWhen, no dependsOn.
  {
    name: "avgWeightKg",
    label: "Peso promedio (kg)",
    placeholder: "Ej: 450",
    type: "number",
    required: true,
    visibleWhen: (v) =>
      (v.postCategoryId === String(POST_CATEGORY.GANADO_BOVINO) &&
        v.saleTypeId === "1") ||
      v.postCategoryId === String(POST_CATEGORY.MINERALES),
  },
  {
    name: "pricePerKg",
    label: "Precio (USD $/Kg)",
    placeholder: "Ej: 2.50",
    type: "number",
    required: true,
    dependsOn: { fieldName: "saleTypeId", value: 1 },
  },

  // ---- Maquinarias e Implementos ----
  {
    name: "postBrand",
    label: "Marca",
    placeholder: "Ej: John Deere",
    type: "text",
    optional: true,
    dependsOn: {
      fieldName: "postCategoryId",
      value: POST_CATEGORY.MAQUINARIA,
    },
  },

  // Precio plano: Ganado Bovino con tipo de venta "por unidad", o Maquinaria,
  // Insumos u Otros, o Minerales (precio por saco). Condición compuesta →
  // visibleWhen, no dependsOn.
  {
    name: "pricePerUnit",
    label: "Precio (USD)",
    placeholder: "Ej: 1200",
    type: "number",
    required: true,
    visibleWhen: (v) =>
      v.postCategoryId === String(POST_CATEGORY.MAQUINARIA) ||
      v.postCategoryId === String(POST_CATEGORY.INSUMOS) ||
      v.postCategoryId === String(POST_CATEGORY.MINERALES) ||
      (v.postCategoryId === String(POST_CATEGORY.GANADO_BOVINO) &&
        v.saleTypeId === "2"),
  },

  // ---- Fincas ----
  {
    name: "farmHectares",
    label: "Hectáreas",
    placeholder: "Ej: 50",
    type: "number",
    required: true,
    dependsOn: { fieldName: "postCategoryId", value: POST_CATEGORY.FINCAS },
  },
  {
    name: "pricePerHectare",
    label: "Precio por hectárea (USD)",
    placeholder: "Ej: 1200",
    type: "number",
    required: true,
    dependsOn: { fieldName: "postCategoryId", value: POST_CATEGORY.FINCAS },
  },

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
];
