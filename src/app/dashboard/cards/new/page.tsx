"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authAxios, isAxiosError } from "@/components/AuthAxios";
import { AxiosError } from "axios"; // Thêm import AxiosError

interface Card {
  code: string;
  value: string;
  remainingValue: string;
  expiredAt: string;
  serviceIds: number[];
  partnerIds: number[];
}

interface Service {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
}

export default function NewCardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Card>({
    code: "",
    value: "",
    remainingValue: "",
    expiredAt: "",
    serviceIds: [],
    partnerIds: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingData, setLoadingData] = useState(true); // Trạng thái tải dữ liệu API

  // Fetch dữ liệu từ API sử dụng authAxios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, partnersResponse] = await Promise.all([
          authAxios.get("https://apicard.namident.com/services"),
          authAxios.get("https://apicard.namident.com/partners"),
        ]);
        setServices(servicesResponse.data); // Giả định data là mảng
        setPartners(partnersResponse.data); // Giả định data là mảng
      } catch (err) {
        let errMessage = "Lỗi khi tải danh sách: ";
        if (isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>; // Ép kiểu với message tùy chọn
          errMessage +=
            (axiosError.response?.data?.message as string | undefined) ||
            axiosError.message ||
            "Lỗi không xác định";
        } else {
          errMessage += (err as Error).message || "Lỗi không xác định";
        }
        setError(errMessage);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (name: string, selectedKeys: Set<string>) => {
      const values = Array.from(selectedKeys).map(Number);
      setFormData((prev) => ({ ...prev, [name]: values }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);

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
    if (formData.serviceIds.length === 0 || formData.partnerIds.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ và một đối tác");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        code: formData.code,
        value: Number(formData.value),
        remainingValue: Number(formData.remainingValue),
        expiredAt: formData.expiredAt,
        serviceIds: formData.serviceIds,
        partnerIds: formData.partnerIds,
      };

      console.log("Payload gửi lên:", payload);

      await authAxios.post("/cards", payload);
      router.push("/dashboard/cards");
    } catch (err: unknown) {
      let errMessage = "Lỗi khi tạo thẻ: ";
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>; // Ép kiểu với message tùy chọn
        errMessage +=
          (axiosError.response?.data?.message as string | undefined) ||
          axiosError.message ||
          "Lỗi không xác định";
      } else {
        errMessage += (err as Error).message || "Lỗi không xác định";
      }
      setError(errMessage);
      setLoading(false);
    }
  }, [formData, router]);

  if (loadingData) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

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
              type="number"
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
              type="number"
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
          <div>
            <label className="block text-foreground">Dịch vụ</label>
            <select
              multiple
              value={formData.serviceIds.map(String)}
              onChange={(e) =>
                handleSelectChange(
                  "serviceIds",
                  new Set(
                    Array.from(e.target.selectedOptions).map((opt) => opt.value)
                  )
                )
              }
              className="w-full p-2 border rounded"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-foreground">Đối tác</label>
            <select
              multiple
              value={formData.partnerIds.map(String)}
              onChange={(e) =>
                handleSelectChange(
                  "partnerIds",
                  new Set(
                    Array.from(e.target.selectedOptions).map((opt) => opt.value)
                  )
                )
              }
              className="w-full p-2 border rounded"
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
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
