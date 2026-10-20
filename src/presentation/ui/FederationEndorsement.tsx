import type { FC } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/presentation/ui/Button";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import FederationSeal, {
  FEDERATION_NAME,
} from "@/presentation/ui/FederationSeal";

const FederationEndorsement: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

          {!isAuthenticated && (
            <div className="mt-6">
              <Button
                variant="secondary"
                label="¿Eres afiliado a UGAVI? Regístrate aquí"
                size="md"
                onClick={() =>
                  navigate("/login", { state: { view: "register" } })
                }
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FederationEndorsement;
