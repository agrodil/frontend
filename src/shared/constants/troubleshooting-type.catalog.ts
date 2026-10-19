// Tipos de problema (subsistemas). Los ids coinciden con la tabla
// troubleshooting_type en la base de datos.
export interface TroubleshootingTypeOption {
  value: number;
  label: string;
}

export const TROUBLESHOOTING_TYPES: TroubleshootingTypeOption[] = [
  { value: 1, label: "Comprar" },
  { value: 2, label: "Vender" },
  { value: 3, label: "Publicaciones" },
  { value: 4, label: "Notificaciones y mensajes" },
  { value: 5, label: "Perfil de usuario" },
];

export const TROUBLESHOOTING_TYPE_LABELS: Record<number, string> =
  Object.fromEntries(TROUBLESHOOTING_TYPES.map((t) => [t.value, t.label]));
