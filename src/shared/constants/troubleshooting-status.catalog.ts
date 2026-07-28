// Estados de un reporte. Los ids coinciden con la tabla troubleshooting_status.
// badgeClass: colores de badge (rojo=reportado, amarillo=identificado, verde=solucionado).
export interface TroubleshootingStatusMeta {
  label: string;
  badgeClass: string;
}

export const TROUBLESHOOTING_STATUS: Record<number, TroubleshootingStatusMeta> =
  {
    1: {
      label: "Reportado",
      badgeClass: "bg-red-50 text-red-700",
    },
    2: {
      label: "Identificado",
      badgeClass: "bg-amber-50 text-amber-700",
    },
    3: {
      label: "Solucionado",
      badgeClass: "bg-green-50 text-green-700",
    },
  };

export const TROUBLESHOOTING_STATUS_OPTIONS = Object.entries(
  TROUBLESHOOTING_STATUS,
).map(([value, meta]) => ({ value: Number(value), label: meta.label }));
