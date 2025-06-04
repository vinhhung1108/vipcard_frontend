"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAxios } from "@/components/AuthAxios";
import CardForm from "@/components/CardForm";
import { createCardAction } from "@/actions/cardActions";
import { checkTokenAndRedirect } from "@/utils/auth";

interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string | Date | null;
  serviceIds: number[]  | null;
  partnerIds: number[]  | null;
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

export default function NewCardPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  // Kiểm tra token khi component mount
  useEffect(() => {
    checkTokenAndRedirect(router);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, partnersResponse, referralCodesResponse] =
          await Promise.all([
            authAxios.get("https://apicard.namident.com/services"),
            authAxios.get("https://apicard.namident.com/partners"),
            authAxios.get("https://apicard.namident.com/referral-codes"),
          ]);
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
  }, []);

  const handleSubmitAction = async (data: Card, token?: string) => {
    setLoading(true);
    try {
      await createCardAction(data, token);
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
        referralCodes={referralCodes}
        onSubmitAction={handleSubmitAction}
        isLoading={loading}
      />
    </div>
  );
}
