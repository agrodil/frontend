import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuSearch, LuLoader, LuUser } from "react-icons/lu";
import type { AdminUser } from "@/api/clients/admin.api";
import type { PageView } from "./AdminChatPage";

type UserSearchBoxProps = {
  query: string;
  onQueryChange: (value: string) => void;
  searching: boolean;
  foundUser: AdminUser | null;
  searchError: string | null;
  view: PageView;
  onViewChats: (user: AdminUser) => void;
};

const UserSearchBox: FC<UserSearchBoxProps> = ({
  query,
  onQueryChange,
  searching,
  foundUser,
  searchError,
  view,
  onViewChats,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-xl"
  >
    <label className="flex items-center gap-2 mb-3 font-bold text-gray-900">
      <LuSearch size={18} className="text-primary" />
      Buscar usuario
    </label>
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Correo o número de documento (V-12345678 / J-123456789)"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                   placeholder:text-gray-400 pr-10"
      />
      {searching && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <LuLoader size={16} className="text-gray-400 animate-spin" />
        </span>
      )}
    </div>

    <AnimatePresence mode="wait">
      {!searching && foundUser && view === "search" && (
        <motion.div
          key="user-card"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <LuUser size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {foundUser.display_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {foundUser.email}
            </p>
            {foundUser.document_type && foundUser.document_number && (
              <p className="text-xs text-gray-400">
                {foundUser.document_type}-{foundUser.document_number}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onViewChats(foundUser)}
            className="shrink-0 bg-primary text-white text-xs font-semibold px-3 py-1.5
                       rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ver chats
          </button>
        </motion.div>
      )}

      {!searching && searchError && query.trim() && view === "search" && (
        <motion.p
          key="search-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-3 text-sm text-red-500"
        >
          {searchError}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
);

export default UserSearchBox;
