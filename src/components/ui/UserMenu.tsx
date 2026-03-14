import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../interfaces/auth/AuthProps";

interface UserMenuProps {
  user: User;
}

const getInitials = (email: string): string => {
  const username = email.split("@")[0];
  return username.slice(0, 2).toUpperCase();
};

const getAvatarColor = (email: string): string => {
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const index =
    email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const UserMenu: FC<UserMenuProps> = ({ user }) => {
  const displayName = user.email.split("@")[0];
  const initials = getInitials(user.email);
  const avatarColor = getAvatarColor(user.email);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/me")}
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
