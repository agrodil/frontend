import { breeds } from "../../../constants/breeds";
import { sectors } from "../../../constants/sectors";
import { sexes } from "../../../constants/sex";
import type { FormField } from "../../../interfaces/components/FormProps";

export const newPostFormFields: FormField[] = [
  {
    name: "livestockPostName",
    label: "Título de la publicación",
    placeholder: "Ingrese el título de la publicación",
    type: "text",
    required: true,
  },
  {
    name: "sectorId",
    label: "Sector",
    placeholder: "Seleccione el sector",
    type: "select",
    required: true,
    options: sectors,
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
  },
  {
    name: "sex",
    label: "Sexo",
    placeholder: "Seleccione el sexo del lote",
    type: "select",
    required: true,
    options: sexes,
  },
  {
    name: "breed",
    label: "Raza",
    placeholder: "Ingrese la raza del lote",
    type: "select",
    required: true,
    options: breeds,
  },
  {
    name: "avgWeightKg",
    label: "Peso promedio (kg)",
    placeholder: "Ej: 450",
    type: "number",
    required: true,
    dependsOn: { fieldName: "saleTypeId", value: "1" },
  },
  {
    name: "pricePerKg",
    label: "Precio por kg",
    placeholder: "Ej: 2.50",
    type: "number",
    required: true,
    dependsOn: { fieldName: "saleTypeId", value: "1" },
  },
  {
    name: "pricePerUnit",
    label: "Precio por unidad",
    placeholder: "Ej: 1200",
    type: "number",
    required: true,
    dependsOn: { fieldName: "saleTypeId", value: "2" },
  },
  {
    name: "quantity",
    label: "Cantidad",
    placeholder: "Ingrese la cantidad de animales del lote",
    type: "number",
    required: true,
  },
  {
    name: "details",
    label: "Detalles",
    placeholder: "Agrega detalles adicionales sobre el lote",
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
