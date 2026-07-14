import { banPhone } from "@/shared/utils/banPhone";
import { banEmail } from "@/shared/utils/banEmail";
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

// Agregar un nuevo motivo (lenguaje soez, etc.) es sumar otro checker acá —
// el call site en ChatWindow no cambia. `ban` debe devolver el mensaje sin
// tocar si no detecta nada, o "*".repeat(length) si sí (mismo contrato que
// banPhone/banEmail).
const CHECKERS: { reason: IncidentReason; ban: (s: string) => string }[] = [
  { reason: "phone_number", ban: banPhone },
  { reason: "email", ban: banEmail },
];

/**
 * Abstrae la censura de mensajes de chat y el reporte de incidencias de
 * moderación.
 */
export const useMessageModeration = () => {
  /**
   * @param raw mensaje actual, sin censurar
   * @param recentOwnMessages últimos mensajes propios ya enviados en este chat
   * (más antiguo → más reciente), para detectar un dato partido entre varios
   * mensajes (ej: "0412" en uno, "9968751" en el siguiente — ninguno matchea
   * solo, concatenados sí; igual aplica a un correo partido).
   */
  const moderate = (
    raw: string,
    recentOwnMessages: string[] = [],
  ): ModerationResult => {
    const violations: Violation[] = [];
    let blocked = false;

    for (const { reason, ban } of CHECKERS) {
      if (ban(raw) !== raw) {
        violations.push({ reason, rawMessage: raw });
        blocked = true;
        continue;
      }

      if (recentOwnMessages.length > 0) {
        const combined = [...recentOwnMessages, raw].join(" ");
        if (ban(combined) !== combined) {
          violations.push({ reason, rawMessage: combined });
          blocked = true;
        }
      }
    }

    return {
      sanitized: blocked ? "*".repeat(raw.length) : raw,
      violations,
    };
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
