export interface LocationValue {
  stateId: string;
  townshipId: string;
}

export interface LocationSelectsProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  stateLabel?: string;
  townshipLabel?: string;
  // Si se define, la opción vacía es seleccionable y usa este texto (modo filtro,
  // p.ej. "Todos"). Si se omite, la opción vacía queda deshabilitada y el campo
  // se comporta como un selector obligatorio.
  emptyOptionLabel?: string;
  error?: string | null;
  className?: string;
}
