"use client";
import { useState } from "react";
import axios, { isAxiosError } from "@/lib/axios"; // Đã đúng, không cần sửa

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login", { username, password });
      const token = response.data.token;
      document.cookie = `token=${token}; path=/; Secure; SameSite=Strict`;
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        "Đăng nhập thất bại: " +
          (isAxiosError(err) ? err.response?.data?.message : err.message)
      );
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
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
