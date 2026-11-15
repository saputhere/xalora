import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/auth/current-user";
import { LogoutButton } from "./logout-button";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading…</p>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Welcome, {user.fullName}</h1>
      <p className="mb-6 text-sm text-gray-600">
        {user.email} · {user.role}
      </p>
      <LogoutButton />
    </main>
  );
}