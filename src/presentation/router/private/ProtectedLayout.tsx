import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/adapters/hooks/common/useAuth";
import Button from "@/presentation/ui/Button";

export const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <section className="flex items-center justify-center min-h-screen w-full px-4">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 w-[90vw] max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-primary mb-4 text-center">
              Inicia sesión
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Para acceder a esta sección, debes estar registrado e iniciar
              sesión en tu cuenta.
            </p>
            <Button
              label="Iniciar Sesión"
              variant="primary"
              size="sm"
              onClick={() => navigate("/login")}
              className="w-full py-1.5 rounded-2xl shadow-sm mb-4"
            />
            <Link to="/" className="text-primary hover:underline">
              Volver a inicio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <Outlet />;
};
