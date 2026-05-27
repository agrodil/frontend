import type { FormField } from "@/interfaces/components/ui/FormProps";
import type { PostDetail } from "@/interfaces/api/posts/PostDetail.interface";

export const buildEditFields = (post: PostDetail): FormField[] => [
  {
    name: "livestockPostName",
    type: "text",
    label: "Nombre del post",
    required: true,
    defaultValue: post.livestock_post_name,
  },
  {
    name: "sex",
    type: "select",
    label: "Sexo",
    required: true,
    defaultValue: post.sex,
    options: [
      { label: "Macho", value: "M" },
      { label: "Hembra", value: "F" },
    ],
  },
  {
    name: "quantity",
    type: "number",
    label: "Cantidad",
    required: true,
    defaultValue: String(post.quantity ?? ""),
  },
  ...(post.sale_type_id === 1
    ? [
        {
          name: "avgWeightKg",
          type: "number" as const,
          label: "Peso promedio (kg)",
          required: true,
          defaultValue:
            post.avg_weight_kg != null ? String(post.avg_weight_kg) : "",
        },
        {
          name: "pricePerKg",
          type: "number" as const,
          label: "Precio por kg (US$)",
          required: true,
          defaultValue:
            post.price_per_kg != null ? String(post.price_per_kg) : "",
        },
      ]
    : [
        {
          name: "pricePerUnit",
          type: "number" as const,
          label: "Precio por unidad (US$)",
          required: true,
          defaultValue:
            post.price_per_unit != null ? String(post.price_per_unit) : "",
        },
      ]),
  {
    name: "details",
    type: "textarea",
    label: "Descripción",
    defaultValue: post.details ?? "",
  },
];
