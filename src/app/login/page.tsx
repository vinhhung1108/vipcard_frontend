'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Chỉ giữ axios

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      document.cookie = 'token=; Max-Age=0; path=/'; // Xóa cookie cũ
      const response = await axios.post('https://apicard.namident.com/auth/login', {
        email,
        password,
      }, {
        withCredentials: true,
      });

      const token = response.data.access_token;
      if (!token) {
        throw new Error('Không tìm thấy access_token trong response');
      }

      document.cookie = `token=${token}; path=/; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24}`;
      router.push('/dashboard/cards');
    } catch (err) {
      setError('Đăng nhập thất bại: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}