import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { NavItem } from "../../interfaces/components/NavbarProps";

const NAV_SECTIONS: NavItem[] = [
  { label: "Inicio", path: "/" },
  { label: "Categorías", path: "/categorias" },
  { label: "Vender", path: "/vender" },
  { label: "Notificaciones", path: "/notificaciones" },
];

const RootLayout: FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar sections={NAV_SECTIONS} />

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
