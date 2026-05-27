import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { NavbarProps } from "../../interfaces/components/ui/NavbarProps";
import Button from "../ui/Button";
import UserMenu from "../ui/UserMenu";
import { useAuth } from "../../hooks/useAuth";

const Navbar: FC<NavbarProps> = ({ sections, onLoginClick }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="flex items-center gap-4 w-[90vw] mx-auto pb-4">
      <motion.nav
        className="bg-white border border-gray-200 px-8 py-1.5 flex items-center justify-between flex-1 rounded-2xl shadow-sm text-primary w-[80%]"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <ul className="flex w-full list-none m-0 p-0">
          {sections.map((section, i) => (
            <li key={i} className="flex-1">
              {section.onClick ? (
                <button
                  type="button"
                  onClick={section.onClick}
                  aria-label={section.label}
                  className={`w-full font-medium text-sm transition-colors border-0 cursor-pointer p-2 flex items-center justify-center ${section.className ?? ""}`}
                >
                  {section.icon ?? section.label}
                </button>
              ) : (
                <Link
                  to={section.path ?? "/"}
                  className={`relative w-full font-medium text-sm transition-colors no-underline flex items-center justify-center p-2 ${section.className ?? ""}`}
                >
                  {section.icon ?? section.label}
                  {section.badge != null && section.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white text-[10px] px-1">
                      {section.badge > 99 ? "99+" : section.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-[20%]"
      >
        {isAuthenticated && user ? (
          <UserMenu user={user} />
        ) : (
          <Button
            label="Iniciar Sesión"
            variant="primary"
            size="sm"
            onClick={onLoginClick}
            className="w-full py-1.5 rounded-2xl shadow-sm"
          />
        )}
      </motion.div>
    </div>
  );
};

export default Navbar;
