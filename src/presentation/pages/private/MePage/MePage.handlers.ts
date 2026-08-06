import type { NavigateFunction } from "react-router-dom";
import type { User } from "@/entities/User.interface";
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
// activas a desactivadas y cierra el modal.
export function handlePostDeactivated(
  myPosts: UseMyPostsResult,
  deactivatedPosts: UseDeactivatedPostsResult,
  postDetailModal: UsePostDetailModalResult,
  deactivatedId: string,
): void {
  const post = myPosts.posts.find(
    (item) => item.post_id === deactivatedId,
  );
  if (post) deactivatedPosts.prepend(post);
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

export async function handleUpdateProfile(
  updateUser: (data: Partial<User>) => Promise<void>,
  data: Record<string, string | File | File[] | boolean>,
  onSuccess: () => void,
): Promise<void> {
  try {
    await updateUser({
      firstName: data.firstName as string,
      middleName: data.middleName as string,
      lastName: data.lastName as string,
      secondLastName: data.secondLastName as string,
      documentType: data.documentType as string,
      documentNumber: Number(data.documentNumber),
      townshipId: Number(data.townshipId),
      phone: data.phone as string,
      email: data.email as string,
    });
    onSuccess();
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

export function handleLogout(
  logout: () => void,
  navigate: NavigateFunction,
): void {
  logout();
  navigate("/");
}
