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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true); // Giữ loading để truyền cho cha

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get("/cards");
        onDataAction(response.data, null, false);
      } catch (err: unknown) {
        let errorMessage = "Lỗi khi tải danh sách thẻ: ";
        if (isAxiosError(err)) {
          errorMessage +=
            err.response?.data?.message || err.message || "Lỗi không xác định";
        } else {
          errorMessage += (err as Error).message || "Lỗi không xác định";
        }
        onDataAction(null, errorMessage, false);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [onDataAction]); // Thêm onDataAction vào mảng phụ thuộc

  return null;
}
