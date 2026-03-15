import { useState, type FC } from "react";
import { motion } from "framer-motion";
import type { CardPostProps } from "../../interfaces/components/CardPostProps";

const SHADOW_DEFAULT = "0 4px 6px rgba(0,0,0,0.10)";
const SHADOW_HOVER = "0 10px 20px rgba(0,0,0,0.18)";

const CardPost: FC<CardPostProps> = ({ img, title, weight, price, owner }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-2/3 md:aspect-4/3 lg:aspect-7/8 w-auto lg:h-96 xl:h-112"
      animate={{
        scale: hovered ? 1.02 : 1,
        boxShadow: hovered ? SHADOW_HOVER : SHADOW_DEFAULT,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-xs">
        <div className="p-2 text-white">
          <p className="font-bold text-xs uppercase leading-snug">
            {title}
            <br />
            {weight}KG
          </p>
          <p className="font-black text-xl mt-1">${price.toFixed(0)}</p>
          <p>
            <span className="text-xs">{owner}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CardPost;
