// Estados de Venezuela. Los ids coinciden con la tabla `state` de la base de
// datos (seeds/catalog/001-insert-states.sql). No reordenar ni renumerar: el id
// es la clave foránea real que se usa para agrupar los municipios.
export interface StateOption {
  value: number;
  label: string;
}

export const states: StateOption[] = [
  { value: 1, label: "Amazonas" },
  { value: 2, label: "Anzoátegui" },
  { value: 3, label: "Apure" },
  { value: 4, label: "Aragua" },
  { value: 5, label: "Barinas" },
  { value: 6, label: "Bolívar" },
  { value: 7, label: "Carabobo" },
  { value: 8, label: "Cojedes" },
  { value: 9, label: "Delta Amacuro" },
  { value: 10, label: "Distrito Capital" },
  { value: 11, label: "Falcón" },
  { value: 12, label: "Guárico" },
  { value: 13, label: "Lara" },
  { value: 14, label: "Mérida" },
  { value: 15, label: "Miranda" },
  { value: 16, label: "Monagas" },
  { value: 17, label: "Nueva Esparta" },
  { value: 18, label: "Portuguesa" },
  { value: 19, label: "Sucre" },
  { value: 20, label: "Táchira" },
  { value: 21, label: "Trujillo" },
  { value: 22, label: "Vargas" },
  { value: 23, label: "Yaracuy" },
  { value: 24, label: "Zulia" },
];

export const STATE_LABELS: Record<number, string> = Object.fromEntries(
  states.map((s) => [s.value, s.label]),
);
