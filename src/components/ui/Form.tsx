import { useState, useRef, type FC, type SyntheticEvent } from "react";
import {
  LuEye,
  LuEyeOff,
  LuImagePlus,
  LuPlus,
  LuX,
  LuVideo,
} from "react-icons/lu";

import Button from "./Button";

import type { FormProps } from "../../interfaces/components/FormProps";

const baseInput =
  "w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-primary/40 transition-colors placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed";

const Form: FC<FormProps> = ({
  fields,
  onSubmit,
  schema,
  submitLabel = "Enviar",
  title,
  isLoading = false,
  className = "",
  footer,
  singleColumn = false,
  backendErrors = {},
}) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""])),
  );
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [booleans, setBooleans] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      fields
        .filter((f) => f.type === "checkbox")
        .map((f) => [f.name, f.defaultValue === "true"]),
    ),
  );
  const [multiFiles, setMultiFiles] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mediaInputRef = useRef<Record<string, HTMLInputElement | null>>({});

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFile = (name: string, file: File) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
    setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  const handleMediaAdd = (name: string, maxFiles: number, incoming: File[]) => {
    setMultiFiles((prev) => {
      const current = prev[name] ?? [];
      const remaining = maxFiles - current.length;
      const toAdd = incoming.slice(0, remaining);
      return { ...prev, [name]: [...current, ...toAdd] };
    });
  };

  const handleMediaRemove = (name: string, index: number) => {
    setMultiFiles((prev) => {
      const updated = (prev[name] ?? []).filter((_, i) => i !== index);
      return { ...prev, [name]: updated };
    });
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { ...values, ...files, ...multiFiles, ...booleans };

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as string;
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }
    }

    setErrors({});
    onSubmit(data);
  };

  const toggleVisible = (name: string) =>
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));

  const FieldError = ({ name }: { name: string }) => {
    const validationError = errors[name];
    const apiError = backendErrors[name];
    const errorMessage = validationError || apiError;

    return errorMessage ? (
      <p className="text-xs text-red-500 mt-0.5 pl-1">{errorMessage}</p>
    ) : null;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 w-full ${className}`}
    >
      {title && (
        <h2 className="text-primary font-bold text-2xl uppercase text-center mb-2 tracking-wide">
          {title}
        </h2>
      )}

      <div
        className={`grid grid-cols-1 gap-4 ${singleColumn ? "" : "lg:grid-cols-2 lg:gap-6"}`}
      >
        {fields.map((field) => {
          if (field.dependsOn) {
            const shouldShow =
              values[field.dependsOn.fieldName] ===
              String(field.dependsOn.value);
            if (!shouldShow) return null;
          }

          if (field.type === "select") {
            return (
              <div
                key={field.name}
                className={`flex flex-col gap-1.5 ${field.className ?? ""}`}
              >
                {field.label && (
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                    {!field.required && (
                      <span className="italic text-gray-500 font-thin">
                        {" "}
                        {"(opcional)"}
                      </span>
                    )}
                  </label>
                )}
                <select
                  key={field.name}
                  name={field.name}
                  title={field.placeholder ?? field.label ?? field.name}
                  required={field.required}
                  disabled={field.disabled}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`${baseInput} cursor-pointer ${field.className ?? ""}`}
                >
                  <option value="" disabled>
                    {field.placeholder ?? field.label}
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError name={field.name} />
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div
                key={field.name}
                className={`flex flex-col gap-1.5 ${field.className ?? ""}`}
              >
                {field.label && (
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                    {!field.required && (
                      <span className="italic text-gray-500 font-thin">
                        {" "}
                        {"(opcional)"}
                      </span>
                    )}
                  </label>
                )}
                <textarea
                  key={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={3}
                  className={`w-full bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-primary/40 transition-colors placeholder:text-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${field.className ?? ""}`}
                />
                <FieldError name={field.name} />
              </div>
            );
          }

          if (field.type === "image") {
            return (
              <label
                key={field.name}
                className={`flex flex-col items-center justify-center gap-2 w-full h-32 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 transition-colors overflow-hidden ${field.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"} ${field.className ?? ""}`}
              >
                {previews[field.name] ? (
                  <img
                    src={previews[field.name]}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <LuImagePlus size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {field.placeholder ?? "Subir imagen"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  name={field.name}
                  accept={field.accept ?? "image/*"}
                  required={field.required}
                  disabled={field.disabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(field.name, file);
                  }}
                  className="hidden"
                />
              </label>
            );
          }

          if (field.type === "media") {
            const maxFiles = field.maxFiles ?? 10;
            const selected = multiFiles[field.name] ?? [];
            const canAdd = selected.length < maxFiles;

            return (
              <div
                key={field.name}
                className={`flex flex-col gap-1.5 ${field.className ?? ""}`}
              >
                {field.label && (
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                    <span className="ml-1 text-gray-400 font-normal text-xs">
                      ({selected.length}/{maxFiles})
                    </span>
                    {!field.required && (
                      <span className="italic text-gray-500 font-thin">
                        {" "}
                        (opcional)
                      </span>
                    )}
                  </label>
                )}

                <div className="flex flex-wrap gap-2">
                  {selected.map((file, i) => {
                    const isVideo = file.type.startsWith("video/");
                    const url = URL.createObjectURL(file);
                    return (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0"
                      >
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <LuVideo size={28} className="text-gray-500" />
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleMediaRemove(field.name, i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors border-0 cursor-pointer p-0"
                          aria-label="Eliminar"
                        >
                          <LuX size={11} />
                        </button>
                      </div>
                    );
                  })}

                  {canAdd && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors bg-gray-50 shrink-0">
                      <LuPlus size={20} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 text-center leading-tight px-1">
                        {field.placeholder ?? "Agregar"}
                      </span>
                      <input
                        ref={(el) => {
                          mediaInputRef.current[field.name] = el;
                        }}
                        type="file"
                        accept={field.accept ?? "image/*,video/*"}
                        multiple
                        required={field.required && selected.length === 0}
                        disabled={field.disabled}
                        onChange={(e) => {
                          const incoming = Array.from(e.target.files ?? []);
                          if (incoming.length)
                            handleMediaAdd(field.name, maxFiles, incoming);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          }

          if (field.type === "password") {
            return (
              <div
                key={field.name}
                className={`relative ${field.className ?? ""}`}
              >
                <input
                  type={visible[field.name] ? "text" : "password"}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`${baseInput} pr-10`}
                />
                {!field.disabled && (
                  <button
                    type="button"
                    onClick={() => toggleVisible(field.name)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-0 cursor-pointer p-0"
                  >
                    {visible[field.name] ? (
                      <LuEyeOff size={15} />
                    ) : (
                      <LuEye size={15} />
                    )}
                  </button>
                )}
                <FieldError name={field.name} />
              </div>
            );
          }

          if (field.type === "checkbox") {
            return (
              <label
                key={field.name}
                className={`flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 ${field.className ?? ""}`}
              >
                <input
                  type="checkbox"
                  name={field.name}
                  checked={booleans[field.name] ?? false}
                  disabled={field.disabled}
                  onChange={(e) =>
                    setBooleans((prev) => ({
                      ...prev,
                      [field.name]: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                {field.checkboxLabel ?? field.label ?? field.placeholder}
              </label>
            );
          }

          // text | email | tel | number
          return (
            <div
              key={field.name}
              className={`flex flex-col gap-1.5 ${field.className ?? ""}`}
            >
              {field.label && (
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                  {!field.required && (
                    <span className="italic text-gray-500 font-thin">
                      {" "}
                      {"(opcional)"}
                    </span>
                  )}
                </label>
              )}
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className={`${baseInput} ${field.className ?? ""}`}
              />
              <FieldError name={field.name} />
            </div>
          );
        })}
      </div>

      <Button
        label={isLoading ? "Cargando..." : submitLabel}
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full"
      />

      {footer && <div className="mt-1 text-center">{footer}</div>}
    </form>
  );
};

export default Form;
