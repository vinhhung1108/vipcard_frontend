"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      document.cookie = "token=; Max-Age=0; path=/"; // Xóa cookie cũ
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

      document.cookie = `token=${token}; path=/; Secure; SameSite=Lax; Max-Age=${
        60 * 60 * 24
      }`;
      router.push("/dashboard/cards");
    } catch (err) {
      setError("Đăng nhập thất bại: " + (err as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng nhập
        </h1>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
