export type PostStatus = "active" | "deactivated" | "expired";

// is_active y expires_at son independientes en el backend (ver post.row.ts):
// un post puede seguir is_active=true hasta que una lectura lo apague. Por
// eso "vencido" se decide siempre comparando expires_at contra el momento
// actual, no solo leyendo is_active.
export function resolvePostStatus(post: {
  is_active: boolean;
  expires_at: string | null;
}): PostStatus {
  const expired = !!post.expires_at && new Date(post.expires_at) <= new Date();
  if (expired) return "expired";
  return post.is_active ? "active" : "deactivated";
}
