export const purchaseStatuses: Record<
  number,
  { label: string; color: string }
> = {
  1: { label: "Pendiente", color: "yellow" },
  2: { label: "Aprobado", color: "green" },
  3: { label: "Rechazado", color: "red" },
  4: { label: "Cancelado", color: "gray" },
  5: { label: "Completado", color: "green" },
};
