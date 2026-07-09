import { banPhone } from "@/shared/utils/banPhone";
import { incidentsApi } from "@/api/clients/incidents.api";
import type { IncidentReason } from "@/api/clients/incidents.api";

export interface Violation {
  reason: IncidentReason;
  rawMessage: string;
}

export interface ModerationResult {
  sanitized: string;
  violations: Violation[];
}

/**
 * Abstrae la censura de mensajes de chat y el reporte de incidencias de
 * moderación. Agregar un nuevo motivo (lenguaje soez, etc.) es sumar otro
 * checker acá — el call site en ChatWindow no cambia.
 */
export const useMessageModeration = () => {
  const moderate = (raw: string): ModerationResult => {
    const violations: Violation[] = [];

    const sanitized = banPhone(raw);
    if (sanitized !== raw) {
      violations.push({ reason: "phone_number", rawMessage: raw });
    }

    return { sanitized, violations };
  };

  const reportViolations = async (
    violations: Violation[],
    purchaseNotificationId: string,
  ) => {
    await Promise.all(
      violations.map((v) =>
        incidentsApi
          .reportIncident({
            purchaseNotificationId,
            reason: v.reason,
            message: v.rawMessage,
          })
          .catch((err) => {
            console.error("[moderation] No se pudo reportar incidencia:", err);
          }),
      ),
    );
  };

  return { moderate, reportViolations };
};
