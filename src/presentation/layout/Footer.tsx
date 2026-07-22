import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuMail, LuInstagram } from "react-icons/lu";
import type { FooterProps } from "@/presentation/interfaces/ui/FooterProps";

const DEFAULT_SECTIONS = [
  {
    title: "Plataforma",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Categorías", href: "/categorias" },
      { label: "Vender", href: "/new-post" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", href: "/ayuda" },
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Reportar un problema", href: "/reportar" },
      { label: "Guía del vendedor", href: "/guia-vendedor" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Política de privacidad", href: "/privacidad" },
    ],
  },
];

const Footer: FC<FooterProps> = ({
  sections = DEFAULT_SECTIONS,
  contactEmail = "soporte@agrodil.com",
  socialLinks = {},
}) => {
  return (
    <motion.footer
      className="bg-primary text-white mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
    >
      {/* Main content */}
      <div className="max-w-[90vw] mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-avant font-bold text-2xl tracking-widest">
              AGRODIL
            </span>
            <p className="text-white/70 text-sm leading-relaxed">
              El marketplace ganadero de confianza. Conectamos compradores y
              vendedores de ganado en toda Venezuela.
            </p>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-2 mt-2">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm no-underline"
            >
              <LuMail className="shrink-0" />
              {contactEmail}
            </a>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3 mt-1">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/70 hover:text-white transition-colors"
              >
                <LuInstagram size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Link sections */}
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[90vw] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center sm:justify-between gap-2 text-white/50 text-xs text-center">
          <span>
            © {new Date().getFullYear()} Agrodil. Todos los derechos reservados.
          </span>
          <span>
            Desarrollado por{" "}
            <Link
              to="https://www.linkedin.com/in/davidpaz06/"
              target="_blank"
              className="text-white/70 hover:text-white transition-colors"
            >
              David Paz.
            </Link>
          </span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
