import { fetchWithAuth } from "../fetchWithAuth";
import type { UserPreferences } from "@/api/interfaces/responses/UserPreferences.interface";

const DEFAULTS: UserPreferences = { email_on_purchase_request: false };

export const userPreferencesApi = {
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await fetchWithAuth("/users/me/preferences");
    if (!response.ok) return DEFAULTS;
    const json = await response.json();
    return json.data ?? DEFAULTS;
  },

  updatePreferences: async (
    data: Partial<UserPreferences>,
  ): Promise<UserPreferences> => {
    const response = await fetchWithAuth("/users/me/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update preferences");
    const json = await response.json();
    return json.data ?? DEFAULTS;
  },
};
