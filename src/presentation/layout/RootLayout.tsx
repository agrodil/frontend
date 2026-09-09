import { useState, useMemo, type FC } from "react";
import {
  Outlet,
  ScrollRestoration,
  useNavigate,
  useLocation,
  useNavigation,
} from "react-router-dom";
import { motion } from "framer-motion";
import { LuMenu } from "react-icons/lu";
import Navbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";
import Footer from "./Footer";
import Loader from "./Loader";
import SearchInput from "../ui/SearchInput";
import type { NavItem } from "@/presentation/interfaces/ui/NavbarProps";
import { useUnreadCount } from "@/adapters/hooks/actions/useUnreadCount";

const RootLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();
  const isRouteLoading = navigation.state !== "idle";
  const { count: unreadCount } = useUnreadCount();

  const navSections: NavItem[] = useMemo(
    () => [
      { label: "Vender", path: "/new-post" },
      { label: "Notificaciones", path: "/notifications", badge: unreadCount },
      { label: "Mi Billetera", path: "/wallet" },
    ],
    [unreadCount],
  );

  const goToLogin = () => navigate("/login", { state: { from: location } });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Loader visible={isRouteLoading} />

      {/* Desktop navbar */}
      <div className="hidden lg:block sticky top-0 z-50 pt-4">
        <Navbar sections={navSections} onLoginClick={() => goToLogin()} />
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
          <SearchInput
            placeholder="Buscar"
            value={mobileSearch}
            onChange={setMobileSearch}
            onSearch={(val) => {
              if (val.trim())
                navigate(`/posts?q=${encodeURIComponent(val.trim())}`);
            }}
          />
        </motion.div>
      </div>

      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={navSections}
        onLoginClick={() => goToLogin()}
      />

      <Outlet />
      <Footer
        contactEmail="admin@agrodilmarket.com"
        contactPhone="+58 412-0634175"
        socialLinks={{
          instagram: "https://instagram.com/agrodil",
        }}
      />
      <ScrollRestoration />
    </div>
  );
};

export default RootLayout;
