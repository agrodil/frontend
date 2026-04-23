import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuX } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { notificationsApi } from "../../services/api/notifications.api";
import { createPurchaseRequest } from "../../routes/actions/purchase.actions";
import type { PostDetail } from "../../services/api/posts.api";
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
}

const PostDetailModal: FC<PostDetailModalProps> = ({
  post,
  previewImg,
  previewOwner,
  onClose,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnPost = user?.id === post.posted_by;
  const price =
    post.sale_type_id === 1 ? post.price_per_kg : post.price_per_unit;

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnPost) return;

    setBuying(true);
    try {
      await createPurchaseRequest({
        livestockPostId: post.livestock_post_id,
        potentialBuyer: user!.id,
        potentialBuyerName: fullName(user!),
        requestedQuantity: 1,
      });

      const cardMessage = JSON.stringify({
        __type: "PURCHASE_CARD",
        title: post.livestock_post_name,
        saleTypeId: post.sale_type_id,
        price: Number(price ?? 0),
        owner: previewOwner,
        img: previewImg,
      });

      // 1. Enviar la tarjeta de solicitud de compra (tipo 1)
      await notificationsApi.createNotification({
        sentTo: post.posted_by,
        livestockPostId: post.livestock_post_id,
        purchaseNotificationTypeId: 1,
        message: cardMessage,
      });

      // 2. Enviar el mensaje de texto informativo (tipo 2)
      await notificationsApi.createNotification({
        sentTo: post.posted_by,
        livestockPostId: post.livestock_post_id,
        purchaseNotificationTypeId: 2,
        message: `Has recibido una nueva solicitud de compra de ${fullName(user!)}`,
      });

      navigate("/notifications", {
        state: { openChatWith: post.posted_by, sellerName: previewOwner },
      });
    } catch {
      setError("Error al enviar la solicitud. Intenta de nuevo.");
      setBuying(false);
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
          {/* Close button */}
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
            {/* Image */}
            <div className="relative aspect-square md:aspect-auto md:min-h-80 rounded-bl-none rounded-tl-2xl overflow-hidden bg-gray-100">
              {previewImg ? (
                <img
                  src={previewImg}
                  alt={post.livestock_post_name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {SALE_LABEL[post.sale_type_id] ?? "—"}
                </p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {post.livestock_post_name}
                </h2>
                <p className="text-3xl font-black text-gray-900 mt-1">
                  US ${Number(price ?? 0).toFixed(0)}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {post.sale_type_id === 1 ? "/ kg" : "/ unidad"}
                  </span>
                </p>
              </div>

              {/* Seller */}
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

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-2">
                {post.sex && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Sexo
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {SEX_LABEL[post.sex] ?? post.sex}
                    </p>
                  </div>
                )}
                {post.quantity && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Cantidad
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {post.quantity}
                    </p>
                  </div>
                )}
                {post.avg_weight_kg && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">
                      Peso prom.
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {post.avg_weight_kg} kg
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {post.details && (
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                    Descripción
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {post.details}
                  </p>
                </div>
              )}

              {/* Buy button */}
              {!isOwnPost && (
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
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostDetailModal;
