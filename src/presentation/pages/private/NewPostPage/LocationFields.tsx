import type { FC } from "react";

import { states } from "@/shared/constants/state.catalog";
import { townshipsByState } from "@/shared/constants/townships.catalog";
import type { LocationFieldsProps } from "@/presentation/interfaces/ui/LocationFieldsProps";

const baseInput =
  "w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-primary/40 transition-colors placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

const labelClass = "text-sm font-medium text-gray-700";

const LocationFields: FC<LocationFieldsProps> = ({
  value,
  onChange,
  error,
}) => {
  const townshipOptions = value.stateId
    ? (townshipsByState[Number(value.stateId)] ?? [])
    : [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="post-state">
            Estado del ganado
          </label>
          <select
            id="post-state"
            value={value.stateId}
            onChange={(e) =>
              onChange({ stateId: e.target.value, townshipId: "" })
            }
            className={baseInput}
          >
            <option value="" disabled>
              Selecciona el estado
            </option>
            {states.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="post-township">
            Municipio del ganado
          </label>
          <select
            id="post-township"
            value={value.townshipId}
            disabled={!value.stateId}
            onChange={(e) =>
              onChange({ ...value, townshipId: e.target.value })
            }
            className={baseInput}
          >
            <option value="" disabled>
              {value.stateId
                ? "Selecciona el municipio"
                : "Selecciona primero un estado"}
            </option>
            {townshipOptions.map((township) => (
              <option key={township.value} value={township.value}>
                {township.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-0.5 pl-1">{error}</p>}
    </div>
  );
};

export default LocationFields;
