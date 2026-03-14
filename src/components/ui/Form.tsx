import { useState, type FC, type SyntheticEvent } from "react";
import { LuEye, LuEyeOff, LuImagePlus } from "react-icons/lu";
import Button from "./Button";
import type { FormProps } from "../../interfaces/components/Form";

const baseInput =
  "w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none border border-transparent focus:border-primary/40 transition-colors placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed";

const Form: FC<FormProps> = ({
  fields,
  onSubmit,
  submitLabel = "Enviar",
  title,
  isLoading = false,
  className = "",
  footer,
}) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]))
  );
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleFile = (name: string, file: File) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
    setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ ...values, ...files });
  };

  const toggleVisible = (name: string) =>
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));

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

      {fields.map((field) => {
        if (field.type === "select") {
          return (
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
          );
        }

        if (field.type === "textarea") {
          return (
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

        if (field.type === "password") {
          return (
            <div key={field.name} className={`relative ${field.className ?? ""}`}>
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
            </div>
          );
        }

        // text | email | tel | number
        return (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            value={values[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${baseInput} ${field.className ?? ""}`}
          />
        );
      })}

      {footer && <div className="mt-1 text-center">{footer}</div>}

      <Button
        label={isLoading ? "Cargando..." : submitLabel}
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full"
      />
    </form>
  );
};

export default Form;
