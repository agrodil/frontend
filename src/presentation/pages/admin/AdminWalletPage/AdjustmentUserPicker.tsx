import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSearch, LuLoader, LuUser, LuCheck } from "react-icons/lu";
import type { AdminUser } from "@/api/clients/admin.api";

type AdjustmentUserPickerProps = {
  query: string;
  onQueryChange: (value: string) => void;
  searching: boolean;
  foundUser: AdminUser | null;
  searchError: string | null;
  selectedUser: AdminUser | null;
  onSelect: (user: AdminUser) => void;
};

// Buscador de usuario por correo / documento, reutiliza useAdminUserSearch en el
// componente padre. Versión slim de UserSearchBox.
const AdjustmentUserPicker: FC<AdjustmentUserPickerProps> = ({
  query,
  onQueryChange,
  searching,
  foundUser,
  searchError,
  selectedUser,
  onSelect,
}) => (
  <div className="flex flex-col gap-3">
    <label className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
      <LuSearch size={16} className="text-primary" />
      Usuario a ajustar
    </label>
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Correo o documento (V-12345678 / J-123456789)"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm pr-10
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                   placeholder:text-gray-400"
      />
      {searching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <LuLoader size={16} className="text-gray-400 animate-spin" />
        </span>
      )}
    </div>

    <AnimatePresence mode="wait">
      {selectedUser ? (
        <motion.div
          key="selected"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <LuCheck size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {selectedUser.display_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
          </div>
        </motion.div>
      ) : !searching && foundUser ? (
        <motion.button
          key="found"
          type="button"
          onClick={() => onSelect(foundUser)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-3 text-left
                     hover:border-green-300 transition-colors cursor-pointer w-full"
        >
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <LuUser size={16} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {foundUser.display_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{foundUser.email}</p>
          </div>
          <span className="text-xs font-semibold text-green-700 shrink-0">
            Seleccionar
          </span>
        </motion.button>
      ) : !searching && searchError && query.trim() ? (
        <motion.p
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm text-red-500"
        >
          {searchError}
        </motion.p>
      ) : null}
    </AnimatePresence>
  </div>
);

export default AdjustmentUserPicker;
