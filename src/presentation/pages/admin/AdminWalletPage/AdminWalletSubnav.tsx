import type { FC } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/admin/wallet", label: "Depósitos", end: true },
  { to: "/admin/wallet/cuentas", label: "Cuentas", end: false },
  { to: "/admin/wallet/ajustes", label: "Ajustes", end: false },
  { to: "/admin/wallet/conciliacion", label: "Conciliación", end: false },
];

// Sub-navegación compartida por las pantallas de billetera del admin.
const AdminWalletSubnav: FC = () => (
  <div className="flex flex-nowrap gap-1 border-b border-gray-200 overflow-x-auto">
    {LINKS.map((l) => (
      <NavLink
        key={l.to}
        to={l.to}
        end={l.end}
        className={({ isActive }) =>
          `shrink-0 whitespace-nowrap px-5 py-2.5 text-sm font-semibold no-underline
           border-b-2 -mb-px transition-colors ${
             isActive
               ? "text-primary border-primary"
               : "text-gray-400 border-transparent hover:text-gray-600"
           }`
        }
      >
        {l.label}
      </NavLink>
    ))}
  </div>
);

export default AdminWalletSubnav;
