import type { User } from "@/interfaces/api/users/User.interface";

export interface ProfileEditFormProps {
  user: User;
  onSave: (
    data: Record<string, string | File | File[] | boolean>,
  ) => Promise<void>;
  onClose: () => void;
}
