type TextAlign = "left" | "center" | "right";

interface SectionHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: TextAlign;
  titleClassName?: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
  className?: string;
  light?: boolean;
}

const alignClass: Record<TextAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function SectionHeader({
  subtitle,
  title,
  description,
  align = "center",
  titleClassName = "",
  subtitleClassName = "",
  descriptionClassName = "",
  className = "",
  light = false,
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 ${alignClass[align]} ${className}`}>
      {subtitle && (
        <span
          className={`
            inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase
            bg-primary text-white
            ${subtitleClassName}
          `}
        >
          {subtitle}
        </span>
      )}
      <h2
        className={`
          text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight
          ${light ? "text-white" : "text-dark"}
          ${titleClassName}
        `}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`
            text-base leading-relaxed max-w-2xl
            ${light ? "text-white/75" : "text-text-muted"}
            ${descriptionClassName}
          `}
        >
          {description}
        </p>
      )}
    </div>
  );
}
