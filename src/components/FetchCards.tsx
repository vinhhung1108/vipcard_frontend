"use client";
import { useEffect, useState } from "react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";
import { AxiosError } from "axios"; // Import AxiosError để kiểu hóa

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
  onLoadingChangeAction: (loading: boolean) => void;
}

export default function FetchCards({
  onDataAction,
  onLoadingChangeAction,
}: FetchCardsProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      onLoadingChangeAction(true); // Truyền trạng thái loading lên cha
      try {
        const response = await authAxios.get("/cards");
        onDataAction(response.data, null, false);
      } catch (err: unknown) {
        let errMessage = "Lỗi khi tải danh sách: ";
        if (isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>; // Ép kiểu với message tùy chọn
          errMessage +=
            (axiosError.response?.data?.message as string | undefined) ||
            axiosError.message ||
            "Lỗi không xác định";
        } else {
          errMessage += (err as Error).message || "Lỗi không xác định";
        }
        setError(errMessage);
        onDataAction(null, errMessage, false);
      } finally {
        onLoadingChangeAction(false); // Truyền trạng thái loading lên cha
      }
    };

    fetchCards();
  }, [onDataAction, onLoadingChangeAction]);

  return null;
}
