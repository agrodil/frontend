import { fetchWithAuth } from "../fetchWithAuth";

export type TroubleshootingReportRow = {
  troubleshooting_report_id: string;
  title: string;
  troubleshooting_type_id: number;
  type_name: string;
  troubleshooting_status_id: number;
  status_name: string;
  created_at: string;
  reporter_name: string;
};

export type TroubleshootingPagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type TroubleshootingListResult = {
  items: TroubleshootingReportRow[];
  pagination: TroubleshootingPagination;
};

export type TroubleshootingDetail = TroubleshootingReportRow & {
  detail: string;
  attachment_mime: string | null;
  attachmentUrl: string | null;
  updated_at: string;
};

export type PresignAttachment = {
  s3Key: string;
  uploadUrl: string;
  contentType: string;
};

async function readData<T>(response: Response, ctx: string): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `[troubleshooting.${ctx}] (${response.status})${body ? `: ${body}` : ""}`,
    );
  }
  const json = await response.json();
  return (json.data ?? json) as T;
}

export const troubleshootingApi = {
  // ── Usuario ──────────────────────────────────────────────────────────────
  createReport: async (data: {
    title: string;
    detail: string;
    typeId: number;
  }): Promise<{ reportId: string }> => {
    const response = await fetchWithAuth("/troubleshooting", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return readData(response, "createReport");
  },

  presignAttachment: async (
    reportId: string,
    meta: { fileName: string; mimeType: string },
  ): Promise<PresignAttachment> => {
    const response = await fetchWithAuth(
      `/troubleshooting/${reportId}/attachment/presign`,
      { method: "POST", body: JSON.stringify(meta) },
    );
    return readData(response, "presignAttachment");
  },

  // Sube el binario DIRECTO a S3 (fetch nativo): sin credenciales nuestras y sin
  // pasar por el proxy Vercel → sin límite de 4.5MB (soporta video).
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!response.ok) {
      throw new Error(`Falló la subida a S3 (${response.status})`);
    }
  },

  confirmAttachment: async (
    reportId: string,
    meta: { s3Key: string; mimeType: string },
  ): Promise<void> => {
    const response = await fetchWithAuth(
      `/troubleshooting/${reportId}/attachment/confirm`,
      { method: "POST", body: JSON.stringify(meta) },
    );
    await readData(response, "confirmAttachment");
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  listReports: async (
    limit: number,
    offset: number,
    typeId?: number | null,
  ): Promise<TroubleshootingListResult> => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (typeId != null) params.set("type", String(typeId));
    const response = await fetchWithAuth(`/troubleshooting/admin?${params}`);
    return readData(response, "listReports");
  },

  getReportDetail: async (id: string): Promise<TroubleshootingDetail> => {
    const response = await fetchWithAuth(`/troubleshooting/admin/${id}`);
    return readData(response, "getReportDetail");
  },

  updateStatus: async (id: string, statusId: number): Promise<void> => {
    const response = await fetchWithAuth(
      `/troubleshooting/admin/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ statusId }) },
    );
    await readData(response, "updateStatus");
  },
};
