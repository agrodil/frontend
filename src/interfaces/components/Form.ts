import type { ReactNode } from "react";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "select"
  | "tel"
  | "number"
  | "textarea"
  | "image";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  type: FieldType;
  placeholder?: string;
  label?: string;
  required?: boolean;
  options?: SelectOption[]; // for select fields
  accept?: string; // for image fields (e.g. "image/png,image/jpeg")
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  canUpdate?: boolean;
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string | File>) => void;
  submitLabel?: string;
  title?: string;
  isLoading?: boolean;
  className?: string;
  footer?: ReactNode;
}
