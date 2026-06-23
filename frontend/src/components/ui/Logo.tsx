type LogoVariant = "light" | "dark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ variant = "dark", className = "" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-[#1B2B3B]";
  const cargoColor = variant === "light" ? "text-white" : "text-primary";
  const accentColor = "#2CB4D7";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill={variant === "light" ? "white" : accentColor} fillOpacity={variant === "light" ? 0.2 : 1} />
          <path d="M16 6 L26 11 L26 21 L16 26 L6 21 L6 11 Z" stroke={variant === "light" ? "white" : "white"} strokeWidth="1.5" fill="none" strokeOpacity="0.7" />
          <path d="M16 6 L26 11 L16 16 L6 11 Z" fill={variant === "light" ? "white" : "white"} fillOpacity="0.5" />
          <circle cx="16" cy="16" r="3.5" fill={variant === "light" ? "white" : "white"} />
        </svg>
      </div>
      <div className={`font-bold leading-tight ${textColor}`}>
        <span className="text-sm font-black tracking-wider uppercase">NEPEX</span>
        <br />
        <span className={`text-xs font-semibold tracking-widest uppercase ${cargoColor}`}>
          CARGO
        </span>
      </div>
    </div>
  );
}
