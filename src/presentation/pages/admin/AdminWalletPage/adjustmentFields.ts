import type { FormField } from "@/presentation/interfaces/ui/FormProps";

// usd_amount es firmado: positivo acredita, negativo descuenta (permite dejar
// el saldo en sobregiro). El backend calcula los Bs con la tasa vigente.
export const adjustmentFields: FormField[] = [
  {
    name: "usd_amount",
    type: "number",
    label: "Monto USD (con signo)",
    placeholder: "Ej: -1.50",
    required: true,
  },
  {
    name: "reason",
    type: "textarea",
    label: "Motivo",
    placeholder: "Por qué se aplica este ajuste",
    required: true,
  },
];
