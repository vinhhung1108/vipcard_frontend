"use server";

import { authAxios } from "@/components/AuthAxios";

interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string;
  serviceIds: number[];
  partnerIds: number[];
  referralCodeId?: number | null;
}

export async function createCardAction(data: Card, token?: string) {
  try {
    console.log("Payload gửi lên API (createCardAction):", data);
    const config = token ? { headers: { "X-Authorization-Token": token } } : {};
    const response = await authAxios.post("/cards", data, config);
    console.log("Phản hồi từ API (createCardAction):", response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Lỗi khi tạo thẻ");
    }
    throw new Error("Lỗi không xác định khi tạo thẻ");
  }
}

export async function updateCardAction(
  cardId: string,
  data: Card,
  token?: string
) {
  try {
    console.log("Payload gửi lên API (updateCardAction):", data);
    const config = token ? { headers: { "X-Authorization-Token": token } } : {};
    const response = await authAxios.put(`/cards/${cardId}`, data, config);
    console.log("Phản hồi từ API (updateCardAction):", response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Lỗi khi cập nhật thẻ");
    }
    throw new Error("Lỗi không xác định khi cập nhật thẻ");
  }
}
