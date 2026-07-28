import type { UseMyPreferencesResult } from "@/adapters/hooks/actions/useMyPreferences";

export interface PreferencesTabProps {
  preferences: UseMyPreferencesResult;
  userEmail: string;
}
