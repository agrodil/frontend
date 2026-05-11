import type { FC } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";

interface PostDetailActionsProps {
  isOwnPost: boolean;
  buying: boolean;
  isDeactivating: boolean;
  confirmDeactivate: boolean;
  error: string | null;
  onBuy: () => void;
  onEditStart: () => void;
  onDeactivateStart: () => void;
  onDeactivateConfirm: () => void;
  onDeactivateCancel: () => void;
}

export const PostDetailActions: FC<PostDetailActionsProps> = ({
  isOwnPost,
  buying,
  isDeactivating,
  confirmDeactivate,
  error,
  onBuy,
  onEditStart,
  onDeactivateStart,
  onDeactivateConfirm,
  onDeactivateCancel,
}) => {
  if (isOwnPost) {
    return (
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
                onClick={onDeactivateConfirm}
                disabled={isDeactivating}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors cursor-pointer border-0 disabled:opacity-60"
              >
                {isDeactivating ? "Desactivando..." : "Sí, desactivar"}
              </button>
              <button
                type="button"
                onClick={onDeactivateCancel}
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
              onClick={onEditStart}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-2"
            >
              <LuPencil size={16} />
              Editar
            </button>
            <button
              type="button"
              onClick={onDeactivateStart}
              className="flex-1 py-3 rounded-xl bg-white text-red-600 font-bold text-sm hover:bg-red-50 transition-colors cursor-pointer border border-red-200 inline-flex items-center justify-center gap-2"
            >
              <LuTrash2 size={16} />
              Desactivar
            </button>
          </div>
        )}
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onBuy}
        disabled={buying}
        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
      >
        {buying ? "Enviando solicitud..." : "Comprar ahora"}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </>
  );
};
