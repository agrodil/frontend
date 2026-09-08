import { type FC } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuUsers,
  LuMessageSquare,
  LuShoppingCart,
  LuLayoutGrid,
  LuUserCheck,
  LuTrendingUp,
  LuArrowLeft,
  LuWrench,
  LuWallet,
} from "react-icons/lu";
import type { AdminDashboardLoaderData } from "@/presentation/interfaces/pages/AdminDashboardLoaderData";

type StatCardProps = {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
};

const StatCard: FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">
        {value === null ? "—" : value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

type NavCardProps = {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const NavCard: FC<NavCardProps> = ({ to, label, description, icon, color }) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3
               hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}
                     group-hover:scale-105 transition-transform duration-200`}
    >
      {icon}
    </div>
    <div>
      <p className="font-bold text-gray-900 text-base">{label}</p>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
  </Link>
);

const AdminDashboardPage: FC = () => {
  const { stats } = (useLoaderData() as AdminDashboardLoaderData) ?? {};

  const statCards: StatCardProps[] = [
    {
      label: "Usuarios verificados",
      value: stats?.verifiedUsersCount ?? null,
      icon: <LuUserCheck size={22} className="text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      label: "Solicitudes de compra",
      value: stats?.purchaseRequestsCount ?? null,
      icon: <LuShoppingCart size={22} className="text-amber-600" />,
      color: "bg-amber-50",
    },
    {
      label: "Convertidas en venta",
      value: stats?.convertedToSalesCount ?? null,
      icon: <LuTrendingUp size={22} className="text-green-700" />,
      color: "bg-green-50",
    },
  ];

  const navCards: NavCardProps[] = [
    {
      to: "/admin/users",
      label: "Usuarios",
      description: "Gestionar cuentas y verificaciones",
      icon: <LuUsers size={22} className="text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      to: "/admin/chats",
      label: "Chats",
      description: "Monitoreo de conversaciones",
      icon: <LuMessageSquare size={22} className="text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      to: "/admin/purchases",
      label: "Solicitudes de compra",
      description: "Revisar y gestionar solicitudes",
      icon: <LuShoppingCart size={22} className="text-amber-600" />,
      color: "bg-amber-50",
    },
    {
      to: "/admin/posts",
      label: "Publicaciones",
      description: "Moderar y gestionar publicaciones",
      icon: <LuLayoutGrid size={22} className="text-green-600" />,
      color: "bg-green-50",
    },
    {
      to: "/admin/troubleshooting",
      label: "Reportes de problemas",
      description: "Revisar fallas reportadas por usuarios",
      icon: <LuWrench size={22} className="text-red-600" />,
      color: "bg-red-50",
    },
    {
      to: "/admin/wallet",
      label: "Billetera",
      description: "Revisar depósitos, ajustes y cuentas",
      icon: <LuWallet size={22} className="text-emerald-600" />,
      color: "bg-emerald-50",
    },
  ];

  return (
    <main className="w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-4"
      >
        <Link
          to="/me"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                     hover:bg-gray-50 transition-colors shrink-0"
        >
          <LuArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-primary font-black text-[clamp(1.25rem,2.5vw,2rem)]">
            Panel de Administración
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Resumen general del sistema
          </p>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
      >
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Estadísticas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Secciones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {navCards.map((card) => (
            <NavCard key={card.to} {...card} />
          ))}
        </div>
      </motion.section>
    </main>
  );
};

export default AdminDashboardPage;
