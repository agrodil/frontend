import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX } from "react-icons/lu";

import Button from "@/presentation/ui/Button";
import { states } from "@/shared/constants/state.catalog";
import { TOWNSHIP_BY_ID } from "@/shared/constants/townships.catalog";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";
import { formatUsd } from "@/shared/utils/formatMoney";
import {
  POST_CATEGORY,
  isLivestockCategory,
} from "@/shared/utils/resolvePostPricing";
import type { CatalogState } from "@/adapters/hooks/actions/useCatalog";
import type { LocationValue } from "@/presentation/interfaces/ui/LocationSelectsProps";

interface ConfirmPublishModalProps {
  formData: Record<string, unknown>;
  location: LocationValue;
  catalog: Pick<
    CatalogState,
    "categories" | "livestockSectors" | "livestockSubcategories" | "postingFees"
  >;
  mediaCount: number;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error: string | null;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown): number | null =>
  typeof v === "string" && v !== "" ? Number(v) : null;

const findLabel = (
  options: { value: string | number; label: string }[],
  value: unknown,
): string | null =>
  options.find((o) => String(o.value) === String(value))?.label ?? null;

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-gray-200 last:border-0">
    <span className="text-xs text-gray-500 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-900 text-right">
      {value}
    </span>
  </div>
);

// Los detalles son texto libre y pueden ser largos — a diferencia de las
// demás filas (una línea, truncan mal), acá se necesita poder leer todo sin
// que empuje el resto del modal, de ahí la caja con scroll propio y altura
// limitada en vez de un Row más.
const DetailsBlock: FC<{ value: string }> = ({ value }) => (
  <div className="py-1.5 border-b border-gray-200 last:border-0">
    <span className="text-xs text-gray-500">Detalles</span>
    <div className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap break-words text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
      {value}
    </div>
  </div>
);

const ConfirmPublishModal: FC<ConfirmPublishModalProps> = ({
  formData,
  location,
  catalog,
  mediaCount,
  onClose,
  onConfirm,
  loading,
  error,
}) => {
  const postCategoryId = num(formData.postCategoryId) ?? 0;
  const saleTypeId = num(formData.saleTypeId);
  const isLivestock = isLivestockCategory(postCategoryId);

  const stateLabel = location.stateId
    ? (states.find((s) => String(s.value) === location.stateId)?.label ?? null)
    : null;
  const townshipLabel = location.townshipId
    ? (TOWNSHIP_BY_ID[Number(location.townshipId)]?.name ?? null)
    : null;

  const planLabel = findLabel(catalog.postingFees, formData.postingFeeId);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex items-start justify-between gap-2 p-6 pb-2">
            <h2 className="text-xl font-bold text-primary leading-snug">
              Confirma tu publicación
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent shrink-0 disabled:opacity-40"
            >
              <LuX size={18} />
            </button>
          </div>

          <div className="px-6 overflow-y-auto flex-1">
            <p className="text-sm text-gray-600 mb-3">
              Revisa los datos antes de publicar. Se cobrará el plan elegido a
              tu cartera.
            </p>

            <div className="flex flex-col px-4 max-h-[400px] overflow-y-auto">
              <Row
                label="Categoría"
                value={findLabel(catalog.categories, postCategoryId) ?? "—"}
              />
              <Row label="Título" value={str(formData.postName) || "—"} />
              {(stateLabel || townshipLabel) && (
                <Row
                  label="Ubicación"
                  value={[townshipLabel, stateLabel].filter(Boolean).join(", ")}
                />
              )}

              {isLivestock && (
                <>
                  <Row
                    label="Rubro"
                    value={
                      findLabel(
                        catalog.livestockSectors,
                        formData.livestockSectorId,
                      ) ?? "—"
                    }
                  />
                  <Row
                    label="Tipo de venta"
                    value={saleTypeId === 1 ? "Por peso" : "Por unidad"}
                  />
                  <Row
                    label="Sexo"
                    value={findLabel(SEX_LABEL, formData.sex) ?? "—"}
                  />
                  <Row
                    label="Raza predominante"
                    value={str(formData.predominantBreed) || "—"}
                  />
                  {postCategoryId === POST_CATEGORY.BOVINO &&
                    formData.postSubcategoryId && (
                      <Row
                        label="Tipo de animal"
                        value={
                          findLabel(
                            catalog.livestockSubcategories,
                            formData.postSubcategoryId,
                          ) ?? "—"
                        }
                      />
                    )}
                  <Row label="Cantidad" value={str(formData.quantity) || "—"} />
                  {saleTypeId === 1 ? (
                    <>
                      <Row
                        label="Peso promedio"
                        value={
                          formData.avgWeightKg
                            ? `${str(formData.avgWeightKg)} kg`
                            : "—"
                        }
                      />
                      <Row
                        label="Precio"
                        value={
                          formData.pricePerKg
                            ? `${formatUsd(str(formData.pricePerKg))} / kg`
                            : "—"
                        }
                      />
                      <Row
                        label="Base del precio"
                        value={
                          formData.priceWeightBasis === "Pie"
                            ? "En pie (animal vivo)"
                            : formData.priceWeightBasis === "Canal"
                              ? "En canal (animal faenado)"
                              : "—"
                        }
                      />
                    </>
                  ) : (
                    <Row
                      label="Precio"
                      value={
                        formData.pricePerUnit
                          ? formatUsd(str(formData.pricePerUnit))
                          : "—"
                      }
                    />
                  )}
                </>
              )}

              {postCategoryId === POST_CATEGORY.MAQUINARIA && (
                <>
                  {formData.postBrand && (
                    <Row label="Marca" value={str(formData.postBrand)} />
                  )}
                  <Row
                    label="Precio"
                    value={
                      formData.pricePerUnit
                        ? formatUsd(str(formData.pricePerUnit))
                        : "—"
                    }
                  />
                </>
              )}

              {postCategoryId === POST_CATEGORY.FINCAS && (
                <>
                  <Row
                    label="Hectáreas"
                    value={str(formData.farmHectares) || "—"}
                  />
                  <Row
                    label="Precio por hectárea"
                    value={
                      formData.pricePerHectare
                        ? formatUsd(str(formData.pricePerHectare))
                        : "—"
                    }
                  />
                </>
              )}

              {postCategoryId === POST_CATEGORY.INSUMOS && (
                <Row
                  label="Precio"
                  value={
                    formData.pricePerUnit
                      ? formatUsd(str(formData.pricePerUnit))
                      : "—"
                  }
                />
              )}

              <Row
                label="Fotos y videos"
                value={`${mediaCount} archivo${mediaCount === 1 ? "" : "s"}`}
              />
              <Row label="Duración del plan" value={planLabel ?? "—"} />

              {str(formData.details) && (
                <DetailsBlock value={str(formData.details)} />
              )}
            </div>
          </div>

          <div className="p-6 pt-4 flex flex-col gap-3">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3">
              <Button
                label="Regresar"
                variant="secondary"
                className="flex-1"
                disabled={loading}
                onClick={onClose}
              />
              <Button
                label={loading ? "Publicando…" : "Publicar"}
                variant="primary"
                className="flex-1"
                disabled={loading}
                onClick={onConfirm}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmPublishModal;
