import type { User } from "@/entities/User.interface";

export interface ProfileEditFormProps {
  user: User;
  onSave: (
    data: Record<string, string | File | File[] | boolean>,
  ) => Promise<void>;
  onClose: () => void;
}
