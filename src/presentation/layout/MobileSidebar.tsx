import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuX } from "react-icons/lu";
import type { NavItem } from "@/presentation/interfaces/ui/NavbarProps";
import Button from "../ui/Button";
import UserMenu from "../ui/UserMenu";
import { useAuth } from "@/adapters/hooks/common/useAuth";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavItem[];
  onLoginClick?: () => void;
}

const MobileSidebar: FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  sections,
  onLoginClick,
}) => {
  const { user, isAuthenticated } = useAuth();

  const handleLoginClick = () => {
    onClose();
    onLoginClick?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="text-primary font-semibold text-lg">Menú</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent text-gray-500"
              >
                <LuX size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {sections.map((section, i) => (
                  <li key={i}>
                    {section.onClick ? (
                      <button
                        type="button"
                        onClick={() => {
                          section.onClick?.();
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-primary transition-colors hover:bg-primary/10 bg-transparent border-0 cursor-pointer text-left ${section.className ?? ""}`}
                      >
                        {section.icon && <span>{section.icon}</span>}
                        {section.label}
                      </button>
                    ) : (
                      <Link
                        to={section.path ?? "/"}
                        onClick={onClose}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-primary transition-colors hover:bg-primary/10 no-underline ${section.className ?? ""}`}
                      >
                        {section.icon && <span>{section.icon}</span>}
                        {section.label}
                        {section.badge != null && section.badge > 0 && (
                          <span className="ml-auto min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                            {section.badge > 99 ? "99+" : section.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth section */}
            <div className="px-6 py-5 border-t border-gray-100">
              {isAuthenticated && user ? (
                <UserMenu user={user} />
              ) : (
                <Button
                  label="Iniciar Sesión"
                  variant="primary"
                  size="sm"
                  onClick={handleLoginClick}
                  className="w-full"
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
