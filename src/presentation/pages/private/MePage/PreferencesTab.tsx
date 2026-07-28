import type { FC } from "react";
import { motion } from "framer-motion";
import { LuLoader } from "react-icons/lu";
import Button from "@/presentation/ui/Button.tsx";
import type { PreferencesTabProps } from "./PreferencesTabProps";

const PreferencesTab: FC<PreferencesTabProps> = ({
  preferences,
  userEmail,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col gap-6 max-w-xl"
  >
    <h2 className="text-primary font-bold text-[clamp(1.2rem,1.8vw,1.5rem)]">
      Preferencias
    </h2>

    {preferences.loading ? (
      <div className="flex justify-center py-16">
        <LuLoader size={24} className="animate-spin text-gray-400" />
      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Notificaciones
        </p>

        {/* Toggle: email en solicitud de compra */}
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="mt-0.5 relative shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={
                preferences.preferences?.email_on_purchase_request ?? false
              }
              onChange={(e) =>
                preferences.setEmailOnPurchaseRequest(e.target.checked)
              }
            />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Recibir correo al llegar una solicitud de compra
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Te enviamos un email a{" "}
              <span className="font-medium text-gray-500">{userEmail}</span>{" "}
              cuando alguien te envía una solicitud de compra.
            </p>
          </div>
        </label>

        {preferences.error && (
          <p className="text-xs text-red-500">{preferences.error}</p>
        )}

        <Button
          label={preferences.saving ? "Guardando..." : "Guardar preferencias"}
          variant="primary"
          size="sm"
          disabled={preferences.saving || !preferences.preferences}
          onClick={preferences.save}
          className="self-start px-6"
        />
      </div>
    )}
  </motion.div>
);

export default PreferencesTab;
