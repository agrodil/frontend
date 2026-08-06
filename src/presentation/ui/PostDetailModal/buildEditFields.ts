import type { FormField } from "@/presentation/interfaces/ui/FormProps";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";
import { POST_CATEGORY } from "@/shared/utils/resolvePostPricing";

// La categoría es inmutable tras la creación (cambiarla invalidaría qué campos
// son válidos/requeridos — ver models/post.sql en agrodil-database). Solo se
// edita el título, la descripción, y los campos propios de la categoría ya
// elegida.
export const buildEditFields = (post: PostDetail): FormField[] => {
  const titleAndDetails: FormField[] = [
    {
      name: "postName",
      type: "text",
      label: "Título",
      required: true,
      defaultValue: post.post_name,
    },
  ];

  const trailingDetails: FormField = {
    name: "details",
    type: "textarea",
    label: "Descripción",
    defaultValue: post.details ?? "",
  };

  switch (post.post_category_id) {
    case POST_CATEGORY.MAQUINARIA:
      return [
        ...titleAndDetails,
        {
          name: "postBrand",
          type: "text",
          label: "Marca",
          optional: true,
          defaultValue: post.post_brand ?? "",
        },
        {
          name: "pricePerUnit",
          type: "number",
          label: "Precio (US$)",
          required: true,
          defaultValue:
            post.price_per_unit != null ? String(post.price_per_unit) : "",
        },
        trailingDetails,
      ];

    case POST_CATEGORY.FINCAS:
      return [
        ...titleAndDetails,
        {
          name: "farmHectares",
          type: "number",
          label: "Hectáreas",
          required: true,
          defaultValue:
            post.farm_hectares != null ? String(post.farm_hectares) : "",
        },
        {
          name: "pricePerHectare",
          type: "number",
          label: "Precio por hectárea (US$)",
          required: true,
          defaultValue:
            post.price_per_hectare != null
              ? String(post.price_per_hectare)
              : "",
        },
        trailingDetails,
      ];

    case POST_CATEGORY.INSUMOS:
      return [
        ...titleAndDetails,
        {
          name: "pricePerUnit",
          type: "number",
          label: "Precio (US$)",
          required: true,
          defaultValue:
            post.price_per_unit != null ? String(post.price_per_unit) : "",
        },
        trailingDetails,
      ];

    case POST_CATEGORY.MINERALES:
      return [
        ...titleAndDetails,
        {
          name: "avgWeightKg",
          type: "number",
          label: "Peso promedio (kg)",
          required: true,
          defaultValue:
            post.avg_weight_kg != null ? String(post.avg_weight_kg) : "",
        },
        {
          name: "pricePerUnit",
          type: "number",
          label: "Precio (US$)",
          required: true,
          defaultValue:
            post.price_per_unit != null ? String(post.price_per_unit) : "",
        },
        trailingDetails,
      ];

    default: // Ganado Bovino
      return [
        ...titleAndDetails,
        {
          name: "sex",
          type: "select",
          label: "Sexo",
          required: true,
          defaultValue: post.sex ?? "",
          options: SEX_LABEL,
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
                  post.avg_weight_kg != null
                    ? String(post.avg_weight_kg)
                    : "",
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
                  post.price_per_unit != null
                    ? String(post.price_per_unit)
                    : "",
              },
            ]),
        trailingDetails,
      ];
  }
};
