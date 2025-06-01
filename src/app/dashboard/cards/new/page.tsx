"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAxios } from "@/components/AuthAxios";
import CardForm from "@/components/CardForm";
import { createCardAction } from "@/actions/cardActions";

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
      } catch {
        // Không hiển thị lỗi ở đây, để CardForm xử lý
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmitAction = async (data: Card) => {
    setLoading(true);
    try {
      await createCardAction(data);
      router.push("/dashboard/cards");
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
        onSubmitAction={handleSubmitAction}
        isLoading={loading}
      />
    </div>
  );
}
