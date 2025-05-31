"use client";
import { useEffect } from "react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";
import { AxiosError } from "axios";

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
  useEffect(() => {
    const fetchCards = async () => {
      onLoadingChangeAction(true);
      try {
        const response = await authAxios.get("/cards");
        if (Array.isArray(response.data)) {
          onDataAction(response.data, null, false);
        } else {
          onDataAction(null, "Dữ liệu từ API không phải mảng", false);
        }
      } catch (err: unknown) {
        let errMessage = "Lỗi khi tải danh sách: ";
        if (isAxiosError(err)) {
          const axiosError = err as AxiosError<{
            message?: string;
            error?: string;
          }>;
          errMessage +=
            (axiosError.response?.data?.message as string | undefined) ||
            (axiosError.response?.data?.error as string | undefined) ||
            axiosError.message ||
            "Lỗi không xác định";
        } else {
          errMessage += (err as Error).message || "Lỗi không xác định";
        }
        onDataAction(null, errMessage, false);
      } finally {
        onLoadingChangeAction(false);
      }
    };

    fetchCards();
  }, [onDataAction, onLoadingChangeAction]);

  return null;
}
