"use server";

import { cookies } from "next/headers";

/** ==== Types ==== */
interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string | Date | null;
  serviceIds: number[] | null;
  partnerIds: number[] | null;
  referralCodeId?: number | null;
}

type UpdateCardPayload = {
  value: number;
  remainingValue: number;
  expiredAt: string | Date;
  serviceIds?: number[] | null;
  partnerIds?: number[] | null;
  referralCodeId?: number | null;
};

type ActionOk = { ok: true; data: unknown };
type ActionErr = {
  ok: false;
  status: number;
  error: unknown;
  message?: string;
};
export type ActionResult = ActionOk | ActionErr;

/** ==== Constants ==== */
const API_BASE = process.env.API_URL ?? "https://apicard.namident.com";

/** ==== Utils ==== */
interface CookieStore {
  get: (name: string) => { name: string; value: string } | undefined;
}
type MaybePromise<T> = T | Promise<T>;
type CookiesFn = () => MaybePromise<CookieStore>;

async function getCookieValue(name: string): Promise<string | undefined> {
  // Hỗ trợ cả trường hợp cookies() trả sync hoặc Promise (tùy version Next)
  const cookiesFn = cookies as unknown as CookiesFn;
  const jar = (await cookiesFn()) as CookieStore;
  return jar.get(name)?.value;
}

function toIsoString(input: string | Date): string {
  if (input instanceof Date) return input.toISOString();
  const d = new Date(String(input));
  return d.toISOString();
}

function buildAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Giữ tương thích nếu backend đang đọc header phụ này
    headers["X-Authorization-Token"] = token;
  }
  return headers;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** ==== Actions ==== */
export async function createCardAction(
  data: Card,
  tokenFromClient?: string
): Promise<ActionResult> {
  const token =
    tokenFromClient ?? (await getCookieValue("token")) ?? process.env.API_TOKEN;

  const payload = {
    ...data,
    expiredAt:
      data.expiredAt instanceof Date
        ? data.expiredAt.toISOString()
        : data.expiredAt,
    serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
    partnerIds: Array.isArray(data.partnerIds) ? data.partnerIds : [],
    referralCodeId:
      typeof data.referralCodeId === "number" ? data.referralCodeId : null,
  };

  try {
    const res = await fetch(`${API_BASE}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, error: safeParseJson(text) };
    }
    return { ok: true, data: text ? safeParseJson(text) : null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 500, error: msg, message: msg };
  }
}

export async function updateCardAction(
  cardId: string | number,
  data: UpdateCardPayload,
  tokenFromClient?: string
): Promise<ActionResult> {
  const token =
    tokenFromClient ?? (await getCookieValue("token")) ?? process.env.API_TOKEN;

  const payload = {
    value: Number(data.value),
    remainingValue: Number(data.remainingValue),
    expiredAt: toIsoString(data.expiredAt),
    serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
    partnerIds: Array.isArray(data.partnerIds) ? data.partnerIds : [],
    referralCodeId:
      typeof data.referralCodeId === "number" ? data.referralCodeId : null,
  };

  try {
    const res = await fetch(`${API_BASE}/cards/${cardId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, error: safeParseJson(text) };
    }
    return { ok: true, data: text ? safeParseJson(text) : null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("updateCardAction failed:", e);
    }
    return { ok: false, status: 500, error: msg, message: msg };
  }
}
