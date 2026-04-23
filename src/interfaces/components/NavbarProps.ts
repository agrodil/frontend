import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  badge?: number;
}

export interface NavbarProps {
  sections: NavItem[];
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}
