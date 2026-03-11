import type { FC } from "react";
import { motion } from "framer-motion";
import type { CardPostProps } from "../../interfaces/components/CardPostProps";

const CardPost: FC<CardPostProps> = ({ img, title, weight, price }) => {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer aspect-3/4 max-h-112"
      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.18)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="font-bold text-sm uppercase leading-snug">
          {title}
          <br />
          {weight}KG
        </p>
        <p className="font-black text-xl mt-1">${price.toFixed(0)}</p>
      </div>
    </motion.div>
  );
};

export default CardPost;
