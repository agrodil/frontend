import {
  POST_CATEGORY,
  isLivestockCategory,
} from "@/shared/utils/resolvePostPricing";
import type {
  NewPostInput,
  UploadProgress,
} from "@/presentation/router/actions/post.actions";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";
import type { FormField } from "@/presentation/interfaces/ui/FormProps";

export const labelForProgress = (progress: UploadProgress): string => {
  switch (progress.phase) {
    case "compressing":
      return "Optimizando imágenes...";
    case "creating":
      return "Creando publicación...";
    case "uploading":
      return `Subiendo archivo ${progress.index + 1} de ${progress.total}...`;
    case "confirming":
      return "Finalizando...";
  }
};

// Form ya bloquea el submit nativo cuando falta un campo required — salvo
// para "media": su <input type=file> real vive oculto (className="hidden")
// detrás del botón "Agregar", y un input display:none queda fuera de la
// validación de constraints del navegador, así que nunca bloquea. Esta
// función es la red de seguridad real para ese caso, y de paso da un mensaje
// consistente (con el nombre del campo) para cualquier otro que se cuele.
export const findMissingRequiredField = (
  data: Record<string, unknown>,
  fields: FormField[],
): string | null => {
  for (const field of fields) {
    if (!field.required) continue;
    if (field.visibleWhen && !field.visibleWhen(data as Record<string, string>))
      continue;

    const value = data[field.name];
    const isEmpty =
      field.type === "media"
        ? !Array.isArray(value) || value.length === 0
        : typeof value !== "string" || value.trim() === "";

    if (isEmpty) {
      return `Debes completar "${field.label ?? field.name}".`;
    }
  }
  return null;
};

// Combina las respuestas de los 3 pasos del wizard (ya fusionadas en un solo
// objeto por NewPostPage) en el payload que espera POST /posts. Se mantiene
// como una única función (en vez de un validador por paso) porque varias
// reglas son cruzadas entre pasos — p.ej. qué precio es requerido depende del
// tipo de venta elegido en el paso 1, pero el campo vive en el paso 2.
export const buildPayload = (
  data: Record<string, string | File | File[] | boolean>,
  location: LocationValue,
): { payload: NewPostInput | null; validationError: string | null } => {
  const postCategoryId = Number(data.postCategoryId);
  if (!postCategoryId) {
    return {
      payload: null,
      validationError: "Selecciona qué quieres publicar.",
    };
  }

  // Insumos u Otros es la única categoría con ubicación opcional.
  if (
    postCategoryId !== POST_CATEGORY.INSUMOS &&
    (!location.stateId || !location.townshipId)
  ) {
    return {
      payload: null,
      validationError: "Debes indicar dónde se encuentra la publicación.",
    };
  }

  const postName =
    typeof data.postName === "string" ? data.postName.trim() : "";
  if (!postName) {
    return {
      payload: null,
      validationError: "Debes indicar un título para la publicación.",
    };
  }

  const postingFeeId =
    typeof data.postingFeeId === "string" ? data.postingFeeId : "";
  if (!postingFeeId) {
    return {
      payload: null,
      validationError: "Debes seleccionar la duración de la publicación.",
    };
  }

  const mediaFiles = Array.isArray(data.media) ? (data.media as File[]) : [];

  const post: Record<string, unknown> = {
    postCategoryId,
    postName,
    postingFeeId,
    ...(location.townshipId
      ? { townshipId: Number(location.townshipId) }
      : {}),
    ...(data.details ? { details: data.details } : {}),
  };

  if (isLivestockCategory(postCategoryId)) {
    const predominantBreed =
      typeof data.predominantBreed === "string"
        ? data.predominantBreed.trim()
        : "";
    if (!predominantBreed) {
      return {
        payload: null,
        validationError: "Debes indicar la raza predominante del lote.",
      };
    }
    if (!data.livestockSectorId) {
      return {
        payload: null,
        validationError: "Debes seleccionar el rubro.",
      };
    }
    const saleTypeId = Number(data.saleTypeId);
    if (!saleTypeId) {
      return {
        payload: null,
        validationError: "Debes seleccionar el tipo de venta.",
      };
    }
    if (!data.sex) {
      return {
        payload: null,
        validationError: "Debes seleccionar el sexo del lote.",
      };
    }
    if (!data.quantity) {
      return {
        payload: null,
        validationError: "Debes indicar la cantidad de animales.",
      };
    }

    let weightFields: Record<string, unknown> = {};
    if (saleTypeId === 1) {
      if (!data.avgWeightKg) {
        return {
          payload: null,
          validationError: "Debes indicar el peso promedio (kg).",
        };
      }
      if (!data.pricePerKg) {
        return {
          payload: null,
          validationError: "Debes indicar el precio por kg.",
        };
      }
      if (!data.priceWeightBasis) {
        return {
          payload: null,
          validationError: "Debes indicar si el precio es en pie o en canal.",
        };
      }
      weightFields = {
        avgWeightKg: Number(data.avgWeightKg),
        pricePerKg: Number(data.pricePerKg),
        priceWeightBasis: data.priceWeightBasis,
      };
    } else if (!data.pricePerUnit) {
      return {
        payload: null,
        validationError: "Debes indicar el precio por unidad.",
      };
    } else {
      weightFields = { pricePerUnit: Number(data.pricePerUnit) };
    }

    Object.assign(post, {
      predominantBreed,
      livestockSectorId: Number(data.livestockSectorId),
      saleTypeId,
      sex: data.sex,
      quantity: Number(data.quantity),
      ...(typeof data.postSubcategoryId === "string" && data.postSubcategoryId
        ? { postSubcategoryId: Number(data.postSubcategoryId) }
        : {}),
      ...weightFields,
    });
  } else {
    switch (postCategoryId) {
      case POST_CATEGORY.MAQUINARIA: {
        if (!data.pricePerUnit) {
          return {
            payload: null,
            validationError: "Debes indicar el precio.",
          };
        }
        Object.assign(post, {
          pricePerUnit: Number(data.pricePerUnit),
          ...(typeof data.postBrand === "string" && data.postBrand.trim()
            ? { postBrand: data.postBrand.trim() }
            : {}),
        });
        break;
      }

      case POST_CATEGORY.FINCAS: {
        if (!data.farmHectares) {
          return {
            payload: null,
            validationError: "Debes indicar las hectáreas.",
          };
        }
        if (!data.pricePerHectare) {
          return {
            payload: null,
            validationError: "Debes indicar el precio por hectárea.",
          };
        }
        Object.assign(post, {
          farmHectares: Number(data.farmHectares),
          pricePerHectare: Number(data.pricePerHectare),
        });
        break;
      }

      case POST_CATEGORY.INSUMOS: {
        if (!data.pricePerUnit) {
          return {
            payload: null,
            validationError: "Debes indicar el precio.",
          };
        }
        Object.assign(post, { pricePerUnit: Number(data.pricePerUnit) });
        break;
      }

      default:
        return {
          payload: null,
          validationError: "Categoría inválida.",
        };
    }
  }

  return { payload: { post, media: mediaFiles }, validationError: null };
};
