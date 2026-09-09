import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { NavbarProps } from "@/presentation/interfaces/ui/NavbarProps";
import Button from "../ui/Button";
import UserMenu from "../ui/UserMenu";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import logoPrincipal from "@/presentation/assets/images/AGRODIL ENTREGA_ICONO PINCIPAL  PNG.png";

const Navbar: FC<NavbarProps> = ({ sections, onLoginClick }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="flex items-center gap-4 w-[90vw] mx-auto pb-4">
      <motion.div className="shrink-0">
        <Link
          to="/"
          aria-label="Ir al inicio"
          className="flex items-center justify-center overflow-hidden rounded-xl
            [--nav-logo-h:2.25rem]
            h-[var(--nav-logo-h)] w-[calc(var(--nav-logo-h)*1.19)]
            transition-transform duration-200 hover:scale-105"
        >
          <img
            src={logoPrincipal}
            alt="Agrodil"
            className="h-[calc(var(--nav-logo-h)*1.93)] w-auto max-w-none object-contain"
          />
        </Link>
      </motion.div>

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
