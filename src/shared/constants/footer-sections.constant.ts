import type { FooterSection } from "@/presentation/interfaces/ui/FooterProps";

export const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Plataforma",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Vender", href: "/new-post" },
      { label: "Notificaciones", href: "/notifications" },
      { label: "Mi billetera", href: "/wallet" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Reportar un problema", href: "/reportar-problema" },
      { label: "Guía del vendedor", href: "/guia-vendedor" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: "/terms-and-conditions" },
      { label: "Política de privacidad", href: "/privacy-policy" },
    ],
  },
];
