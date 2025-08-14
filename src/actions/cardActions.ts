"use server";

import { authAxios } from "@/components/AuthAxios";
import { cookies } from "next/headers";

interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string | Date | null;
  serviceIds: number[] | null;
  partnerIds: number[] | null;
  referralCodeId?: number | null;
}
interface CardEdit {
  value: number;
  remainingValue: number;
  expiredAt: string | Date | null;
  serviceIds: number[] | null;
  partnerIds: number[] | null;
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

type UpdateCardPayload = {
  value: number;
  remainingValue: number;
  expiredAt: string | Date;
  serviceIds?: number[] | null;
  partnerIds?: number[] | null;
  referralCodeId?: number | null;
};

type ActionOk = { ok: true; data: any };
type ActionErr = { ok: false; status: number; error: any; message?: string };
export type ActionResult = ActionOk | ActionErr;

export async function updateCardAction(
  cardId: string | number,
  data: UpdateCardPayload,
  tokenFromClient?: string
): Promise<ActionResult> {
  const apiBase = process.env.API_URL ?? "https://apicard.namident.com";

  // Lấy token: ưu tiên tham số, sau đó cookie, cuối cùng là env (nếu dùng service token)
  const token =
    tokenFromClient ??
    (await cookies()).get("token")?.value ??
    process.env.API_TOKEN;

  // Chuẩn hoá payload: không để null cho mảng, ISO cho ngày
  const payload: Record<string, any> = {
    value: Number(data.value),
    remainingValue: Number(data.remainingValue),
    expiredAt:
      data.expiredAt instanceof Date
        ? data.expiredAt.toISOString()
        : new Date(String(data.expiredAt)).toISOString(),
    serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
    partnerIds: Array.isArray(data.partnerIds) ? data.partnerIds : [],
    referralCodeId:
      typeof data.referralCodeId === "number" ? data.referralCodeId : null,
  };

  try {
    const res = await fetch(`${apiBase}/cards/${cardId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text(); // đọc text để log/parse
    if (!res.ok) {
      let error: any = text;
      try {
        error = JSON.parse(text);
      } catch {}
      // KHÔNG throw: trả về object lỗi để client xử lý, tránh RSC crash
      return { ok: false, status: res.status, error };
    }

    const json = text ? JSON.parse(text) : null;
    return { ok: true, data: json };
  } catch (e: any) {
    // Lỗi mạng/TLS/DNS… vào đây; vẫn KHÔNG throw
    console.error("updateCardAction failed:", e);
    return { ok: false, status: 500, error: String(e?.message || e) };
  }
}
