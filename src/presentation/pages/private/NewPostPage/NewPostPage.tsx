import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuCircleCheck, LuCircleX, LuLoader } from "react-icons/lu";
import Form from "@/presentation/ui/Form";
import Button from "@/presentation/ui/Button";
import LocationSelects from "@/presentation/ui/LocationSelects";
import { buildNewPostFields } from "./NewPostFormFields";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useCatalog } from "@/adapters/hooks/actions/useCatalog";
import { TOWNSHIP_BY_ID } from "@/shared/constants/townships.catalog";
import { POST_CATEGORY } from "@/shared/utils/resolvePostPricing";
import {
  uploadPost,
  type NewPostInput,
  type UploadProgress,
} from "@/presentation/router/actions/post.actions";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";

type SubmitState = "idle" | "loading" | "success" | "error";

const labelForProgress = (progress: UploadProgress): string => {
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

// El municipio del perfil solo precarga los selects: un usuario puede tener
// ganado/fincas en varios municipios, así que la ubicación es editable y se
// guarda por publicación, no se hereda del perfil.
const initialLocation = (townshipId?: number): LocationValue => {
  const township = townshipId ? TOWNSHIP_BY_ID[townshipId] : undefined;
  return township
    ? { stateId: String(township.stateId), townshipId: String(township.id) }
    : { stateId: "", townshipId: "" };
};

const NewPostPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const catalog = useCatalog();
  const [location, setLocation] = useState<LocationValue>(() =>
    initialLocation(user?.townshipId),
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [pendingPayload, setPendingPayload] = useState<NewPostInput | null>(
    null,
  );
  const [progressLabel, setProgressLabel] = useState<string>(
    "Subiendo publicación...",
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    "No se pudo crear la publicación. Intenta de nuevo.",
  );

  const buildPayload = (
    data: Record<string, string | File | File[] | boolean>,
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

    const mediaFiles = Array.isArray(data.media) ? (data.media as File[]) : [];

    const post: Record<string, unknown> = {
      postCategoryId,
      postName,
      ...(location.townshipId
        ? { townshipId: Number(location.townshipId) }
        : {}),
      ...(data.details ? { details: data.details } : {}),
    };

    switch (postCategoryId) {
      case POST_CATEGORY.ANIMALES: {
        const postSubcategoryName =
          typeof data.postSubcategoryName === "string"
            ? data.postSubcategoryName.trim()
            : "";
        if (!postSubcategoryName) {
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
        } else if (!data.pricePerUnit) {
          return {
            payload: null,
            validationError: "Debes indicar el precio por unidad.",
          };
        }

        Object.assign(post, {
          postSubcategoryName,
          livestockSectorId: Number(data.livestockSectorId),
          saleTypeId,
          sex: data.sex,
          quantity: Number(data.quantity),
          ...(saleTypeId === 1
            ? {
                avgWeightKg: Number(data.avgWeightKg),
                pricePerKg: Number(data.pricePerKg),
              }
            : { pricePerUnit: Number(data.pricePerUnit) }),
        });
        break;
      }

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

    console.debug("[NewPostPage] Payload generado para /posts", post);
    return { payload: { post, media: mediaFiles }, validationError: null };
  };

  const submit = async (payload: NewPostInput) => {
    setSubmitState("loading");
    setProgressLabel("Preparando archivos...");
    try {
      await uploadPost(payload, (progress) =>
        setProgressLabel(labelForProgress(progress)),
      );
      setSubmitState("success");
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Error desconocido";
      console.error("[NewPostPage] Falló uploadPost:", error);
      setErrorMessage(`No se pudo crear la publicación. ${detail}`);
      setSubmitState("error");
    }
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    const postCategoryId = Number(data.postCategoryId);
    const isLocationMissing =
      postCategoryId !== POST_CATEGORY.INSUMOS &&
      (!location.stateId || !location.townshipId);
    setLocationError(
      isLocationMissing
        ? "Debes indicar dónde se encuentra la publicación."
        : null,
    );

    const { payload, validationError } = buildPayload(
      data as Record<string, string | File | File[] | boolean>,
    );

    if (validationError || !payload) {
      console.warn("[NewPostPage] Validación previa falló:", validationError);
      setErrorMessage(validationError ?? "Datos inválidos.");
      setPendingPayload(null);
      setSubmitState("error");
      return;
    }

    setPendingPayload(payload);
    submit(payload);
  };

  const fields = buildNewPostFields(
    catalog.categories,
    catalog.livestockSectors,
  );

  return (
    <section className="flex flex-col min-h-screen w-[90vw] mx-auto">
      <div className="mt-8 lg:mt-0 p-4 text-center md:text-start text-lg md:text-2xl font-bold mb-4 border border-gray-200 shadow-sm rounded-2xl h-fit w-full">
        Para realizar una publicación, completa el{" "}
        <span className="text-primary">formulario de venta.</span>
      </div>

      <div className="p-4 border border-gray-200 shadow-sm rounded-2xl h-fit w-full lg:max-h-[75vh] overflow-y-auto">
        {catalog.error && (
          <p className="text-sm text-red-500 text-center mb-4">
            No se pudo cargar el catálogo de categorías. Recarga la página.
          </p>
        )}

        {/* La ubicación vive fuera de Form: el resto de campos usa dependsOn/
            visibleWhen sobre postCategoryId, pero la ubicación reutiliza el
            mismo LocationSelects ya construido para registro/perfil. */}
        <div className="mb-4">
          <LocationSelects
            value={location}
            onChange={(next) => {
              setLocation(next);
              setLocationError(null);
            }}
            stateLabel="Estado"
            townshipLabel="Municipio"
            error={locationError}
          />
        </div>

        <Form
          fields={fields}
          onSubmit={handleSubmit}
          isLoading={submitState === "loading" || catalog.isLoading}
          submitLabel="Publicar"
        />
      </div>

      {/* Overlay: loader + modals */}
      <AnimatePresence>
        {submitState !== "idle" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-3xl border border-gray-200 p-8 w-[90vw] max-w-sm shadow-2xl flex flex-col items-center gap-4 text-center"
            >
              {submitState === "loading" && (
                <>
                  <LuLoader size={48} className="text-primary animate-spin" />
                  <p className="text-gray-600 font-medium">{progressLabel}</p>
                </>
              )}

              {submitState === "success" && (
                <>
                  <LuCircleCheck size={48} className="text-primary" />
                  <h2 className="text-xl font-bold text-gray-800">
                    ¡Publicación exitosa!
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Tu publicación fue creada correctamente.
                  </p>
                  <Button
                    label="Aceptar"
                    variant="primary"
                    className="w-full mt-2"
                    onClick={() => navigate("/me")}
                  />
                </>
              )}

              {submitState === "error" && (
                <>
                  <LuCircleX size={48} className="text-red-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Error al publicar
                  </h2>
                  <p className="text-gray-500 text-sm wrap-break-word">
                    {errorMessage}
                  </p>
                  <div className="flex gap-3 w-full mt-2">
                    {pendingPayload ? (
                      <Button
                        label="Reintentar"
                        variant="primary"
                        className="flex-1"
                        onClick={() => submit(pendingPayload)}
                      />
                    ) : (
                      <Button
                        label="Cerrar"
                        variant="primary"
                        className="flex-1"
                        onClick={() => setSubmitState("idle")}
                      />
                    )}
                    <Button
                      label="Ir al inicio"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate("/")}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default NewPostPage;
