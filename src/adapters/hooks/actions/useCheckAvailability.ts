import { useState, useCallback, useRef } from "react";

export const useCheckAvailability = <T = unknown>(
  checkFunction: (value: string) => Promise<T>,
  errorMessage: string = "El dato ingresado ya se encuentra registrado.",
  debounceTime: number = 500,
) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(
    (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!value.trim()) {
        setIsAvailable(null);
        setError(null);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      setError(null);
      setIsAvailable(null);

      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await checkFunction(value);
          const hasResults = Array.isArray(result)
            ? result.length > 0
            : (result as { rows?: number })?.rows !== undefined
              ? (result as { rows?: number }).rows! > 0
              : !!result;

          if (hasResults) {
            throw new Error(errorMessage);
          }

          setIsAvailable(true);
          setError(null);
        } catch (err) {
          setIsAvailable(false);
          setError(
            err instanceof Error ? err.message : "El valor no está disponible.",
          );
        } finally {
          setIsChecking(false);
        }
      }, debounceTime);
    },
    [checkFunction, debounceTime],
  );

  return { check, isChecking, isAvailable, error };
};
