import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // TODO: once backend returns `role` in the JWT, silently redirect
  // role: 'customer' to "/" (per spec amendment 2026-06-29).

  return (
    <div className="flex flex-1">
      <Sidebar
        user={{
          name: session.user.name ?? "Account",
          email: session.user.email ?? "",
        }}
      />
      <main className="flex-1 min-w-0 bg-[var(--color-surface)] p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
