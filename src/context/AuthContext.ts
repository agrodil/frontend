import { createContext } from "react";
import type { AuthContextType } from "@/interfaces/auth/AuthProps";

export const AuthContext = createContext<AuthContextType | null>(null);
