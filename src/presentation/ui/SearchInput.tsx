import { useState, type FC, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import type { SearchInputProps } from "@/presentation/interfaces/ui/SearchInputProps";
import { LuSearch } from "react-icons/lu";

const SHADOW_ACTIVE = "0 8px 24px rgba(0,0,0,0.12)";
const SHADOW_DEFAULT = "0 1px 3px rgba(0,0,0,0.06)";

const SearchInput: FC<SearchInputProps> = ({
  placeholder = "Buscar",
  value,
  onChange,
  onSearch,
  className = "",
}) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isActive = focused || hovered;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <motion.div
      animate={{ boxShadow: isActive ? SHADOW_ACTIVE : SHADOW_DEFAULT }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center bg-white rounded-full px-4 py-2.5 border border-gray-200 ${className}`}
    >
      <LuSearch className="text-gray-400 mr-3" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400 text-sm placeholder:italic"
      />
    </motion.div>
  );
};

export default SearchInput;
