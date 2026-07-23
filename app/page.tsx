import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  // Check if user has session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  if (sessionCookie?.value) {
    redirect("/workspace");
  } else {
    redirect("/sign-in");
  }
}
