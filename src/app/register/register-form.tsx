"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/api-client";

export function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const registration = await postJson("/api/v1/auth/register", {
      organizationName: formData.get("organizationName"),
      fullName: formData.get("fullName"),
      email,
      password,
    });

    if (!registration.ok) {
      setErrorMessage(registration.message);
      setIsSubmitting(false);
      return;
    }

    // Registration doesn't create a session, so log in right after.
    const login = await postJson("/api/v1/auth/login", { email, password });

    if (!login.ok) {
      setErrorMessage("Account created, but login failed. Please log in manually.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input name="organizationName" required placeholder="Organization name" className="rounded border p-2" />
      <input name="fullName" required placeholder="Your full name" className="rounded border p-2" />
      <input name="email" type="email" required placeholder="Email" className="rounded border p-2" />
      <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" className="rounded border p-2" />

      {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting} className="rounded bg-black p-2 text-white disabled:opacity-50">
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}