"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateCardAction } from "@/actions/cardActions";
import { checkTokenAndRedirect } from "@/utils/auth";
import { authAxios } from "@/components/AuthAxios";
import CardForm from "@/components/CardForm";

/** ==== Types (client) ==== */
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

export default function EditCardPage(): JSX.Element {
  const router = useRouter();
  const { cardId } = useParams() as { cardId: string };

  const [card, setCard] = useState<Card | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Bảo đảm đã đăng nhập (token trong cookie) */
  useEffect(() => {
    const verifyToken = async (): Promise<void> => {
      await checkTokenAndRedirect(router);
    };
    void verifyToken();
  }, [router]);

  /** Tải dữ liệu ban đầu */
  useEffect(() => {
    let mounted = true;

    const fetchData = async (): Promise<void> => {
      try {
        const [
          cardResponse,
          servicesResponse,
          partnersResponse,
          referralCodesResponse,
        ] = await Promise.all([
          authAxios.get<Card>(`/cards/${cardId}`),
          authAxios.get<Service[]>("https://apicard.namident.com/services"),
          authAxios.get<Partner[]>("https://apicard.namident.com/partners"),
          authAxios.get<ReferralCode[]>(
            "https://apicard.namident.com/referral-codes"
          ),
        ]);

        if (!mounted) return;

        setCard(cardResponse.data);
        setServices(servicesResponse.data);
        setPartners(partnersResponse.data);
        setReferralCodes(referralCodesResponse.data);
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
        setError(msg);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    void fetchData();
    return () => {
      mounted = false;
    };
  }, [cardId]);

  const handleSubmitAction = async (data: Card): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (data.expiredAt == null) {
        setError("expiredAt không được để trống");
        setLoading(false);
        return;
      }

      const updateData: Omit<Card, "code"> & { expiredAt: string | Date } = {
        value: data.value,
        remainingValue: data.remainingValue,
        expiredAt:
          data.expiredAt instanceof Date
            ? data.expiredAt.toISOString()
            : String(data.expiredAt),
        serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
        partnerIds: Array.isArray(data.partnerIds) ? data.partnerIds : [],
        referralCodeId:
          typeof data.referralCodeId === "number" ? data.referralCodeId : null,
      };

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(
          "Payload gửi từ frontend:",
          JSON.stringify(updateData, null, 2)
        );
      }

      const result = await updateCardAction(cardId, updateData);

      if (!result.ok) {
        const msg =
          result.message ||
          (typeof result.error === "string"
            ? result.error
            : // cố gắng lấy message từ object lỗi backend
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (result.error as any)?.message) ||
          "Cập nhật thất bại";
        setError(msg);
        setLoading(false);
        return;
      }

      router.push("/dashboard/cards");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi cập nhật thẻ";
      setError(msg);
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
          type="button"
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
