import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuLoader, LuWrench } from "react-icons/lu";
import { useAdminTroubleshooting } from "@/adapters/hooks/actions/useAdminTroubleshooting";
import {
  TROUBLESHOOTING_TYPES,
  TROUBLESHOOTING_TYPE_LABELS,
} from "@/shared/constants/troubleshooting-type.catalog";
import { TROUBLESHOOTING_STATUS } from "@/shared/constants/troubleshooting-status.catalog";
import { formatDateTime } from "@/shared/utils/formatDateTime";
import ReportDetailModal from "./ReportDetailModal";

const AdminTroubleshootingPage: FC = () => {
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    typeFilter,
    setTypeFilter,
    loadMore,
    updateStatus,
  } = useAdminTroubleshooting();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-8">
      {selectedId && (
        <ReportDetailModal
          reportId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={updateStatus}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <Link
          to="/admin"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
            Reportes de problemas
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Fallas reportadas por los usuarios
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-w-0"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <LuWrench size={18} className="text-primary" />
            Reportes
            {loading && (
              <LuLoader size={16} className="text-gray-400 animate-spin ml-1" />
            )}
          </div>
          <select
            value={typeFilter ?? ""}
            onChange={(e) =>
              setTypeFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todos los tipos</option>
            {TROUBLESHOOTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-400">No hay reportes.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="font-semibold py-2 pr-4">Fecha</th>
                  <th className="font-semibold py-2 pr-4">Usuario</th>
                  <th className="font-semibold py-2 pr-4">Título</th>
                  <th className="font-semibold py-2 pr-4">Tipo</th>
                  <th className="font-semibold py-2 pr-4">Estado</th>
                  <th className="font-semibold py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const status =
                    TROUBLESHOOTING_STATUS[r.troubleshooting_status_id];
                  return (
                    <tr
                      key={r.troubleshooting_report_id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-800 whitespace-nowrap">
                        {r.reporter_name || "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700 max-w-xs truncate">
                        {r.title}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1">
                          {TROUBLESHOOTING_TYPE_LABELS[
                            r.troubleshooting_type_id
                          ] ?? r.type_name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${status?.badgeClass ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {status?.label ?? r.status_name}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedId(r.troubleshooting_report_id)
                          }
                          className="text-primary cursor-pointer text-xs font-semibold hover:underline whitespace-nowrap"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mt-4 self-center mx-auto flex items-center gap-1.5 text-sm text-primary
                       font-medium hover:underline disabled:opacity-50"
          >
            {loadingMore && <LuLoader size={14} className="animate-spin" />}
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        )}
      </motion.div>
    </main>
  );
};

export default AdminTroubleshootingPage;
