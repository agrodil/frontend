export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  sections?: FooterSection[];
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}
