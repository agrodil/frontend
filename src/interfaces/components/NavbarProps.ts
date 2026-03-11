export interface NavItem {
  label: string;
  path: string;
}

export interface NavbarProps {
  sections: NavItem[];
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onCartClick?: () => void;
}
