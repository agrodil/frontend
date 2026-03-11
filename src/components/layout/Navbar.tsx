import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { NavbarProps } from "../../interfaces/components/NavbarProps";
import Button from "../ui/Button";
import { LuShoppingCart } from "react-icons/lu";

const Navbar: FC<NavbarProps> = ({
  sections,
  isAuthenticated = false,
  onLoginClick,
  onCartClick,
}) => {
  return (
    <motion.nav
      className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between sticky top-0 z-50"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <ul className="flex items-center gap-8 list-none m-0 p-0">
        {sections.map((section) => (
          <li key={section.path}>
            <Link
              to={section.path}
              className="text-gray-800 font-medium text-sm hover:text-primary transition-colors no-underline"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <button
          onClick={onCartClick}
          className="text-gray-700 hover:text-primary transition-colors p-1 cursor-pointer bg-transparent border-0"
          aria-label="Carrito"
        >
          <LuShoppingCart />
        </button>
        {!isAuthenticated && (
          <Button
            label="Iniciar Sesión"
            variant="primary"
            size="sm"
            onClick={onLoginClick}
          />
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
