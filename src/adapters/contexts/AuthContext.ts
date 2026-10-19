import { createContext } from "react";
import type { AuthContextType } from "@/adapters/contexts/AuthProps";

export const AuthContext = createContext<AuthContextType | null>(null);
