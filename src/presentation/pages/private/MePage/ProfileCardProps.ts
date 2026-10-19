export interface ProfileCardStat {
  value: string;
  label: string;
}

export interface ProfileCardProps {
  displayName: string;
  documentType: string;
  documentNumber: string | number;
  initials: string;
  avatarColor: string;
  stats: ProfileCardStat[];
  isAdmin: boolean;
  onEdit: () => void;
  onLogout: () => void;
  onGoAdmin: () => void;
  onGoWallet: () => void;
}
