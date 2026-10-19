import { useState, type Dispatch, type SetStateAction } from "react";

// Estado local "sembrado" desde un valor externo (p.ej. datos de un loader) que
// debe re-sincronizarse cada vez que ese valor cambia de identidad, sin perder
// las mutaciones locales optimistas hechas mientras tanto (ej. una edición
// desde un modal). Ajusta el estado durante el render (patrón oficial de React,
// "Adjusting state when a prop changes") en vez de con un useEffect, que
// dispara un render en cascada innecesario.
export function useSyncedState<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
  const [prev, setPrev] = useState(value);
  const [state, setState] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setState(value);
  }
  return [state, setState];
}
