"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  code: string;
  value: string;
  remainingValue: string;
  expiredAt: string;
}

export default function NewCardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Card>({
    code: "",
    value: "",
    remainingValue: "",
    expiredAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Validate dữ liệu
    if (
      !formData.code ||
      !formData.value ||
      !formData.remainingValue ||
      !formData.expiredAt
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      setLoading(false);
      return;
    }
    if (isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      setError("Giá trị phải là số dương");
      setLoading(false);
      return;
    }
    if (
      isNaN(Number(formData.remainingValue)) ||
      Number(formData.remainingValue) < 0
    ) {
      setError("Số dư phải là số không âm");
      setLoading(false);
      return;
    }

    try {
      await authAxios.post("/cards", formData);
      router.push("/dashboard/cards");
    } catch (err: unknown) {
      let errMessage = "Lỗi khi tạo thẻ: ";
      if (isAxiosError(err)) {
        errMessage +=
          err.response?.data?.message || err.message || "Lỗi không xác định";
      } else {
        errMessage += (err as Error).message || "Lỗi không xác định";
      }
      setError(errMessage);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-foreground text-center">
        Thêm mới thẻ
      </h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-foreground">Mã thẻ</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="VD: VIP-0004"
            />
          </div>
          <div>
            <label className="block text-foreground">Giá trị (VNĐ)</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="VD: 300000000"
            />
          </div>
          <div>
            <label className="block text-foreground">Còn lại (VNĐ)</label>
            <input
              type="text"
              name="remainingValue"
              value={formData.remainingValue}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="VD: 200000"
            />
          </div>
          <div>
            <label className="block text-foreground">Ngày hết hạn</label>
            <input
              type="datetime-local"
              name="expiredAt"
              value={formData.expiredAt}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 bg-blue-500 text-white rounded ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {loading ? "Đang tạo..." : "Tạo thẻ"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
