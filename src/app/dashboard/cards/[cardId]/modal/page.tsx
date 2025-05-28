"use client";
import { useState, useEffect } from "react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

interface Params {
  cardId: string;
}

export default function CardModal({ params }: { params: Promise<Params> }) {
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { cardId } = params as unknown as Params; // Ép kiểu trực tiếp vì đây là Client Component

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : !card ? (
        <div>Đang tải...</div>
      ) : (
        <div className="bg-background p-6 rounded shadow-lg w-[40%] relative">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Chi tiết thẻ
          </h2>
          <p>
            <strong>Mã thẻ:</strong> {card.code}
          </p>
          <p>
            <strong>Giá trị:</strong> {card.value}
          </p>
          <p>
            <strong>Còn lại:</strong> {card.remaining}
          </p>
          <p>
            <strong>Hết hạn:</strong> {card.expiredAt}
          </p>
          <a
            href="/dashboard/cards"
            className="mt-4 inline-block bg-blue-500 text-white p-2 rounded"
          >
            Đóng
          </a>
        </div>
      )}
    </div>
  );
}
