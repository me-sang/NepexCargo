import { AuthCenteredShell } from "./AuthCenteredShell";
import { CheckCircleIcon } from "@/components/ui/AuthIcons";

export function PasswordResetSuccess() {
  return (
    <AuthCenteredShell
      icon={<CheckCircleIcon />}
      title="You're all set!"
      description="Your password has been reset successfully"
      contentWidthClass="max-w-[440px]"
    >
      <a
        href="/login"
        className="inline-flex items-center justify-center w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white font-semibold text-[15px] hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        Back to sign in
      </a>
    </AuthCenteredShell>
  );
}
