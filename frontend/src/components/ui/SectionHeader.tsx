type TextAlign = "left" | "center" | "right";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: TextAlign;
  light?: boolean;
  className?: string;
}

const alignClass: Record<TextAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 ${alignClass[align]} ${className}`}>
      {eyebrow && (
        <span
          className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase bg-[var(--color-accent)] text-white"
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`
          text-3xl md:text-[2.25rem] lg:text-[2.5rem] font-extrabold leading-[1.1] tracking-tight max-w-3xl
          ${light ? "text-white" : "text-[var(--color-text)]"}
        `}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`
            text-[15px] md:text-base leading-relaxed max-w-2xl
            ${light ? "text-[var(--color-text-on-dark-muted)]" : "text-[#56707A]"}
          `}
        >
          {description}
        </p>
      )}
    </div>
  );
}
