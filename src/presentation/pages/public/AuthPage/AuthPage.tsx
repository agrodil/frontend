import { useState, type FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronLeft } from "react-icons/lu";

import Form from "@/presentation/ui/Form";
import Button from "@/presentation/ui/Button";
import Loader from "@/presentation/layout/Loader";

import {
  login as loginAction,
  register as registerAction,
  verifyEmail,
  resendVerification,
} from "@/presentation/router/actions/auth.actions";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import { useCheckAvailability } from "@/adapters/hooks/actions/useCheckAvailability";
import {
  checkEmailExistsAction,
  checkPhoneExistsAction,
  checkDocumentExistsAction,
} from "@/presentation/router/actions/users.actions";
import { loginFields } from "./loginFields";
import { registerFields } from "./registerFields";
import { verifyFields } from "./verifyFields";
import { loginSchema, registerSchema } from "./authSchemas";
import { AuthError } from "@/api/clients/auth.api";

import type { Login } from "@/api/interfaces/requests/Login.interface";
import type { Register } from "@/api/interfaces/requests/Register.interface";
import { formatPhone } from "@/shared/utils/formatPhone";

type AuthView = "login" | "register" | "verify";

const AuthPage: FC = () => {
  const [view, setView] = useState<AuthView>("login"),
    [isLoading, setIsLoading] = useState(false),
    [pendingUserId, setPendingUserId] = useState(""),
    [pendingEmail, setPendingEmail] = useState(""),
    [pendingRememberMe, setPendingRememberMe] = useState(false),
    [loginErrors, setLoginErrors] = useState<Record<string, string>>({}),
    [registerErrors, setRegisterErrors] = useState<Record<string, string>>({}),
    [verifyErrors, setVerifyErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const emailCheck = useCheckAvailability(
    checkEmailExistsAction,
    "Este correo electrónico ya está registrado",
  );
  const phoneCheck = useCheckAvailability(
    checkPhoneExistsAction,
    "Este número de teléfono ya está registrado",
  );
  const docCheck = useCheckAvailability(
    checkDocumentExistsAction,
    "Este número de documento ya está registrado",
  );
  const navigate = useNavigate(),
    location = useLocation(),
    from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleLogin = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setIsLoading(true);
    setLoginErrors({});
    try {
      const payload: Login = {
        email: data.email as string,
        password: data.password as string,
        remember_me: !!data.remember_me,
      };
      const { user } = await loginAction(payload);
      await login(user, !!data.remember_me);
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof AuthError && error.fieldErrors) {
        setLoginErrors(error.fieldErrors);
      } else {
        const message =
          error instanceof Error ? error.message : "Error during login";
        setLoginErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setIsLoading(true);
    setRegisterErrors({});
    try {
      const rememberMe = !!data.remember_me;
      const raw = { ...(data as Record<string, string>) };
      delete raw.confirmPassword;
      delete raw.remember_me;

      if (raw.document_type === "J") {
        delete raw.first_name;
        delete raw.middle_name;
        delete raw.surname;
        delete raw.second_surname;
      } else {
        delete raw.company_name;
      }

      const payload: Register = {
        ...raw,
        phone: `+58${formatPhone(raw.phone)}`,
        document_number: Number(raw.document_number),
        township_id: raw.township_id ? Number(raw.township_id) : undefined,
      } as Register;
      const { userId } = await registerAction(payload);
      setPendingUserId(userId);
      setPendingEmail(raw.email);
      setPendingRememberMe(rememberMe);
      setView("verify");
    } catch (error) {
      if (error instanceof AuthError && error.fieldErrors) {
        setRegisterErrors(error.fieldErrors);
      } else {
        const message =
          error instanceof Error ? error.message : "Error during registration";
        setRegisterErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setIsLoading(true);
    setVerifyErrors({});
    try {
      const { user } = await verifyEmail(
        pendingUserId,
        data.code as string,
        pendingRememberMe,
      );
      await login(user, pendingRememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof AuthError && error.fieldErrors) {
        setVerifyErrors(error.fieldErrors);
      } else {
        const message =
          error instanceof Error ? error.message : "Error during verification";
        setVerifyErrors({ code: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resendVerification(pendingEmail);
      setVerifyErrors({});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error resending code";
      setVerifyErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (view === "verify") {
      setView("register");
      setVerifyErrors({});
    } else if (view === "register") {
      setView("login");
      setRegisterErrors({});
    } else {
      navigate(-1);
    }
  };

  const arrowBtn =
    "absolute z-10 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors cursor-pointer border-0";

  const viewConfig = {
    login: {
      title: "Iniciar Sesión",
      fields: loginFields,
      schema: loginSchema,
      submitLabel: "Ingresar",
      onSubmit: handleLogin,
      backendErrors: loginErrors,
      footer: (
        <p className="text-xs text-gray-500">
          ¿Eres nuevo/a?
          <Button
            label="Regístrate aquí"
            variant="secondary"
            size="sm"
            onClick={() => setView("register")}
            className="mt-1 w-full"
          />
        </p>
      ),
    },
    register: {
      title: "Registrarse",
      fields: registerFields.map((field) => {
        if (field.name === "email") {
          return {
            ...field,
            onAsyncCheck: emailCheck.check,
            asyncError: emailCheck.error,
            isChecking: emailCheck.isChecking,
            asyncAvailable: emailCheck.isAvailable,
          };
        }
        if (field.name === "phone") {
          return {
            ...field,
            onAsyncCheck: (val: string) => {
              if (val.trim()) {
                phoneCheck.check(`+58${formatPhone(val)}`);
              } else {
                phoneCheck.check("");
              }
            },
            asyncError: phoneCheck.error,
            isChecking: phoneCheck.isChecking,
            asyncAvailable: phoneCheck.isAvailable,
          };
        }
        if (field.name === "document_number") {
          return {
            ...field,
            onAsyncCheck: docCheck.check,
            asyncError: docCheck.error,
            isChecking: docCheck.isChecking,
            asyncAvailable: docCheck.isAvailable,
          };
        }
        return field;
      }),
      schema: registerSchema,
      submitLabel: "Crear cuenta",
      onSubmit: handleRegister,
      backendErrors: registerErrors,
      footer: (
        <p className="text-xs text-gray-500">
          ¿Ya tienes cuenta?
          <Button
            label="Inicia sesión aquí"
            variant="secondary"
            size="sm"
            onClick={() => setView("login")}
            className="mt-1 w-full"
          />
        </p>
      ),
    },
    verify: {
      title: "Verificar correo",
      fields: verifyFields,
      submitLabel: "Verificar",
      onSubmit: handleVerify,
      backendErrors: verifyErrors,
      footer: (
        <p className="text-xs text-gray-500">
          ¿No recibiste el código?
          <Button
            label="Reenviar código"
            variant="secondary"
            size="sm"
            onClick={handleResend}
            className="mt-1 w-full"
          />
        </p>
      ),
    },
  };

  const current = viewConfig[view];

  return (
    <>
      <Loader visible={isLoading} />
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="relative w-full max-w-lg">
          <AnimatePresence>
            <motion.button
              key={view}
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              onClick={handleBack}
              className={`${arrowBtn} -top-4 -left-4`}
              aria-label="Volver"
            >
              <LuChevronLeft size={20} />
            </motion.button>
          </AnimatePresence>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="bg-white rounded-3xl border border-gray-200 p-8 w-full overflow-y-auto max-h-[75vh] shadow-2xl"
            >
              <Form
                title={current.title}
                fields={current.fields}
                schema={"schema" in current ? current.schema : undefined}
                submitLabel={current.submitLabel}
                onSubmit={current.onSubmit}
                isLoading={isLoading}
                footer={current.footer}
                singleColumn
                backendErrors={current.backendErrors}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default AuthPage;
