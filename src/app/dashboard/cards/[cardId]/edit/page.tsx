"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authAxios } from "@/components/AuthAxios";
import CardForm from "@/components/CardForm";
import { updateCardAction } from "@/actions/cardActions";

interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string;
  serviceIds: number[];
  partnerIds: number[];
  referralCodeId?: number | null;
}

interface Service {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
}

interface ReferralCode {
  id: number;
  code: string;
  description: string;
}

export default function EditCardPage() {
  const router = useRouter();
  const { cardId } = useParams() as { cardId: string };
  const [card, setCard] = useState<Card | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          cardResponse,
          servicesResponse,
          partnersResponse,
          referralCodesResponse,
        ] = await Promise.all([
          authAxios.get(`/cards/${cardId}`),
          authAxios.get("https://apicard.namident.com/services"),
          authAxios.get("https://apicard.namident.com/partners"),
          authAxios.get("https://apicard.namident.com/referral-codes"),
        ]);
        setCard(cardResponse.data);
        setServices(servicesResponse.data);
        setPartners(partnersResponse.data);
        setReferralCodes(referralCodesResponse.data);
      } catch {
        // Không hiển thị lỗi ở đây, để CardForm xử lý
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [cardId]);

  const handleSubmitAction = async (data: Card, token?: string) => {
    setLoading(true);
    try {
      await updateCardAction(cardId, data, token);
      router.push("/dashboard/cards");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

  if (!card) {
    return <div className="p-6 text-center">Không tìm thấy thẻ</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-foreground text-center">
        Cập nhật thẻ
      </h1>
      <CardForm
        initialData={card}
        services={services}
        partners={partners}
        referralCodes={referralCodes}
        onSubmitAction={handleSubmitAction}
        isLoading={loading}
      />
    </div>
  );
}
