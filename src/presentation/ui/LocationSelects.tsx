import type { FC } from "react";

import { states } from "@/shared/constants/state.catalog";
import { townshipsByState } from "@/shared/constants/townships.catalog";
import type { LocationSelectsProps } from "@/presentation/interfaces/ui/LocationSelectsProps";

const baseInput =
  "w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-primary/40 transition-colors placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

const labelClass = "text-sm font-medium text-gray-700";

const LocationSelects: FC<LocationSelectsProps> = ({
  value,
  onChange,
  stateLabel = "Estado",
  townshipLabel = "Municipio",
  emptyOptionLabel,
  error,
  className = "",
}) => {
  const townshipOptions = value.stateId
    ? (townshipsByState[Number(value.stateId)] ?? [])
    : [];
  const isFilter = emptyOptionLabel !== undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="location-state">
            {stateLabel}
          </label>
          <select
            id="location-state"
            value={value.stateId}
            // Cambiar de estado invalida el municipio elegido: siempre se limpia.
            onChange={(e) =>
              onChange({ stateId: e.target.value, townshipId: "" })
            }
            className={baseInput}
          >
            <option value="" disabled={!isFilter}>
              {emptyOptionLabel ?? "Selecciona el estado"}
            </option>
            {states.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="location-township">
            {townshipLabel}
          </label>
          <select
            id="location-township"
            value={value.townshipId}
            disabled={!value.stateId}
            onChange={(e) =>
              onChange({ ...value, townshipId: e.target.value })
            }
            className={baseInput}
          >
            <option value="" disabled={!isFilter}>
              {value.stateId
                ? (emptyOptionLabel ?? "Selecciona el municipio")
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

export default LocationSelects;
