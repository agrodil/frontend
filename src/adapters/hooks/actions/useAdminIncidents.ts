import { useEffect, useState } from "react";
import { adminApi } from "@/api/clients/admin.api";
import type { AdminIncident } from "@/api/clients/admin.api";

const INCIDENTS_LIMIT = 100;

export const useAdminIncidents = () => {
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [incidentsError, setIncidentsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getIncidents(INCIDENTS_LIMIT, 0)
      .then((result) => {
        if (!cancelled) setIncidents(result.incidents);
      })
      .catch(() => {
        if (!cancelled) setIncidentsError("Error al cargar las incidencias.");
      })
      .finally(() => {
        if (!cancelled) setIncidentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { incidents, incidentsLoading, incidentsError };
};
