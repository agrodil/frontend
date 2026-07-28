import { useEffect, useState, type FC } from "react";
import { motion } from "framer-motion";
import { LuX, LuLoader } from "react-icons/lu";
import {
  troubleshootingApi,
  type TroubleshootingDetail,
} from "@/api/clients/troubleshooting.api";
import { TROUBLESHOOTING_TYPE_LABELS } from "@/shared/constants/troubleshooting-type.catalog";
import {
  TROUBLESHOOTING_STATUS,
  TROUBLESHOOTING_STATUS_OPTIONS,
} from "@/shared/constants/troubleshooting-status.catalog";
import { formatDateTime } from "@/shared/utils/formatDateTime";

type ReportDetailModalProps = {
  reportId: string;
  onClose: () => void;
  onStatusChange: (id: string, statusId: number) => Promise<void>;
};

const ReportDetailModal: FC<ReportDetailModalProps> = ({
  reportId,
  onClose,
  onStatusChange,
}) => {
  const [detail, setDetail] = useState<TroubleshootingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusId, setStatusId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    troubleshootingApi
      .getReportDetail(reportId)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setStatusId(d.troubleshooting_status_id);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el detalle.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const handleStatusChange = async (next: number) => {
    setStatusId(next);
    setSavingStatus(true);
    try {
      await onStatusChange(reportId, next);
    } catch {
      // revierte visualmente si falla
      setStatusId(detail?.troubleshooting_status_id ?? next);
    } finally {
      setSavingStatus(false);
    }
  };

  const isVideo = detail?.attachment_mime?.startsWith("video/");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full min-w-0 max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Detalle del reporte</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex justify-center py-10">
              <LuLoader size={22} className="text-gray-400 animate-spin" />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {detail && !loading && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {detail.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateTime(detail.created_at)} · por{" "}
                  {detail.reporter_name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1">
                  {TROUBLESHOOTING_TYPE_LABELS[detail.troubleshooting_type_id] ??
                    detail.type_name}
                </span>
                {statusId != null && (
                  <span
                    className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${TROUBLESHOOTING_STATUS[statusId]?.badgeClass ?? ""}`}
                  >
                    {TROUBLESHOOTING_STATUS[statusId]?.label ??
                      detail.status_name}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Cambiar estado
                </label>
                <div className="flex items-center gap-2 mt-1.5">
                  <select
                    value={statusId ?? ""}
                    disabled={savingStatus}
                    onChange={(e) => handleStatusChange(Number(e.target.value))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    {TROUBLESHOOTING_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {savingStatus && (
                    <LuLoader size={16} className="text-gray-400 animate-spin" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Detalle
                </label>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap wrap-break-word">
                  {detail.detail}
                </p>
              </div>

              {detail.attachmentUrl && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Adjunto
                  </label>
                  <div className="mt-1.5 rounded-xl overflow-hidden border border-gray-100">
                    {isVideo ? (
                      <video
                        src={detail.attachmentUrl}
                        controls
                        className="w-full max-w-full max-h-80 bg-black"
                      />
                    ) : (
                      <a
                        href={detail.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={detail.attachmentUrl}
                          alt="Adjunto del reporte"
                          className="w-full max-w-full max-h-80 object-contain bg-gray-50"
                        />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportDetailModal;
