import { ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2CB4D7] text-white hover:bg-[#1A9BB8] active:bg-[#1589A3]",
  outline:
    "border border-[#2CB4D7] text-[#2CB4D7] hover:bg-[#E8F7FC] active:bg-[#d0eef8]",
  ghost:
    "text-[#2CB4D7] hover:bg-[#E8F7FC] active:bg-[#d0eef8]",
  white:
    "bg-white text-[#1B2B3B] hover:bg-gray-50 active:bg-gray-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  type = "button",
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold
        transition-colors duration-150 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2CB4D7] focus-visible:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
