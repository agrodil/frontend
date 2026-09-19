import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuCircleX,
  LuLoader,
} from "react-icons/lu";

import Form from "@/presentation/ui/Form";
import Button from "@/presentation/ui/Button";
import LocationSelects from "@/presentation/ui/LocationSelects";
import NewPostProgress from "./NewPostProgress";
import DurationPlanPicker from "./DurationPlanPicker";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { buildStep1Fields, buildStep2Fields } from "./NewPostFormFields";
import {
  buildPayload,
  findMissingRequiredField,
  labelForProgress,
} from "./NewPostPage.handlers";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useCatalog } from "@/adapters/hooks/actions/useCatalog";
import { TOWNSHIP_BY_ID } from "@/shared/constants/townships.catalog";
import { POST_CATEGORY } from "@/shared/utils/resolvePostPricing";
import {
  uploadPost,
  type NewPostInput,
} from "@/presentation/router/actions/post.actions";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";

type Step = 1 | 2 | 3;
type SubmitState = "idle" | "loading" | "success" | "error";

const STEP_TITLES: Record<Step, string> = {
  1: "Datos generales",
  2: "Datos particulares",
  3: "Duración de la publicación",
};

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

  const [step, setStep] = useState<Step>(1);
  const [hasReachedStep2, setHasReachedStep2] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [location, setLocation] = useState<LocationValue>(() =>
    initialLocation(user?.townshipId),
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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

  const postCategoryId = Number(formData.postCategoryId) || 0;
  const saleTypeId =
    typeof formData.saleTypeId === "string" && formData.saleTypeId
      ? Number(formData.saleTypeId)
      : null;
  const selectedPostingFeeId =
    (typeof formData.postingFeeId === "string" && formData.postingFeeId) ||
    (catalog.postingFees[0] ? String(catalog.postingFees[0].value) : "");

  const step1Fields = buildStep1Fields(
    catalog.categories,
    catalog.livestockSectors,
  );
  const step2Fields = buildStep2Fields({
    postCategoryId,
    saleTypeId,
    livestockSubcategories: catalog.livestockSubcategories,
  });

  const submit = async (payload: NewPostInput) => {
    setSubmitState("loading");
    setProgressLabel("Preparando archivos...");
    const postingFeeId = payload.post.postingFeeId as string | undefined;
    const expectedCostUsd = postingFeeId
      ? (catalog.postingFeePrices[postingFeeId] ?? 0)
      : 0;
    try {
      await uploadPost(payload, expectedCostUsd, (progress) =>
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

  const handleStep1Continue = (data: Record<string, unknown>) => {
    const missing = findMissingRequiredField(data, step1Fields);
    if (missing) {
      setStepError(missing);
      return;
    }

    const catId = Number(data.postCategoryId);
    const isLocationMissing =
      catId !== POST_CATEGORY.INSUMOS &&
      (!location.stateId || !location.townshipId);
    setLocationError(
      isLocationMissing
        ? "Debes indicar dónde se encuentra la publicación."
        : null,
    );
    if (isLocationMissing) return;

    setStepError(null);
    setFormData((prev) => ({ ...prev, ...data }));
    setHasReachedStep2(true);
    setStep(2);
  };

  const handleStep2Continue = (data: Record<string, unknown>) => {
    const missing = findMissingRequiredField(data, step2Fields);
    if (missing) {
      setStepError(missing);
      return;
    }

    setStepError(null);
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3Continue = () => {
    setFormData((prev) => ({ ...prev, postingFeeId: selectedPostingFeeId }));
    setConfirmError(null);
    setShowConfirmModal(true);
  };

  const handleBack = () => {
    setStepError(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handlePublish = () => {
    const { payload, validationError } = buildPayload(
      formData as Record<string, string | File | File[] | boolean>,
      location,
    );

    if (validationError || !payload) {
      setConfirmError(validationError ?? "Datos inválidos.");
      return;
    }

    setShowConfirmModal(false);
    setPendingPayload(payload);
    submit(payload);
  };

  const mediaCount = Array.isArray(formData.media)
    ? (formData.media as File[]).length
    : 0;

  return (
    <section className="flex flex-col min-h-screen w-[90vw] mx-auto py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Atrás"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0 bg-white cursor-pointer"
            >
              <LuArrowLeft size={18} className="text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-primary font-bold text-xl">
              Nueva publicación
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Paso {step} de 3 · {STEP_TITLES[step]}
            </p>
          </div>
        </div>

        <NewPostProgress step={step} />

        {catalog.error && (
          <p className="text-sm text-red-500 text-center mb-4">
            No se pudo cargar el catálogo de categorías. Recarga la página.
          </p>
        )}

        {stepError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-2.5 text-center mb-4">
            {stepError}
          </p>
        )}

        <div className="p-4 sm:p-6 border border-gray-300 rounded-xl bg-white">
          <div className={step === 1 ? "" : "hidden"}>
            {hasReachedStep2 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4">
                Si cambias la categoría o el tipo de venta, se reiniciarán los
                campos de la siguiente sección.
              </p>
            )}
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
              fields={step1Fields}
              onSubmit={handleStep1Continue}
              isLoading={catalog.isLoading}
              submitLabel="Continuar"
            />
          </div>

          {hasReachedStep2 && (
            <div className={step === 2 ? "" : "hidden"}>
              <Form
                key={`step2-${postCategoryId}-${saleTypeId}`}
                fields={step2Fields}
                onSubmit={handleStep2Continue}
                submitLabel="Continuar"
              />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-gray-600">
                Elige por cuánto tiempo quieres que tu publicación esté activa.
              </p>
              <DurationPlanPicker
                options={catalog.postingFees}
                value={selectedPostingFeeId}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, postingFeeId: v }))
                }
              />
              <Button
                label="Continuar"
                onClick={handleStep3Continue}
                disabled={catalog.postingFees.length === 0}
                className="w-full max-w-md mx-auto mt-2"
              />
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmPublishModal
          formData={formData}
          location={location}
          catalog={catalog}
          mediaCount={mediaCount}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handlePublish}
          loading={submitState === "loading"}
          error={confirmError}
        />
      )}

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
              className="bg-background rounded-3xl border border-gray-300 p-8 w-[90vw] max-w-sm flex flex-col items-center gap-4 text-center"
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
                  <p className="text-primary text-sm wrap-break-word">
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
