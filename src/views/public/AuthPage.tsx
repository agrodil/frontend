import { useState, type FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronLeft } from "react-icons/lu";
import Form from "../../components/ui/Form";
import Button from "../../components/ui/Button";
import type { FormField } from "../../interfaces/components/Form";
import { useAuth } from "../../hooks/useAuth";

const loginFields: FormField[] = [
  {
    name: "email",
    type: "email",
    placeholder: "Correo electrónico",
    required: true,
  },
  {
    name: "password",
    type: "password",
    placeholder: "Contraseña",
    required: true,
  },
];

const MUNICIPIOS: { label: string; value: string }[] = [
  { label: "Libertador", value: "libertador" },
  { label: "Sucre", value: "sucre" },
  { label: "Baruta", value: "baruta" },
  { label: "Chacao", value: "chacao" },
  { label: "El Hatillo", value: "el-hatillo" },
  { label: "Zamora", value: "zamora" },
  { label: "Urdaneta", value: "urdaneta" },
  { label: "Guaicaipuro", value: "guaicaipuro" },
];

const registerFields: FormField[] = [
  { name: "firstName", type: "text", placeholder: "Nombre", required: true },
  { name: "middleName", type: "text", placeholder: "Segundo Nombre" },
  { name: "lastName", type: "text", placeholder: "Apellido", required: true },
  { name: "secondLastName", type: "text", placeholder: "Segundo Apellido" },
  {
    name: "documentType",
    type: "select",
    placeholder: "Cédula de Identidad / RIF",
    options: [
      { label: "V – Venezolano", value: "V" },
      { label: "J – Jurídico", value: "J" },
    ],
    required: true,
  },
  {
    name: "documentNumber",
    type: "text",
    placeholder: "Número de documento",
    required: true,
  },
  {
    name: "municipality",
    type: "select",
    placeholder: "Municipio",
    options: MUNICIPIOS,
    required: true,
  },
  { name: "phone", type: "tel", placeholder: "Teléfono", required: true },
  {
    name: "email",
    type: "email",
    placeholder: "Correo electrónico",
    required: true,
  },
  {
    name: "password",
    type: "password",
    placeholder: "Contraseña",
    required: true,
  },
  {
    name: "confirmPassword",
    type: "password",
    placeholder: "Confirmar contraseña",
    required: true,
  },
];

const AuthPage: FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleLogin = async (data: Record<string, string | File>) => {
    setIsLoading(true);
    try {
      // TODO: reemplazar con llamada al API real
      login({
        user: { id: "mock-1", email: data.email as string, role: 0 },
        token: "mock-token",
      });
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: Record<string, string | File>) => {
    setIsLoading(true);
    try {
      // TODO: reemplazar con llamada al API real
      login({
        user: { id: "mock-1", email: data.email as string, role: 0 },
        token: "mock-token",
      });
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const arrowBtn =
    "absolute z-10 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors cursor-pointer border-0";

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-10">
      <div className="relative w-full max-w-lg">
        <AnimatePresence>
          <motion.button
            key={isRegistering ? "back-to-login" : "back-to-home"}
            type="button"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            onClick={() =>
              isRegistering ? setIsRegistering(false) : navigate(-1)
            }
            className={`${arrowBtn} -top-4 -left-4`}
            aria-label={isRegistering ? "Volver al inicio de sesión" : "Volver"}
          >
            <LuChevronLeft size={20} />
          </motion.button>
        </AnimatePresence>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegistering ? "register" : "login"}
            initial={{ opacity: 0, x: isRegistering ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegistering ? -40 : 40 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className={`bg-white rounded-3xl p-8 w-full overflow-y-auto max-h-[85vh] shadow-2xl`}
          >
            <Form
              title={isRegistering ? "Registrarse" : "Iniciar Sesión"}
              fields={isRegistering ? registerFields : loginFields}
              submitLabel={isRegistering ? "Crear cuenta" : "Ingresar"}
              onSubmit={isRegistering ? handleRegister : handleLogin}
              isLoading={isLoading}
              footer={
                !isRegistering ? (
                  <p className="text-xs text-gray-500">
                    ¿Eres nuevo/a?
                    <Button
                      label="Regístrate aquí"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsRegistering(true)}
                      className="mt-1 w-full"
                    />
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    ¿Ya tienes cuenta?
                    <Button
                      label="Inicia sesión aquí"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsRegistering(false)}
                      className="mt-1 w-full"
                    />
                  </p>
                )
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
};

export default AuthPage;
