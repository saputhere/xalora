import { connection } from "next/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  await connection();
  redirect("/dashboard");
}