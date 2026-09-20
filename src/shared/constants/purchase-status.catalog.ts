// purchase_status_id: 2 = aprobado (vendedor), 3 = rechazado (vendedor), 4 = cancelado (comprador)
export const PURCHASE_STATUS_APPROVED = 2;
export const PURCHASE_STATUS_REJECTED = 3;
export const PURCHASE_STATUS_CANCELLED = 4;

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
