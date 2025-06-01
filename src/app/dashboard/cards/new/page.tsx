"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAxios, isAxiosError } from "@/components/AuthAxios";
import { AxiosError } from "axios";
import CardForm from "@/components/CardForm";

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
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, partnersResponse] = await Promise.all([
          authAxios.get("https://apicard.namident.com/services"),
          authAxios.get("https://apicard.namident.com/partners"),
        ]);
        setServices(servicesResponse.data);
        setPartners(partnersResponse.data);
      } catch (err) {
        let errMessage = "Lỗi khi tải danh sách: ";
        if (isAxiosError(err)) {
          const axiosError = err as AxiosError<{
            message?: string;
            error?: string;
          }>;
          errMessage +=
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            "Lỗi không xác định";
        } else {
          errMessage += (err as Error).message || "Lỗi không xác định";
        }
        // Không hiển thị lỗi ở đây, để CardForm xử lý
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (data: Card) => {
    setLoading(true);
    try {
      await authAxios.post("/cards", data);
      router.push("/dashboard/cards");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<{
          message?: string;
          error?: string;
        }>;
        throw new Error(
          axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            "Lỗi không xác định"
        );
      } else {
        throw new Error((err as Error).message || "Lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-foreground text-center">
        Thêm mới thẻ
      </h1>
      <CardForm
        services={services}
        partners={partners}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}
