"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Spinner } from "@nextui-org/react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

export default function CardModal() {
  const { cardId } = useParams() as { cardId: string };
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await authAxios.get(`/cards/${cardId}`);
        setCard(response.data);
      } catch (err: unknown) {
        let errorMessage = "Lỗi khi tải chi tiết thẻ: ";
        if (isAxiosError(err)) {
          errorMessage +=
            err.response?.data?.message || err.message || "Lỗi không xác định";
        } else {
          errorMessage += (err as Error).message || "Lỗi không xác định";
        }
        setError(errorMessage);
      }
    };
    fetchCard();
  }, [cardId]);

  const formattedExpiredAt = card
    ? format(new Date(card.expiredAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {error ? (
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      ) : !card ? (
        <div className="flex justify-center items-center">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Chi tiết thẻ
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Mã thẻ:</strong> {card.code}
            </p>
            <p>
              <strong>Giá trị:</strong> {card.value.toLocaleString()} VNĐ
            </p>
            <p>
              <strong>Còn lại:</strong> {card.remaining.toLocaleString()} VNĐ
            </p>
            <p>
              <strong>Hết hạn:</strong> {formattedExpiredAt}
            </p>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => router.push(`/dashboard/cards/${cardId}/edit`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => {
                if (confirm("Xác nhận xóa?")) router.push("/dashboard/cards");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Xóa
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
