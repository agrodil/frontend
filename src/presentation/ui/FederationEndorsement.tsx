import type { FC } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LuBadgeCheck,
  LuHandshake,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";

import ugaviLogo from "@/presentation/assets/images/ugavi.webp";

const FEDERATION_NAME = "Unión de Ganaderos de La Villa del Rosario";

const SEAL_TEXT = `Aval institucional • ${FEDERATION_NAME} • `;

const RING_PATH = "M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0";

const TRUST_POINTS = [
  {
    icon: LuShieldCheck,
    text: "Plataforma reconocida como confiable por el gremio ganadero de la región.",
  },
  {
    icon: LuHandshake,
    text: "Alianza comercial que respalda cada negociación realizada en Agrodil.",
  },
  {
    icon: LuUsers,
    text: "Una comunidad de productores con trayectoria y compromiso con el sector.",
  },
];

const FederationSeal: FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative size-56 md:size-64 lg:size-72 shrink-0">
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full text-amber-300"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        aria-hidden="true"
      >
        <defs>
          <path id="federation-seal-ring" d={RING_PATH} />
        </defs>
        <circle
          cx="100"
          cy="100"
          r="98"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <circle
          cx="100"
          cy="100"
          r="77"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 4"
          strokeOpacity="0.7"
        />
        <text
          fill="currentColor"
          fontSize="10.5"
          fontWeight="600"
          className="font-avant uppercase"
        >
          <textPath
            href="#federation-seal-ring"
            textLength="548"
            lengthAdjust="spacing"
          >
            {SEAL_TEXT}
          </textPath>
        </text>
      </motion.svg>

      <div
        className="absolute inset-[15%] rounded-full bg-background
          ring-4 ring-amber-300/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
          flex items-center justify-center p-5"
      >
        <img
          src={ugaviLogo}
          alt={`Logo de la ${FEDERATION_NAME}`}
          className="size-full object-contain"
          loading="lazy"
        />
      </div>

      <span
        className="absolute bottom-[6%] left-1/2 -translate-x-1/2
          inline-flex items-center gap-1 whitespace-nowrap
          rounded-full bg-amber-300 px-3 py-1 shadow-md
          font-avant font-bold text-xs uppercase tracking-wider text-secondary"
      >
        <LuBadgeCheck className="size-4" aria-hidden="true" />
        Avalado
      </span>
    </div>
  );
};

const FederationEndorsement: FC = () => {
  return (
    <section
      aria-labelledby="federation-endorsement-title"
      className="relative overflow-hidden rounded-2xl bg-secondary
        px-6 py-10 md:px-10 lg:px-16"
    >
      {/* Halo detrás del sello */}
      <div
        className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2
          size-[28rem] rounded-full bg-primary/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
        <FederationSeal />

        <div className="text-center lg:text-left">
          <p className="font-avant font-semibold text-xs md:text-sm uppercase tracking-[0.2em] text-amber-300">
            Respaldo institucional
          </p>
          <h2
            id="federation-endorsement-title"
            className="mt-2 font-avant font-bold text-2xl md:text-3xl lg:text-4xl text-background leading-tight"
          >
            Avalados por la {FEDERATION_NAME}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto lg:mx-0 text-base md:text-lg text-background/80">
            La federación ganadera de nuestra zona ha depositado su confianza en
            Agrodil y nos certifica como una plataforma confiable para comprar y
            vender ganado.
          </p>

          <ul className="mt-6 grid gap-3 text-left max-w-2xl mx-auto lg:mx-0">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 text-background/90"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-amber-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm md:text-base">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FederationEndorsement;
