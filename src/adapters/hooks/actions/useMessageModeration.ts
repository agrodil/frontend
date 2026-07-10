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
  /**
   * @param raw mensaje actual, sin censurar
   * @param recentOwnMessages últimos mensajes propios ya enviados en este chat
   * (más antiguo → más reciente), para detectar un teléfono partido entre
   * varios mensajes (ej: "0412" en uno, "9968751" en el siguiente — ninguno
   * matchea solo, concatenados sí).
   */
  const moderate = (
    raw: string,
    recentOwnMessages: string[] = [],
  ): ModerationResult => {
    const violations: Violation[] = [];

    const sanitized = banPhone(raw);
    if (sanitized !== raw) {
      violations.push({ reason: "phone_number", rawMessage: raw });
      return { sanitized, violations };
    }

    if (recentOwnMessages.length > 0) {
      const combined = [...recentOwnMessages, raw].join(" ");
      if (banPhone(combined) !== combined) {
        violations.push({ reason: "phone_number", rawMessage: combined });
        return { sanitized: "*".repeat(raw.length), violations };
      }
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
