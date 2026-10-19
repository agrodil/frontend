import { fetchWithAuth } from "../fetchWithAuth";

export type IncidentReason = "phone_number" | "email";

export const incidentsApi = {
  reportIncident: async (data: {
    purchaseNotificationId: string;
    reason: IncidentReason;
    message: string;
  }): Promise<void> => {
    const response = await fetchWithAuth("/notifications/incidents", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Failed to report incident (${response.status})${body ? `: ${body}` : ""}`);
    }
  },
};
