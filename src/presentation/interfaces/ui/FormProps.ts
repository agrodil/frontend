import type { ReactNode } from "react";
import type { ZodTypeAny } from "zod";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "select"
  | "tel"
  | "number"
  | "textarea"
  | "image"
  | "media"
  | "checkbox";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  type: FieldType;
  placeholder?: string;
  label?: string;
  required?: boolean;
  optional?: boolean;
  options?: SelectOption[]; // for select fields
  accept?: string; // for image/media fields (e.g. "image/*,video/*")
  maxFiles?: number; // for media fields
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  canUpdate?: boolean;
  checkboxLabel?: string;
  dependsOn?: {
    fieldName: string;
    value: string | number;
  };
  onAsyncCheck?: (value: string) => void;
  // Para campos image: se dispara al seleccionar archivo (validación async con los
  // valores actuales del form, p.ej. cross-check OCR contra otro campo).
  onFileSelect?: (file: File, values: Record<string, string>) => void;
  asyncError?: string | null;
  isChecking?: boolean;
  asyncAvailable?: boolean | null;
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string | File | File[] | boolean>) => void;
  schema?: ZodTypeAny;
  submitLabel?: string;
  title?: string;
  isLoading?: boolean;
  className?: string;
  footer?: ReactNode;
  singleColumn?: boolean;
  backendErrors?: Record<string, string>;
  // Muestra el aviso de aceptación de Términos y Política de privacidad (solo
  // aplica al registro, no al login/verificación).
  showLegalNotice?: boolean;
}
