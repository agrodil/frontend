import { useState, type FC } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuMessageCircle, LuX } from "react-icons/lu";
import { useAuth } from "../../../hooks/useAuth.tsx";
import CardPost from "../../../components/ui/CardPost.tsx";
import Button from "../../../components/ui/Button.tsx";
import Form from "../../../components/ui/Form.tsx";

import type { MePageLoaderData } from "../../../routes/loaders/me.loader.ts";
import { getAvatarColor } from "../../../utils/getAvatarColor.ts";
import { getInitials } from "../../../utils/getInitials.ts";
import { buildProfileFields } from "./buildProfileFields.ts";

// ─── Component ────────────────────────────────────────────────────────────────

const MePage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    user: loaderUser,
    posts,
    stats,
  } = useLoaderData() as MePageLoaderData;
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!loaderUser) return null;

  const user = loaderUser;

  const displayName = user.firstName + " " + user.lastName,
    initials = getInitials(user.firstName + " " + user.lastName),
    avatarColor = getAvatarColor(user.email);

  const handleSave = (data: Record<string, string | File>) => {
    updateUser({
      firstName: data.firstName as string,
      middleName: data.middleName as string,
      lastName: data.lastName as string,
      secondLastName: data.secondLastName as string,
      documentType: data.documentType as string,
      documentNumber: data.documentNumber as string,
      municipality: data.municipality as string,
      phone: data.phone as string,
      email: data.email as string,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <main className="flex-1 w-[90vw] mx-auto py-[clamp(1.5rem,4vw,3rem)] flex flex-col gap-[clamp(0.75rem,2vw,1.5rem)]">
        {/* ── Profile card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center flex-col sm:flex-row w-full
                   px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1rem,2.5vw,1.75rem)]
                   gap-[clamp(0.75rem,2.5vw,2rem)]"
        >
          {/* Avatar */}
          <div
            className={`${avatarColor} rounded-full flex items-center justify-center text-white font-bold shrink-0
                      w-[clamp(3.5rem,7vw,6rem)] h-[clamp(3.5rem,7vw,6rem)] text-[clamp(1rem,2vw,1.75rem)]`}
          >
            {initials}
          </div>

          {/* Name + actions */}
          <div className="flex flex-col min-w-0 flex-1 gap-[clamp(0.35rem,1vw,0.6rem)] sm:items-start items-center">
            <h1 className="text-primary font-bold capitalize truncate text-[clamp(1.1rem,2.5vw,2rem)]">
              {displayName}
            </h1>
            <div className="flex items-center gap-[clamp(0.5rem,1.2vw,0.75rem)]">
              <Button
                label="Editar Perfil"
                variant="primary"
                size="sm"
                onClick={() => setIsEditing((v) => !v)}
                className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
              />
              <button
                type="button"
                aria-label="Mensaje"
                className="rounded-full border border-primary flex items-center justify-center
                         text-primary hover:bg-primary/10 transition-colors cursor-pointer bg-white
                         shrink-0 w-[clamp(2.5rem,4vw,3rem)] h-[clamp(2.5rem,4vw,3rem)]"
              >
                <LuMessageCircle className="w-[clamp(1rem,1.8vw,1.35rem)] h-[clamp(1rem,1.8vw,1.35rem)]" />
              </button>
              <Button
                label="Cerrar sesión"
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center shrink-0 gap-[clamp(1rem,3.5vw,3rem)]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-[clamp(0.1rem,0.3vw,0.2rem)]"
              >
                <span className="text-primary font-bold text-[clamp(1rem,2vw,1.5rem)]">
                  {stat.value}
                </span>
                <span className="text-gray-400 text-[clamp(0.6rem,0.85vw,0.75rem)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Edit form ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1rem,2.5vw,1.75rem)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-primary font-bold text-[clamp(2rem,1.8vw,2.5rem)]">
                  Perfil de usuario
                </h2>
                <button
                  type="button"
                  aria-label="Cerrar formulario"
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400
                           hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer
                           bg-transparent border-0"
                >
                  <LuX size={18} />
                </button>
              </div>

              <Form
                key={user.email}
                fields={buildProfileFields(user)}
                onSubmit={handleSave}
                submitLabel="Guardar cambios"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recent posts ──────────────────────────────────────────────── */}
        <h2 className="text-primary font-bold text-[clamp(2rem,1.8vw,2.5rem)]">
          Publicaciones recientes
        </h2>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex-1 flex flex-col sm:flex-row justify-around gap-4"
        >
          {posts.map((post, i) => (
            <CardPost key={i} {...post} owner={displayName} />
          ))}
        </motion.div>
      </main>
    </>
  );
};

export default MePage;
