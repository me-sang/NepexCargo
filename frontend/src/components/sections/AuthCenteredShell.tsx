import { ReactNode } from "react";

interface AuthCenteredShellProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  contentWidthClass?: string;
}

export function AuthCenteredShell({
  icon,
  title,
  description,
  children,
  contentWidthClass = "max-w-[480px]",
}: AuthCenteredShellProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 lg:py-10">
      <div
        aria-hidden="true"
        className="h-12 w-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white inline-flex items-center justify-center"
      >
        {icon}
      </div>
      <h1 className="mt-5 text-[1.5rem] lg:text-[1.625rem] font-extrabold text-[var(--color-text)] tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[14px] text-[var(--color-text-body)]/70">{description}</p>
      )}
      {children && <div className={`mt-10 w-full ${contentWidthClass}`}>{children}</div>}
    </div>
  );
}
