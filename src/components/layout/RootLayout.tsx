import { useState, type FC } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMenu } from "react-icons/lu";
import Navbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";
import Footer from "./Footer";
import SearchInput from "../ui/SearchInput";
import type { NavItem } from "../../interfaces/components/NavbarProps";

const NAV_SECTIONS: NavItem[] = [
  { label: "Inicio", path: "/" },
  { label: "Categorías", path: "/categorias" },
  { label: "Vender", path: "/vender" },
  { label: "Notificaciones", path: "/notificaciones" },
];

const RootLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToLogin = () => navigate("/login", { state: { from: location } });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop navbar */}
      <div className="hidden lg:block sticky top-0 z-50 pt-4">
        <Navbar sections={NAV_SECTIONS} onLoginClick={() => goToLogin()} />
      </div>

      {/* Mobile top bar with hamburger + search */}
      <div className="lg:hidden sticky top-4 z-30 flex items-center gap-3 px-4">
        <motion.button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          className="shrink-0 p-2 rounded-2xl bg-white shadow-sm border border-gray-100 text-primary cursor-pointer"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <LuMenu size={32} />
        </motion.button>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <SearchInput placeholder="Buscar" />
        </motion.div>
      </div>

      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={NAV_SECTIONS}
        onLoginClick={() => goToLogin()}
      />

      <Outlet />
      <Footer
        contactEmail="soporte@agrodil.com"
        contactPhone="+58 412 996 8751"
        socialLinks={{
          instagram: "https://instagram.com/agrodil",
          facebook: "https://facebook.com/agrodil",
          whatsapp: "https://wa.me/584129968751",
        }}
      />
    </div>
  );
};

export default RootLayout;
