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

export async function createCardAction(data: Card) {
  try {
    const response = await authAxios.post("/cards", data); // Gửi payload là object
    return response.data; // Trả về dữ liệu thành công
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Lỗi khi tạo thẻ");
    }
    throw new Error("Lỗi không xác định khi tạo thẻ");
  }
}

export async function updateCardAction(cardId: string, data: Card) {
  try {
    const response = await authAxios.put(`/cards/${cardId}`, data); // Gửi payload là object
    return response.data; // Trả về dữ liệu thành công
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Lỗi khi cập nhật thẻ");
    }
    throw new Error("Lỗi không xác định khi cập nhật thẻ");
  }
}
