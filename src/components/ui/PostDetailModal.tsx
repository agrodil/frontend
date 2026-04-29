import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuPencil, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { notificationsApi } from "../../services/api/notifications.api";
import { awsApi, type PostFile } from "../../services/api/aws.api";
import { createPurchaseRequest } from "../../routes/actions/purchase.actions";
import { updatePost, deactivatePost } from "../../routes/actions/post.actions";
import type {
  PostDetail,
  UpdatePostPayload,
} from "../../services/api/posts.api";
import Form from "./Form";
import MediaCarousel from "./MediaCarousel";
import type { FormField } from "../../interfaces/components/FormProps";
import { fullName } from "../../utils/fullName";

const SALE_LABEL: Record<number, string> = {
  1: "Venta por kilo",
  2: "Venta por unidad",
};

const SEX_LABEL: Record<string, string> = {
  male: "Macho",
  female: "Hembra",
  M: "Macho",
  F: "Hembra",
};

interface PostDetailModalProps {
  post: PostDetail;
  previewImg: string | null;
  previewOwner: string;
  onClose: () => void;
  onUpdated?: (post: PostDetail) => void;
  onDeactivated?: (postId: string) => void;
}

const buildEditFields = (post: PostDetail): FormField[] => [
  {
    name: "livestockPostName",
    type: "text",
    label: "Nombre del post",
    required: true,
    defaultValue: post.livestock_post_name,
  },
  {
    name: "sex",
    type: "select",
    label: "Sexo",
    required: true,
    defaultValue: post.sex,
    options: [
      { label: "Macho", value: "M" },
      { label: "Hembra", value: "F" },
    ],
  },
  {
    name: "quantity",
    type: "number",
    label: "Cantidad",
    required: true,
    defaultValue: String(post.quantity ?? ""),
  },
  ...(post.sale_type_id === 1
    ? [
        {
          name: "avgWeightKg",
          type: "number" as const,
          label: "Peso promedio (kg)",
          required: true,
          defaultValue:
            post.avg_weight_kg != null ? String(post.avg_weight_kg) : "",
        },
        {
          name: "pricePerKg",
          type: "number" as const,
          label: "Precio por kg (US$)",
          required: true,
          defaultValue:
            post.price_per_kg != null ? String(post.price_per_kg) : "",
        },
      ]
    : [
        {
          name: "pricePerUnit",
          type: "number" as const,
          label: "Precio por unidad (US$)",
          required: true,
          defaultValue:
            post.price_per_unit != null ? String(post.price_per_unit) : "",
        },
      ]),
  {
    name: "details",
    type: "textarea",
    label: "Descripción",
    defaultValue: post.details ?? "",
  },
];

const PostDetailModal: FC<PostDetailModalProps> = ({
  post,
  previewImg,
  previewOwner,
  onClose,
  onUpdated,
  onDeactivated,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<PostDetail>(post);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<PostFile[]>([]);

  useEffect(() => {
    let cancelled = false;
    awsApi
      .getFilesByPost(currentPost.livestock_post_id)
      .then((files) => {
        if (!cancelled) setMediaFiles(files);
      })
      .catch((err) => {
        console.error("[PostDetailModal] No se pudieron cargar los archivos", err);
      });
    return () => {
      cancelled = true;
    };
  }, [currentPost.livestock_post_id]);

  const isOwnPost = user?.id === currentPost.posted_by;
  const price =
    currentPost.sale_type_id === 1
      ? currentPost.price_per_kg
      : currentPost.price_per_unit;

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnPost) return;

    setBuying(true);
    try {
      await createPurchaseRequest({
        livestockPostId: currentPost.livestock_post_id,
        potentialBuyer: user!.id,
        potentialBuyerName: fullName(user!),
        requestedQuantity: 1,
      });

      const cardMessage = JSON.stringify({
        __type: "PURCHASE_CARD",
        title: currentPost.livestock_post_name,
        saleTypeId: currentPost.sale_type_id,
        price: Number(price ?? 0),
        owner: previewOwner,
        img: previewImg,
      });

      await notificationsApi.createNotification({
        sentTo: currentPost.posted_by,
        livestockPostId: currentPost.livestock_post_id,
        purchaseNotificationTypeId: 1,
        message: cardMessage,
      });

      await notificationsApi.createNotification({
        sentTo: currentPost.posted_by,
        livestockPostId: currentPost.livestock_post_id,
        purchaseNotificationTypeId: 2,
        message: `Has recibido una nueva solicitud de compra de ${fullName(user!)}`,
      });

      navigate("/notifications", {
        state: {
          openChatWith: currentPost.posted_by,
          sellerName: previewOwner,
        },
      });
    } catch {
      setError("Error al enviar la solicitud. Intenta de nuevo.");
      setBuying(false);
    }
  };

  const handleSaveEdit = async (
    data: Record<string, string | File | File[] | boolean>,
  ) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdatePostPayload = {
        livestockPostName: (data.livestockPostName as string).trim(),
        sex: data.sex as string,
        quantity: Number(data.quantity),
        details:
          typeof data.details === "string" && data.details.trim().length > 0
            ? (data.details as string).trim()
            : undefined,
      };

      if (currentPost.sale_type_id === 1) {
        payload.avgWeightKg = Number(data.avgWeightKg);
        payload.pricePerKg = Number(data.pricePerKg);
      } else {
        payload.pricePerUnit = Number(data.pricePerUnit);
      }

      const updated = await updatePost(currentPost.livestock_post_id, payload);
      setCurrentPost(updated);
      setIsEditing(false);
      onUpdated?.(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el post",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    setError(null);
    try {
      await deactivatePost(currentPost.livestock_post_id);
      onDeactivated?.(currentPost.livestock_post_id);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo desactivar el post",
      );
      setIsDeactivating(false);
      setConfirmDeactivate(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-end p-4 pb-0">
            <button
              aria-label="Cerrar"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
            >
              <LuX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative aspect-square md:aspect-auto md:min-h-80 rounded-bl-none rounded-tl-2xl overflow-hidden bg-gray-100">
              <MediaCarousel
                items={mediaFiles}
                fallbackImg={previewImg}
                alt={currentPost.livestock_post_name}
              />
            </div>

            <div className="p-6 flex flex-col gap-4">
              {isEditing ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      Editar post
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
                      aria-label="Cancelar edición"
                    >
                      <LuX size={16} />
                    </button>
                  </div>
                  <Form
                    key={currentPost.livestock_post_id}
                    singleColumn
                    fields={buildEditFields(currentPost)}
                    onSubmit={handleSaveEdit}
                    submitLabel="Guardar cambios"
                    isLoading={isSaving}
                  />
                  {error && (
                    <p className="text-xs text-red-500 text-center mt-3">
                      {error}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {SALE_LABEL[currentPost.sale_type_id] ?? "—"}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                      {currentPost.livestock_post_name}
                    </h2>
                    <p className="text-3xl font-black text-gray-900 mt-1">
                      US ${Number(price ?? 0).toFixed(0)}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {currentPost.sale_type_id === 1 ? "/ kg" : "/ unidad"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {previewOwner
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">
                      {previewOwner}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {currentPost.sex && (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">
                          Sexo
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                          {SEX_LABEL[currentPost.sex] ?? currentPost.sex}
                        </p>
                      </div>
                    )}
                    {currentPost.quantity && (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">
                          Cantidad
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                          {currentPost.quantity}
                        </p>
                      </div>
                    )}
                    {currentPost.avg_weight_kg && (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">
                          Peso prom.
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                          {currentPost.avg_weight_kg} kg
                        </p>
                      </div>
                    )}
                  </div>

                  {currentPost.details && (
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                        Descripción
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {currentPost.details}
                      </p>
                    </div>
                  )}

                  {isOwnPost ? (
                    <div className="mt-auto flex flex-col gap-2">
                      {confirmDeactivate ? (
                        <div className="p-3 rounded-xl border border-red-200 bg-red-50">
                          <p className="text-sm text-red-700 font-semibold mb-2">
                            ¿Desactivar este post?
                          </p>
                          <p className="text-xs text-red-600 mb-3">
                            Dejará de estar visible para otros usuarios.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleDeactivate}
                              disabled={isDeactivating}
                              className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors cursor-pointer border-0 disabled:opacity-60"
                            >
                              {isDeactivating
                                ? "Desactivando..."
                                : "Sí, desactivar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeactivate(false)}
                              disabled={isDeactivating}
                              className="flex-1 py-2 rounded-lg bg-white text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-2"
                          >
                            <LuPencil size={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeactivate(true)}
                            className="flex-1 py-3 rounded-xl bg-white text-red-600 font-bold text-sm hover:bg-red-50 transition-colors cursor-pointer border border-red-200 inline-flex items-center justify-center gap-2"
                          >
                            <LuTrash2 size={16} />
                            Desactivar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBuy}
                      disabled={buying}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
                    >
                      {buying ? "Enviando solicitud..." : "Comprar ahora"}
                    </button>
                  )}

                  {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostDetailModal;
