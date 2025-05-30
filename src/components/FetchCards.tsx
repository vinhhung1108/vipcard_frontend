"use client";
import { useEffect, useState } from "react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

interface FetchCardsProps {
  onDataAction: (
    cards: Card[] | null,
    error: string | null,
    loading: boolean
  ) => void;
}

export default function FetchCards({ onDataAction }: FetchCardsProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get("/cards");
        onDataAction(response.data, null, false); // Dữ liệu thành công, loading = false
      } catch (err: unknown) {
        let errorMessage = "Lỗi khi tải danh sách thẻ: ";
        if (isAxiosError(err)) {
          errorMessage +=
            err.response?.data?.message || err.message || "Lỗi không xác định";
        } else {
          errorMessage += (err as Error).message || "Lỗi không xác định";
        }
        onDataAction(null, errorMessage, false); // Lỗi, loading = false
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return null;
}
