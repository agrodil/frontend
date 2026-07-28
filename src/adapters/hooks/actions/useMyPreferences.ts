import { useEffect, useState } from "react";
import { userPreferencesApi } from "@/api/clients/userPreferences.api";
import type { UserPreferences } from "@/api/interfaces/responses/UserPreferences.interface";

export interface UseMyPreferencesResult {
  preferences: UserPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setEmailOnPurchaseRequest: (checked: boolean) => void;
  save: () => Promise<void>;
}

// Preferencias del usuario. Carga perezosa: solo pide datos la primera vez
// que `enabled` (tab "preferencias" activo) pasa a true.
export function useMyPreferences(enabled: boolean): UseMyPreferencesResult {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(
    null,
  );
  const [fetched, setFetched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || fetched) return;
    let cancelled = false;
    userPreferencesApi
      .getPreferences()
      .then((prefs) => {
        if (!cancelled) setPreferencesState(prefs);
      })
      .catch(() => {
        if (!cancelled) {
          setPreferencesState({ email_on_purchase_request: false });
        }
      })
      .finally(() => {
        if (!cancelled) setFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, fetched]);

  const setEmailOnPurchaseRequest = (checked: boolean) => {
    setPreferencesState((p) =>
      p
        ? { ...p, email_on_purchase_request: checked }
        : { email_on_purchase_request: checked },
    );
  };

  const save = async () => {
    if (!preferences) return;
    const prev = preferences;
    setSaving(true);
    setError(null);
    try {
      const updated = await userPreferencesApi.updatePreferences(preferences);
      setPreferencesState(updated);
    } catch {
      setPreferencesState(prev);
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading: enabled && !fetched,
    saving,
    error,
    setEmailOnPurchaseRequest,
    save,
  };
}
