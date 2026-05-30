import type { FC } from "react";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import { sales } from "@/shared/constants/sale-types.catalog";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";

interface PostDetailContentProps {
  post: PostDetail;
  previewOwner: string;
}

const getDetailsArray = (post: PostDetail) =>
  [
    {
      label: "Raza dominante",
      value: post.breed_name,
    },
    {
      label: "Rubro",
      value: post.sector_name,
    },
    {
      label: "Sexo",
      value: post.sex
        ? (SEX_LABEL.find((s) => s.value === post.sex)?.label ?? post.sex)
        : null,
    },
    {
      label: "Cantidad",
      value: post.quantity ?? null,
    },
    {
      label: "Peso prom.",
      value: post.avg_weight_kg ?? null,
      suffix: " kg",
    },
  ].filter((item) => item.value !== null);

export const PostDetailContent: FC<PostDetailContentProps> = ({
  post,
  previewOwner,
}) => {
  const price =
    post.sale_type_id === 1 ? post.price_per_kg : post.price_per_unit;
  const details = getDetailsArray(post);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {sales[post.sale_type_id] ?? "—"}
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

      <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
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

      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {details.map((detail, idx) => (
            <div
              key={idx}
              className=" bg-gray-50 border rounded-2xl shadow-sm border-gray-200 p-3"
            >
              <p className="text-[10px] text-gray-400 uppercase font-semibold">
                {detail.label}
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {detail.value}
                {detail.suffix}
              </p>
            </div>
          ))}
        </div>
      )}

      {post.details && (
        <div className="flex-1 flex flex-col min-h-0">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
            Descripción
          </p>
          <p className="text-sm text-gray-600 leading-relaxed overflow-y-auto">
            {post.details}
          </p>
        </div>
      )}
    </div>
  );
};
