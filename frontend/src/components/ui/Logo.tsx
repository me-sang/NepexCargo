type LogoVariant = "light" | "dark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ variant = "dark", className = "" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-[#1B2B3B]";
  const accentColor = "#2CB4D7";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill={accentColor} />
          <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" fill="white" fillOpacity="0.3" />
          <path d="M16 8L24 12V20L16 24V16L8 20V12L16 8Z" fill="white" fillOpacity="0.6" />
          <circle cx="16" cy="16" r="4" fill="white" />
        </svg>
      </div>
      <div className={`font-bold leading-tight ${textColor}`}>
        <span className="text-sm font-black tracking-wider uppercase">NEPEX</span>
        <br />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: accentColor }}>
          CARGO
        </span>
      </div>
    </div>
  );
}
