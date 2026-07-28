import type { FC } from "react";
import { motion } from "framer-motion";
import Button from "@/presentation/ui/Button.tsx";
import type { ProfileCardProps } from "./ProfileCardProps";

const ProfileCard: FC<ProfileCardProps> = ({
  displayName,
  documentType,
  documentNumber,
  initials,
  avatarColor,
  stats,
  isAdmin,
  onEdit,
  onLogout,
  onGoAdmin,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center flex-col sm:flex-row w-full
                   px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1rem,2.5vw,1.75rem)]
                   gap-[clamp(0.75rem,2.5vw,2rem)]"
  >
    <div
      className={`${avatarColor} rounded-full flex items-center justify-center text-white font-bold shrink-0
                      w-[clamp(3.5rem,7vw,6rem)] h-[clamp(3.5rem,7vw,6rem)] text-[clamp(1rem,2vw,1.75rem)]`}
    >
      {initials}
    </div>

    <div className="flex flex-col min-w-0 flex-1 gap-[clamp(0.35rem,1vw,0.6rem)] sm:items-start items-center">
      <h1 className="text-primary font-bold capitalize truncate text-[clamp(1.1rem,2.5vw,2rem)]">
        {displayName}
      </h1>
      <p className="text-gray-500 text-[clamp(0.8rem,1.2vw,1rem)] text-center md:text-start -my-1">
        {`${documentType} - ${documentNumber}`}
      </p>
      <div className="flex items-center gap-[clamp(0.5rem,1.2vw,0.75rem)]">
        <Button
          label="Editar Perfil"
          variant="primary"
          size="sm"
          onClick={onEdit}
          className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
        />

        <Button
          label="Cerrar sesión"
          variant="secondary"
          size="sm"
          onClick={onLogout}
          className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
        />

        {isAdmin && (
          <Button
            label="Admin"
            variant="secondary"
            size="sm"
            onClick={onGoAdmin}
            className="shrink-0 text-[clamp(0.7rem,1.2vw,0.875rem)] px-[clamp(1rem,2vw,2rem)]"
          />
        )}
      </div>
    </div>

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
);

export default ProfileCard;
