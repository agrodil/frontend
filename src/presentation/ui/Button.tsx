import type { FC } from "react";
import type { ButtonProps } from "@/presentation/interfaces/ui/ButtonProps";

const sizeClasses = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-9 py-3.5 text-lg",
};

const variantClasses = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-white text-primary border border-primary hover:bg-green-50",
};

const Button: FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;
