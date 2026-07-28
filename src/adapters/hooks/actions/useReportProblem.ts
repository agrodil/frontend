import { useState } from "react";
import { troubleshootingApi } from "@/api/clients/troubleshooting.api";
import { compressImage } from "@/shared/utils/compressImage";

export interface ReportProblemInput {
  title: string;
  detail: string;
  typeId: number;
  attachment?: File;
}

// Orquesta el envío de un reporte: crea el reporte (JSON) y, si hay adjunto,
// hace el flujo presigned (presign → PUT directo a S3 → confirm). Las imágenes
// se comprimen antes de subir; los videos se suben tal cual.
export const useReportProblem = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (input: ReportProblemInput): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const { reportId } = await troubleshootingApi.createReport({
        title: input.title,
        detail: input.detail,
        typeId: input.typeId,
      });

      if (input.attachment) {
        const isImage = input.attachment.type.startsWith("image/");
        const file = isImage
          ? await compressImage(input.attachment)
          : input.attachment;

        const presign = await troubleshootingApi.presignAttachment(reportId, {
          fileName: file.name,
          mimeType: file.type,
        });
        await troubleshootingApi.uploadToS3(presign.uploadUrl, file);
        await troubleshootingApi.confirmAttachment(reportId, {
          s3Key: presign.s3Key,
          mimeType: file.type,
        });
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el reporte. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, success };
};
