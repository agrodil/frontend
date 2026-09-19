import type { PostStatus } from "@/shared/utils/resolvePostStatus";

export interface PostStatusMeta {
  label: string;
  badgeClass: string;
}

// Solo "expired" se usa como badge hoy — active/deactivated ya se distinguen
// por estar en una lista u otra en MePage, no necesitan pill propio.
export const POST_STATUS: Record<PostStatus, PostStatusMeta> = {
  active: { label: "Activa", badgeClass: "bg-green-50 text-green-700" },
  deactivated: { label: "Desactivada", badgeClass: "bg-gray-100 text-gray-500" },
  expired: { label: "Vencida", badgeClass: "bg-amber-50 text-amber-700" },
};
