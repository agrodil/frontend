import { type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuCircleCheck } from "react-icons/lu";
import { z } from "zod";

import Form from "@/presentation/ui/Form";
import Button from "@/presentation/ui/Button";
import Loader from "@/presentation/layout/Loader";
import type { FormField } from "@/presentation/interfaces/ui/FormProps";
import { TROUBLESHOOTING_TYPES } from "@/shared/constants/troubleshooting-type.catalog";
import { useReportProblem } from "@/adapters/hooks/actions/useReportProblem";

const reportFields: FormField[] = [
  {
    name: "title",
    type: "text",
    label: "Título del problema",
    placeholder: "Resumen corto de la falla",
    required: true,
  },
  {
    name: "type",
    type: "select",
    label: "Tipo de problema",
    placeholder: "Selecciona un subsistema",
    options: TROUBLESHOOTING_TYPES.map((t) => ({
      label: t.label,
      value: t.value,
    })),
    required: true,
  },
  {
    name: "detail",
    type: "textarea",
    label: "Detalle",
    placeholder:
      "Describe qué pasó, qué esperabas que ocurriera y los pasos para reproducirlo",
    required: true,
  },
  {
    name: "attachment",
    type: "media",
    label: "Captura de pantalla o video",
    placeholder: "Adjuntar",
    accept: "image/*,video/*",
    maxFiles: 1,
    optional: true,
  },
];

const reportSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(150, "Máximo 150 caracteres"),
  type: z.string().min(1, "Selecciona el tipo de problema"),
  detail: z
    .string()
    .min(1, "El detalle es requerido")
    .max(2000, "Máximo 2000 caracteres"),
});

const ReportProblemPage: FC = () => {
  const navigate = useNavigate();
  const { submit, submitting, error, success } = useReportProblem();

  const handleSubmit = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    const files = Array.isArray(data.attachment) ? data.attachment : [];
    await submit({
      title: data.title as string,
      detail: data.detail as string,
      typeId: Number(data.type),
      attachment: files[0],
    });
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-10">
      <Loader visible={submitting} />
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                       hover:bg-gray-50 transition-colors shrink-0 bg-white cursor-pointer"
          >
            <LuArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-primary font-bold text-xl">
              Reportar un problema
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Cuéntanos qué falló para poder ayudarte
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-4 py-6"
            >
              <LuCircleCheck size={56} className="text-green-500" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  ¡Reporte enviado!
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Gracias por avisarnos. Nuestro equipo revisará el problema.
                </p>
              </div>
              <Link to="/" className="w-full">
                <Button label="Volver al inicio" className="w-full" />
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
              )}
              <Form
                fields={reportFields}
                schema={reportSchema}
                submitLabel="Enviar reporte"
                onSubmit={handleSubmit}
                isLoading={submitting}
                singleColumn
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default ReportProblemPage;
