import { ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "white" | "dark";
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
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] active:bg-[#1589A3]",
  outline:
    "border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
  ghost:
    "text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
  white:
    "bg-white text-[var(--color-text)] hover:bg-neutral-50 active:bg-neutral-100",
  dark:
    "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-mid)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
        rounded-[var(--radius-md)] font-semibold whitespace-nowrap
        transition-colors duration-150 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
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
