import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuLoader, LuCheck } from "react-icons/lu";

import Button from "@/presentation/ui/Button";
import { useAdminCattlePrices } from "@/adapters/hooks/actions/useAdminCattlePrices";
import type { AdminCattlePriceAverage } from "@/api/clients/admin.api";

type RowState = {
  live: string;
  carcass: string;
  saving: boolean;
  error: string | null;
  saved: boolean;
};

const toInputValue = (v: string | null): string => (v == null ? "" : v);

const PriceRow: FC<{
  average: AdminCattlePriceAverage;
  onSave: (
    id: number,
    input: { avgPricePerKgLive?: number; avgPricePerKgCarcass?: number },
  ) => Promise<string | null>;
}> = ({ average, onSave }) => {
  const [state, setState] = useState<RowState>({
    live: toInputValue(average.avg_price_per_kg_live),
    carcass: toInputValue(average.avg_price_per_kg_carcass),
    saving: false,
    error: null,
    saved: false,
  });

  const handleSave = async () => {
    const live = state.live.trim();
    const carcass = state.carcass.trim();
    const liveNum = live ? Number(live) : undefined;
    const carcassNum = carcass ? Number(carcass) : undefined;

    if (
      (live && (!Number.isFinite(liveNum) || (liveNum as number) <= 0)) ||
      (carcass && (!Number.isFinite(carcassNum) || (carcassNum as number) <= 0))
    ) {
      setState((s) => ({
        ...s,
        error: "El precio debe ser un número mayor a 0.",
        saved: false,
      }));
      return;
    }
    if (liveNum === undefined && carcassNum === undefined) {
      setState((s) => ({
        ...s,
        error: "Ingresa al menos un precio.",
        saved: false,
      }));
      return;
    }

    setState((s) => ({ ...s, saving: true, error: null, saved: false }));
    const error = await onSave(average.post_subcategory_id, {
      avgPricePerKgLive: liveNum,
      avgPricePerKgCarcass: carcassNum,
    });
    setState((s) => ({
      ...s,
      saving: false,
      error,
      saved: !error,
    }));
  };

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-2.5 pr-4 text-gray-800 font-medium whitespace-nowrap">
        {average.post_subcategory_name}
      </td>
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.live}
            onChange={(e) =>
              setState((s) => ({ ...s, live: e.target.value, saved: false }))
            }
            placeholder="—"
            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </td>
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.carcass}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                carcass: e.target.value,
                saved: false,
              }))
            }
            placeholder="—"
            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </td>
      <td className="py-2.5 pr-4 text-gray-400 text-xs whitespace-nowrap">
        {new Date(average.updated_at).toLocaleString("es-VE", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </td>
      <td className="py-2.5">
        <div className="flex items-center gap-2">
          <Button
            label={state.saving ? "Guardando..." : "Guardar"}
            variant="primary"
            size="sm"
            disabled={state.saving}
            onClick={handleSave}
          />
          {state.saved && (
            <LuCheck size={18} className="text-green-600 shrink-0" />
          )}
        </div>
        {state.error && (
          <p className="text-red-500 text-xs mt-1 max-w-40">{state.error}</p>
        )}
      </td>
    </tr>
  );
};

const AdminCattlePricesPage: FC = () => {
  const { averages, loading, error, update } = useAdminCattlePrices();

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <Link
          to="/admin"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
            Precio promedio de ganado
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Precio de referencia por kg, en pie y en canal, por subcategoría.
            Se muestra en la página de inicio.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-w-0"
      >
        {loading && (
          <div className="flex justify-center py-10">
            <LuLoader size={22} className="text-gray-400 animate-spin" />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && averages.length === 0 && (
          <p className="text-sm text-gray-400">
            No hay subcategorías de ganado todavía.
          </p>
        )}

        {!loading && averages.length > 0 && (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="font-semibold py-2 pr-4">Subcategoría</th>
                  <th className="font-semibold py-2 pr-4">En pie ($/kg)</th>
                  <th className="font-semibold py-2 pr-4">En canal ($/kg)</th>
                  <th className="font-semibold py-2 pr-4">Actualizado</th>
                  <th className="font-semibold py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {averages.map((average) => (
                  <PriceRow
                    key={average.post_subcategory_id}
                    average={average}
                    onSave={update}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default AdminCattlePricesPage;
