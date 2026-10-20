import type { NavigateFunction } from "react-router-dom";
import type { ProfileUpdatePayload } from "@/adapters/contexts/AuthProps";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import type { UseMyPostsResult } from "@/adapters/hooks/actions/useMyPosts";
import type { UseDeactivatedPostsResult } from "@/adapters/hooks/actions/useDeactivatedPosts";
import type { UsePostDetailModalResult } from "@/adapters/hooks/actions/usePostDetailModal";

export type Tab = "publicaciones" | "transacciones" | "preferencias";

const TABS: Tab[] = ["publicaciones", "transacciones", "preferencias"];

export const parseTab = (value: string | null): Tab =>
  TABS.includes(value as Tab) ? (value as Tab) : "publicaciones";

// Activar desde la lista de desactivadas: cruza dos hooks (saca el post de
// "desactivadas" y refresca "activas"), por eso vive a nivel de página.
export async function handleActivatePost(
  deactivatedPosts: UseDeactivatedPostsResult,
  myPosts: UseMyPostsResult,
  postId: string,
): Promise<void> {
  try {
    await deactivatedPosts.activate(postId);
    await myPosts.refresh();
  } catch (error) {
    console.error("Error activating post:", error);
  }
}

// Renovar un post vencido desde la lista de desactivadas: cobra el plan
// elegido (deactivatedPosts.activate) y, si sale bien, refresca "activas" —
// mismo cruce de hooks que handleActivatePost, pero SIN tragarse el error:
// el modal de renovación necesita mostrarlo (saldo insuficiente, etc).
export async function handleRenewPost(
  deactivatedPosts: UseDeactivatedPostsResult,
  myPosts: UseMyPostsResult,
  postId: string,
  postingFeeId: string,
  expectedCostUsd: number,
): Promise<void> {
  await deactivatedPosts.activate(postId, postingFeeId, expectedCostUsd);
  await myPosts.refresh();
}

// Callback onUpdated del PostDetailModal: refleja la edición en el modal y en
// la card de la lista activa.
export function handlePostUpdated(
  myPosts: UseMyPostsResult,
  postDetailModal: UsePostDetailModalResult,
  updated: PostDetail,
): void {
  postDetailModal.setPostDetail(updated);
  myPosts.applyUpdate(updated);
}

// Callback onDeactivated del PostDetailModal: mueve el post (optimista) de
// activas a desactivadas y cierra el modal. El post que se prepend viene del
// snapshot de "activas" (aún trae is_active: true) — se fuerza a false acá,
// si no resolvePostStatus lo sigue leyendo como "active" y PostsTab lo
// filtra de la lista de desactivadas (ver visibleDeactivatedPosts).
export function handlePostDeactivated(
  myPosts: UseMyPostsResult,
  deactivatedPosts: UseDeactivatedPostsResult,
  postDetailModal: UsePostDetailModalResult,
  deactivatedId: string,
): void {
  const post = myPosts.posts.find(
    (item) => item.post_id === deactivatedId,
  );
  if (post) deactivatedPosts.prepend({ ...post, is_active: false });
  myPosts.removePost(deactivatedId);
  postDetailModal.close();
}

// Callback onActivated del PostDetailModal: la activación ya ocurrió dentro
// del modal, aquí solo sincronizamos ambas listas.
export function handlePostActivatedFromModal(
  myPosts: UseMyPostsResult,
  deactivatedPosts: UseDeactivatedPostsResult,
  activatedId: string,
): void {
  deactivatedPosts.removeLocal(activatedId);
  myPosts.refresh().catch(() => {});
}

// No atrapa errores: el caller (ProfileEditForm) necesita que el reject
// llegue intacto para distinguir éxito de fallo y mostrar el toast correcto,
// y para NO cerrar el form cuando el cambio de contraseña fue rechazado.
export async function handleUpdateProfile(
  updateUser: (data: ProfileUpdatePayload) => Promise<void>,
  data: Record<string, string | File | File[] | boolean>,
  onSuccess: () => void,
): Promise<void> {
  // El form de cambio de contraseña reusa este mismo handler y solo manda
  // currentPassword/password/confirmPassword — los demás campos no vienen
  // definidos en ese form, así que se detecta por la presencia de password.
  const isPasswordChange = typeof data.password === "string" && data.password;

  await updateUser(
    isPasswordChange
      ? {
          password: data.password as string,
          currentPassword: data.currentPassword as string,
        }
      : {
          // companyName solo existe en el form de personas jurídicas (J).
          ...(typeof data.companyName === "string"
            ? { companyName: data.companyName as string }
            : {
                firstName: data.firstName as string,
                middleName: data.middleName as string,
                lastName: data.lastName as string,
                secondLastName: data.secondLastName as string,
              }),
          documentType: data.documentType as string,
          documentNumber: Number(data.documentNumber),
          townshipId: Number(data.townshipId),
          phone: data.phone as string,
          email: data.email as string,
        },
  );
  onSuccess();
}

export function handleLogout(
  logout: () => void,
  navigate: NavigateFunction,
): void {
  logout();
  navigate("/");
}
