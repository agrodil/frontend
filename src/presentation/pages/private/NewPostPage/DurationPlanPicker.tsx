import type { FC } from "react";
import { LuCheck } from "react-icons/lu";
import type { SelectOption } from "@/presentation/interfaces/ui/FormProps";

interface DurationPlanPickerProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

const DurationPlanPicker: FC<DurationPlanPickerProps> = ({
  options,
  value,
  onChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-3">
    {options.map((opt) => {
      const selected = String(opt.value) === value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(String(opt.value))}
          aria-pressed={selected}
          className={`relative flex-1 flex flex-col items-center gap-4 rounded-xl border-1 px-4 py-5 text-center transition-colors cursor-pointer ${
            selected
              ? "border-primary bg-primary/5"
              : "border-gray-300 bg-white hover:border-primary/40"
          }`}
        >
          {selected && (
            <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center">
              <LuCheck size={12} />
            </span>
          )}
          <span className="text-base font-bold text-gray-900">{opt.label}</span>
          {opt.sublabel && (
            <span className="text-xs text-gray-500">{opt.sublabel}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default DurationPlanPicker;
