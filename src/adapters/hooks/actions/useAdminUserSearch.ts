import { useEffect, useRef, useState } from "react";
import { adminApi } from "@/api/clients/admin.api";
import type { AdminUser } from "@/api/clients/admin.api";

const SEARCH_DEBOUNCE_MS = 400;

export const useAdminUserSearch = () => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<AdminUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cuando se inyecta un usuario directamente (ej. desde una incidencia), el
  // cambio de `query` no debe disparar una búsqueda de red — el nombre a
  // mostrar no es buscable (adminApi.searchUser solo soporta email/documento).
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setFoundUser(null);
      setSearchError(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchError(null);

    searchDebounce.current = setTimeout(async () => {
      try {
        const user = await adminApi.searchUser(trimmed);
        if (user) {
          setFoundUser(user);
          setSearchError(null);
        } else {
          setFoundUser(null);
          setSearchError(
            "No se encontró ningún usuario con ese correo o número de documento.",
          );
        }
      } catch {
        setFoundUser(null);
        setSearchError("Error al buscar el usuario.");
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [query]);

  /** Inyecta un usuario ya conocido (ej. el infractor de una incidencia) sin
   * disparar una búsqueda de red. */
  const setFoundUserDirectly = (user: AdminUser, displayQuery: string) => {
    skipNextSearch.current = true;
    setSearchError(null);
    setSearching(false);
    setFoundUser(user);
    setQuery(displayQuery);
  };

  const reset = () => {
    skipNextSearch.current = false;
    setQuery("");
    setFoundUser(null);
    setSearchError(null);
    setSearching(false);
  };

  return {
    query,
    setQuery,
    searching,
    foundUser,
    searchError,
    setFoundUserDirectly,
    reset,
  };
};
