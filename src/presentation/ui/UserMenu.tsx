import type { FC } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "@/adapters/contexts/AuthProps";

import { getInitials } from "@/shared/utils/getInitials";
import { getAvatarColor } from "@/shared/utils/getAvatarColor";
import { fullName } from "@/shared/utils/fullName";

interface UserMenuProps {
  user: User;
  onNavigate?: () => void;
}

const UserMenu: FC<UserMenuProps> = ({ user, onNavigate }) => {
  const displayName = fullName(user);
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(user.email);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate("/me");
        onNavigate?.();
      }}
      className="flex items-center gap-2.5 border border-gray-200 rounded-2xl p-2 bg-white shadow-sm cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div
        className={`${avatarColor} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0`}
      >
        {initials}
      </div>
      <span className="text-sm font-medium text-primary truncate max-w-30">
        {displayName}
      </span>
    </div>
  );
};

export default UserMenu;
