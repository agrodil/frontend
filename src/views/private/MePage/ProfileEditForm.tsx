import { useState, type FC } from "react";
import { motion } from "framer-motion";
import { LuX } from "react-icons/lu";

import Form from "@/components/ui/Form.tsx";
import { buildProfileFields } from "./buildProfileFields.ts";

import type { ProfileEditFormProps } from "@/interfaces/components/layout/ProfileEditFormProps.interface.ts";
import Button from "@/components/ui/Button.tsx";

const ProfileEditForm: FC<ProfileEditFormProps> = ({
  user,
  onSave,
  onClose,
}) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const onChangePassword = () => {
    return (
      <motion.div
        className="p-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
      >
        <Form
          fields={buildProfileFields(user, [
            "firstName",
            "middleName",
            "lastName",
            "secondLastName",
            "email",
            "townshipId",
            "phone",
          ])}
          onSubmit={async (data) => {
            await onSave(data);
            setIsChangingPassword(false);
          }}
          submitLabel="Cambiar contraseña"
        />
      </motion.div>
    );
  };
  return (
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
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400
                   hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer
                   bg-transparent border-0"
        >
          <LuX size={18} />
        </button>
      </div>

      <Form
        key={user.email}
        singleColumn
        fields={buildProfileFields(user, ["password", "confirmPassword"])}
        onSubmit={onSave}
        submitLabel="Guardar cambios"
      />

      {/* ── Change password section ──────────────────────────────────────────────── */}
      <Button
        label="Cambiar contraseña"
        variant="secondary"
        size="sm"
        onClick={() => {
          setIsChangingPassword(!isChangingPassword);
        }}
        className="my-4"
      />
      {isChangingPassword && onChangePassword()}
    </motion.div>
  );
};

export default ProfileEditForm;
