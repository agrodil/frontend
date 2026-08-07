import type { FC } from "react";
import { LuMapPin } from "react-icons/lu";
import type { PostDetail } from "@/api/interfaces/responses/PostDetail.interface";
import { SEX_LABEL } from "@/shared/constants/sex.catalog";
import { resolveLocation } from "@/shared/utils/resolveLocation";
import { POST_CATEGORY, resolvePostPricing } from "@/shared/utils/resolvePostPricing";

interface PostDetailContentProps {
  post: PostDetail;
  previewOwner: string;
}

type DetailItem = { label: string; value: string | number; suffix?: string };

const getDetailsArray = (post: PostDetail): DetailItem[] => {
  switch (post.post_category_id) {
    case POST_CATEGORY.MAQUINARIA:
      return post.post_brand ? [{ label: "Marca", value: post.post_brand }] : [];

    case POST_CATEGORY.FINCAS:
      return [
        ...(post.farm_hectares != null
          ? [{ label: "Hectáreas", value: post.farm_hectares, suffix: " ha" }]
          : []),
        ...(post.price_per_hectare != null
          ? [
              {
                label: "Precio / hectárea",
                value: post.price_per_hectare,
                suffix: " USD",
              },
            ]
          : []),
      ];

    case POST_CATEGORY.INSUMOS:
      return [];

    default: // Animales
      return [
        ...(post.post_subcategory_name
          ? [{ label: "Raza dominante", value: post.post_subcategory_name }]
          : []),
        ...(post.livestock_sector_name
          ? [{ label: "Rubro", value: post.livestock_sector_name }]
          : []),
        ...(post.sex
          ? [
              {
                label: "Sexo",
                value:
                  SEX_LABEL.find((s) => s.value === post.sex)?.label ??
                  post.sex,
              },
            ]
          : []),
        ...(post.quantity != null
          ? [{ label: "Cantidad", value: post.quantity }]
          : []),
        ...(post.avg_weight_kg != null
          ? [{ label: "Peso prom.", value: post.avg_weight_kg, suffix: " kg" }]
          : []),
      ];
  }
};

export const PostDetailContent: FC<PostDetailContentProps> = ({
  post,
  previewOwner,
}) => {
  const { price, priceLabel, priceSuffix } = resolvePostPricing(post);
  const details = getDetailsArray(post);
  const location = resolveLocation(post.township_id);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
      <div>
        {priceLabel && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {priceLabel}
          </p>
        )}
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          {post.post_name}
        </h2>
        <p className="text-3xl font-black text-gray-900 mt-1">
          US ${Number.isInteger(price) ? price : price.toFixed(2)}
          {priceSuffix && (
            <span className="text-sm font-normal text-gray-500 ml-1">
              {priceSuffix}
            </span>
          )}
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

      {location && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LuMapPin size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Ubicación
            </p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {location.township},{" "}
              <span className="font-normal text-gray-600">{location.state}</span>
            </p>
          </div>
        </div>
      )}

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
