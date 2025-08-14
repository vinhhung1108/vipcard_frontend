"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authAxios } from "@/components/AuthAxios";
import CardForm from "@/components/CardForm";
import { updateCardAction } from "@/actions/cardActions";
import { checkTokenAndRedirect } from "@/utils/auth";

interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string | Date | null;
  serviceIds: number[] | null;
  partnerIds: number[] | null;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      await checkTokenAndRedirect(router);
      setLoadingData(false);
    };
    verifyToken();
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
          authAxios.get(`/cards/${cardId}`).catch((err) => {
            throw new Error(`Lỗi khi lấy dữ liệu thẻ: ${err.message}`);
          }),
          authAxios
            .get("https://apicard.namident.com/services")
            .catch((err) => {
              throw new Error(`Lỗi khi lấy dữ liệu dịch vụ: ${err.message}`);
            }),
          authAxios
            .get("https://apicard.namident.com/partners")
            .catch((err) => {
              throw new Error(`Lỗi khi lấy dữ liệu đối tác: ${err.message}`);
            }),
          authAxios
            .get("https://apicard.namident.com/referral-codes")
            .catch((err) => {
              throw new Error(
                `Lỗi khi lấy dữ liệu mã giới thiệu: ${err.message}`
              );
            }),
        ]);
        setCard(cardResponse.data);
        setServices(servicesResponse.data);
        setPartners(partnersResponse.data);
        setReferralCodes(referralCodesResponse.data);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
        setError(errorMessage);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [cardId]);

  const handleSubmitAction = async (data: Card, token?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (data.expiredAt === null || data.expiredAt === undefined) {
        throw new Error("expiredAt không được để trống");
      }
      const updateData: Omit<Card, "code"> = {
        value: data.value,
        remainingValue: data.remainingValue,
        expiredAt:
          data.expiredAt instanceof Date
            ? data.expiredAt.toISOString()
            : String(data.expiredAt),
        serviceIds:
          Array.isArray(data.serviceIds) && data.serviceIds.length > 0
            ? data.serviceIds
            : [],
        partnerIds:
          Array.isArray(data.partnerIds) && data.partnerIds.length > 0
            ? data.partnerIds
            : [],
        referralCodeId:
          typeof data.referralCodeId === "number" ? data.referralCodeId : null,
      };
      console.log(
        "Payload gửi từ frontend:",
        JSON.stringify(updateData, null, 2)
      );
      await updateCardAction(cardId, updateData, token);
      router.push("/dashboard/cards");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi khi cập nhật thẻ";
      console.error("Lỗi khi gửi yêu cầu cập nhật:", errorMessage);
      if (errorMessage.includes("401")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        router.push("/login");
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push("/dashboard/cards")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!card) {
    return <div className="p-6 text-center">Không tìm thấy thẻ</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
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
