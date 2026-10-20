import { useId, type FC } from "react";
import { motion, useReducedMotion } from "framer-motion";

import ugaviLogo from "@/presentation/assets/images/ugavi.webp";

export const FEDERATION_NAME =
  "Unión de Ganaderos de La Villa del Rosario (UGAVI)";

const SEAL_TEXT = `Aval institucional • ${FEDERATION_NAME} • `;

const RING_PATH = "M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0";

interface FederationSealProps {
  // Clases de tamaño (ej. "size-28"). El sello escala con el contenedor.
  className?: string;
}

const FederationSeal: FC<FederationSealProps> = ({
  className = "size-56 md:size-64 lg:size-72",
}) => {
  const reduceMotion = useReducedMotion();
  // Id único: el sello puede aparecer más de una vez en la misma página.
  const ringId = `federation-seal-ring-${useId()}`;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 size-full text-amber-300"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        aria-hidden="true"
      >
        <defs>
          <path id={ringId} d={RING_PATH} />
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
            href={`#${ringId}`}
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
          flex items-center justify-center p-[10%]"
      >
        <img
          src={ugaviLogo}
          alt={`Logo de la ${FEDERATION_NAME}`}
          className="size-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default FederationSeal;
