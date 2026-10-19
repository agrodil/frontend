import type { FormField } from "@/presentation/interfaces/ui/FormProps";

// Formulario del paso 3 (ya elegida la cuenta y hecho el pago). El comprobante
// se valida en el hook (tamaño de salida tras comprimir).
export const depositFields: FormField[] = [
  {
    name: "reference_number",
    type: "text",
    label: "Número de referencia",
    placeholder: "Ej: 000123456789",
    required: true,
  },
  {
    name: "amount_bs",
    type: "number",
    label: "Monto pagado (Bs)",
    placeholder: "Ej: 150.00",
    required: true,
  },
  {
    name: "receipt_image",
    type: "image",
    label: "Captura del comprobante",
    accept: "image/jpeg,image/png,image/webp",
    required: true,
  },
];
