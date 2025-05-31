"use client";
import { useEffect, useState } from "react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  id: string;
  code: string;
  value: string;
  remainingValue: string;
  expiredAt: string;
  createdAt?: string;
  updatedAt?: string;
  services?: { id: number; name: string; description: string }[];
  partners?: {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
  }[];
  referralCode?: { id: number; code: string; description: string };
}

interface FetchCardsProps {
  onDataAction: (
    cards: Card[] | null,
    error: string | null,
    loading: boolean
  ) => void;
  onLoadingChange: (loading: boolean) => void; // Thêm prop mới
}

export default function FetchCards({ onDataAction, onLoadingChange }: FetchCardsProps) {
  const [loading, setLoading] = useState(true); // Giữ useState

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      onLoadingChange(true); // Truyền trạng thái loading lên cha
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
        onLoadingChange(false); // Truyền trạng thái loading lên cha
      }
    };

    fetchCards();
  }, [onDataAction, onLoadingChange]);

  return null;
}