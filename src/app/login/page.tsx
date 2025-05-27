"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // Thay username thành email
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      console.log("Đang gọi API /auth/login với dữ liệu:", { email, password });
      const response = await axios.post("/auth/login", { email, password }); // Sử dụng email
      console.log("Response từ API:", response.data);
      const token = response.data.access_token; // Có thể thay bằng access_token nếu API trả về khác
      if (!token) {
        throw new Error("Không tìm thấy token trong response");
      }
      document.cookie = `token=${token}; path=/; Secure; SameSite=Strict`;
      console.log("Token đã được lưu vào cookie:", token);
      router.push("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Đăng nhập thất bại: ";
      if (isAxiosError(err)) {
        errorMessage +=
          err.response?.data?.message || err.message || "Lỗi không xác định";
        console.error("Lỗi từ API:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      } else {
        errorMessage += (err as Error).message || "Lỗi không xác định";
        console.error("Lỗi không phải từ API:", err);
      }
      setError(errorMessage);
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
