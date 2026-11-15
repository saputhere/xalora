"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await postJson("/api/v1/auth/login", {
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input name="email" type="email" required placeholder="Email" className="rounded border p-2" />
      <input name="password" type="password" required placeholder="Password" className="rounded border p-2" />

      {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting} className="rounded bg-black p-2 text-white disabled:opacity-50">
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}