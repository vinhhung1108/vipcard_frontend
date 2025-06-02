import { authAxios } from "@/components/AuthAxios";

export async function checkTokenAndRedirect(
  router: ReturnType<typeof import("next/navigation").useRouter>
): Promise<void> {
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    router.push("/login");
    return;
  }

  try {
    await authAxios.get("https://apicard.namident.com/auth/verify-token");
  } catch {
    document.cookie = "token=; max-age=-1; path=/";
    router.push("/login");
  }
}
