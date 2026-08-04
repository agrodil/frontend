import { useState, type FC } from "react";
import { motion } from "framer-motion";
import { LuMapPin, LuPlay } from "react-icons/lu";
import { formatLocation } from "@/shared/utils/resolveLocation";
import type { CardPostProps } from "@/presentation/interfaces/ui/CardPostProps";

const SHADOW_DEFAULT = "0 4px 6px rgba(0,0,0,0.10)";
const SHADOW_HOVER = "0 10px 20px rgba(0,0,0,0.18)";

const SALE_LABEL: Record<number, string> = {
  1: "Por Kilo",
  2: "Por Unidad",
};

const isVideoUrl = (src: string) => {
  // S3 keys are signed; the path before "?" still includes the original
  // filename and extension (e.g. .mp4, .mov, .webm).
  const path = src.split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(path);
};

const CardPost: FC<CardPostProps> = ({
  img,
  title,
  saleTypeId,
  townshipId,
  price,
  owner,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const isVideo = img ? isVideoUrl(img) : false;
  const location = formatLocation(townshipId);

  return (
    <motion.div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-3/4 lg:aspect-7/8 w-full lg:h-96 xl:h-112"
      animate={{
        scale: hovered ? 1.02 : 1,
        boxShadow: hovered ? SHADOW_HOVER : SHADOW_DEFAULT,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {img && isVideo ? (
        <>
          <video
            src={img}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover bg-black"
          />
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/55 text-white text-[10px] font-semibold flex items-center gap-1 z-10">
            <LuPlay size={10} />
            Video
          </div>
        </>
      ) : img ? (
        <img
          src={img}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-primary/10" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      {location && (
        <div className="absolute top-2 left-2 max-w-[calc(100%-1rem)] px-2 py-1 rounded-full bg-black/55 text-white text-[10px] font-semibold flex items-center gap-1 z-10">
          <LuMapPin size={10} className="shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-xs">
        <div className="p-2 text-white">
          <p className="font-bold text-[10px] text-xs uppercase leading-snug truncate">
            {title}
            <br />
            {SALE_LABEL[saleTypeId] ?? "—"}
          </p>
          <p className="font-black text-xs lg:text-lg">
            USD ${Number.isInteger(price) ? price : price.toFixed(2)}
          </p>
          <p>
            <span className="text-xs leading-snug truncate">{owner}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CardPost;
