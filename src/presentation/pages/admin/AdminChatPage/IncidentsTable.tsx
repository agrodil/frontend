import type { FC } from "react";
import { motion } from "framer-motion";
import { LuLoader, LuTriangleAlert } from "react-icons/lu";
import type { AdminIncident } from "@/api/clients/admin.api";
import { INCIDENT_REASON_LABELS } from "@/shared/constants/incident-reason.catalog";
import { formatDateTime } from "@/shared/utils/formatDateTime";

type IncidentsTableProps = {
  incidents: AdminIncident[];
  loading: boolean;
  error: string | null;
  onViewChat: (incident: AdminIncident) => void;
};

const IncidentsTable: FC<IncidentsTableProps> = ({
  incidents,
  loading,
  error,
  onViewChat,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
  >
    <div className="flex items-center gap-2 mb-4 font-bold text-gray-900">
      <LuTriangleAlert size={18} className="text-amber-500" />
      Incidencias
      {loading && (
        <LuLoader size={16} className="text-gray-400 animate-spin ml-1" />
      )}
    </div>

    {error && <p className="text-sm text-red-500">{error}</p>}

    {!loading && !error && incidents.length === 0 && (
      <p className="text-sm text-gray-400">No hay incidencias reportadas.</p>
    )}

    {!loading && incidents.length > 0 && (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="font-semibold py-2 pr-4">Motivo</th>
              <th className="font-semibold py-2 pr-4">Usuario</th>
              <th className="font-semibold py-2 pr-4">Mensaje</th>
              <th className="font-semibold py-2 pr-4">Fecha</th>
              <th className="font-semibold py-2">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.purchase_notification_incident_id}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1">
                    {INCIDENT_REASON_LABELS[incident.reason_name] ??
                      incident.reason_name}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-gray-800 whitespace-nowrap">
                  {incident.offender_name || "—"}
                </td>
                <td className="py-2.5 pr-4 text-gray-600 max-w-xs truncate">
                  {incident.message}
                </td>
                <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                  {formatDateTime(incident.created_at)}
                </td>
                <td className="py-2.5">
                  <button
                    type="button"
                    onClick={() => onViewChat(incident)}
                    className="text-primary cursor-pointer text-xs font-semibold hover:underline whitespace-nowrap"
                  >
                    Ver chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </motion.div>
);

export default IncidentsTable;
