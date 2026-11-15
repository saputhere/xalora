import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Log in to Xalora</h1>
      <LoginForm />
      <p className="mt-4 text-sm">
        No account yet? <Link href="/register" className="underline">Create one</Link>
      </p>
    </main>
  );
}