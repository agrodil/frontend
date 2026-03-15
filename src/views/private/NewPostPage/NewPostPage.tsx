import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuCircleCheck, LuCircleX, LuLoader } from "react-icons/lu";
import Form from "../../../components/ui/Form";
import Button from "../../../components/ui/Button";
import { newPostFormFields } from "./NewPostFormFields";
import { useAuth } from "../../../hooks/useAuth";
import { uploadPost } from "../../../routes/actions/post.actions";

type SubmitState = "idle" | "loading" | "success" | "error";

const NewPostPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const buildFormData = (
    data: Record<string, string | File | File[] | boolean>,
  ): FormData => {
    const formData = new FormData();

    const mediaFiles = Array.isArray(data.media) ? (data.media as File[]) : [];
    mediaFiles.forEach((file) => formData.append("files", file));

    if (mediaFiles.length > 0) {
      const filesMetadata = mediaFiles.map((file, index) => ({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        isMainFile: index === 0,
        displayOrder: index + 1,
      }));
      formData.append("files", JSON.stringify(filesMetadata));
    }

    const post = {
      livestockTypeId: 1,
      livestockPostName: data.livestockPostName,
      sectorId: Number(data.sectorId),
      saleTypeId: Number(data.saleTypeId),
      sex: data.sex,
      breedId: Number(data.breed),
      quantity: Number(data.quantity),
      townshipId: Number(user!.municipality),
      ...(data.avgWeightKg ? { avgWeightKg: Number(data.avgWeightKg) } : {}),
      ...(data.pricePerKg ? { pricePerKg: Number(data.pricePerKg) } : {}),
      ...(data.pricePerUnit ? { pricePerUnit: Number(data.pricePerUnit) } : {}),
      ...(data.details ? { details: data.details } : {}),
    };

    formData.append("post", JSON.stringify(post));
    return formData;
  };

  const submit = async (formData: FormData) => {
    setSubmitState("loading");
    try {
      await uploadPost(formData);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  const handleSubmit = (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    const formData = buildFormData(data);
    setPendingFormData(formData);
    submit(formData);
  };

  const handleRetry = () => {
    if (pendingFormData) submit(pendingFormData);
  };

  if (!user) {
    return (
      <section className="flex items-center justify-center min-h-screen w-full px-4">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 w-[90vw] max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-primary mb-4 text-center">
              Inicia sesión
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Para crear una publicación, debes estar registrado e iniciar
              sesión en tu cuenta.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 mb-4 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Ir a iniciar sesión
            </button>
            <Link to="/" className="text-primary hover:underline">
              Volver a inicio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col min-h-screen w-[90vw] mx-auto">
      <div className="mt-8 lg:mt-0 p-4 text-center md:text-start text-lg md:text-2xl font-bold mb-4 border border-gray-200 shadow-sm rounded-2xl h-fit w-full">
        Para realizar una publicación, completa el{" "}
        <span className="text-primary">formulario de venta.</span>
      </div>

      <div className="p-4 border border-gray-200 shadow-sm rounded-2xl h-fit w-full lg:max-h-[65vh] overflow-y-auto">
        <Form
          onSubmit={handleSubmit}
          fields={newPostFormFields}
          submitLabel="Publicar"
          isLoading={submitState === "loading"}
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
                  <p className="text-gray-600 font-medium">
                    Subiendo publicación...
                  </p>
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
                  <p className="text-gray-500 text-sm">
                    No se pudo crear la publicación. Intenta de nuevo.
                  </p>
                  <div className="flex gap-3 w-full mt-2">
                    <Button
                      label="Reintentar"
                      variant="primary"
                      className="flex-1"
                      onClick={handleRetry}
                    />
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
