import type { User } from "@/entities/User.interface";
import type { ToastMode } from "@/presentation/interfaces/ui/ToastProps.interface";

export interface ProfileEditFormProps {
  user: User;
  onSave: (
    data: Record<string, string | File | File[] | boolean>,
  ) => Promise<void>;
  onClose: () => void;
  notify: (mode: ToastMode, message: string) => void;
}
