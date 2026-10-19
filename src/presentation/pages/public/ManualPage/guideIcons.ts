import { LuFilePlus, LuShoppingCart, LuWallet } from "react-icons/lu";
import type { IconType } from "react-icons";

import type { GuideIconKey } from "@/shared/constants/guides";

// Registro de íconos. Para un ícono nuevo: agrégalo a GuideIconKey (guides.ts)
// y aquí; TypeScript avisa si falta alguno.
export const GUIDE_ICONS: Record<GuideIconKey, IconType> = {
  publish: LuFilePlus,
  wallet: LuWallet,
  buy: LuShoppingCart,
};
