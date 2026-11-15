import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create your organization</h1>
      <RegisterForm />
      <p className="mt-4 text-sm">
        Already registered? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}