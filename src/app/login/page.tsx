"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // Thay username thành email
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      // Xóa cookie token cũ
      document.cookie = "token=; Max-Age=0; path=/";

      const response = await axios.post(
        "https://apicard.namident.com/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const token = response.data.access_token;
      if (!token) {
        throw new Error("Không tìm thấy access_token trong response");
      }

      // Lưu cookie mới
      document.cookie = `token=${token}; path=/; Secure; SameSite=Lax; Max-Age=${
        60 * 60 * 24
      }`; // 24 giờ
      router.push("/dashboard/cards");
    } catch (err) {
      setError("Đăng nhập thất bại: " + (err as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg w-96"
      >
        <h2 className="text-2xl mb-4 text-foreground">Đăng nhập</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email" // Thay type="text" thành type="email"
          placeholder="Email" // Thay "Tên đăng nhập" thành "Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded w-full mb-4"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded w-full mb-4"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
