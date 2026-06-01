import { sectors } from "@/shared/constants/sectors.catalog";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";
import { buildSchema } from "@minusui/form";
import type { FormField } from "@minusui/form";

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
    label: "Rubro",
    placeholder: "Seleccione el rubro",
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
    options: SEX_LABEL,
  },
  {
    name: "breed",
    label: "Raza predominante",
    placeholder: "Ej: Brahman, Mestizo, Cruza Brahman x Cebu",
    type: "text",
    required: true,
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

// NOTE: Los campos condicionales (avgWeightKg, pricePerKg, pricePerUnit) NO se
// declaran aquí como `required`. MinusForm aborta el submit si el schema falla en
// CUALQUIER campo, incluso uno oculto por `dependsOn`. Un `required` estático sobre
// un campo oculto deja el botón habilitado pero bloquea onSubmit silenciosamente.
// Su validación se hace condicionalmente en buildFormData (NewPostPage).
export const newPostSchema = buildSchema({
  livestockPostName: { required: "El título es requerido" },
  sectorId: { required: "El rubro es requerido" },
  saleTypeId: { required: "El tipo de venta es requerido" },
  sex: { required: "El sexo es requerido" },
  breed: { required: "La raza predominante es requerida" },
  quantity: { required: "La cantidad es requerida" },
  media: { required: "Debes agregar al menos una foto o video" },
});
