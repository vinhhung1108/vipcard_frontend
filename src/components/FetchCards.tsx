"use client";
import { useEffect } from "react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

interface FetchCardsProps {
  onDataAction: (cards: Card[] | null, error: string | null) => void;
}

export default function FetchCards({ onDataAction }: FetchCardsProps) {
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await authAxios.get("/cards");
        onDataAction(response.data, null);
      } catch (err: unknown) {
        let errorMessage = "Lỗi khi tải danh sách thẻ: ";
        if (isAxiosError(err)) {
          errorMessage +=
            err.response?.data?.message || err.message || "Lỗi không xác định";
        } else {
          errorMessage += (err as Error).message || "Lỗi không xác định";
        }
        onDataAction(null, errorMessage);
      }
    };

    fetchCards();
  }, []); // Loại bỏ dependency [onDataAction]

  return null;
}
