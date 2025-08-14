// src/app/dashboard/cards/[id]/edit/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";        // ⬅️ bắt buộc, tránh Edge gây lỗi fetch/SDK
export const dynamic = "force-dynamic"; // ⬅️ tránh cache

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Đọc body CHỈ 1 LẦN
    const body = await req.json();

    // Chuẩn hoá payload (không gửi null cho mảng)
    const payload: Record<string, any> = {};
    if (body.value != null) payload.value = body.value;
    if (body.remainingValue != null) payload.remainingValue = body.remainingValue;
    if (body.expiredAt) payload.expiredAt = new Date(body.expiredAt).toISOString();
    if (Array.isArray(body.serviceIds)) payload.serviceIds = body.serviceIds;
    if (Array.isArray(body.partnerIds)) payload.partnerIds = body.partnerIds;
    if (body.referralCodeId != null) payload.referralCodeId = body.referralCodeId;

    // Base URL: ưu tiên env trên Vercel, fallback ra domain API của bạn
    const apiBase = process.env.API_URL || "https://apicard.namident.com";
    const url = new URL(`/cards/${params.id}`, apiBase).toString();

    const upstream = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // Nếu có auth token thì thêm vào:
        ...(process.env.API_TOKEN ? { Authorization: `Bearer ${process.env.API_TOKEN}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    // Đọc text để log đầy đủ khi lỗi (tránh “body used already”)
    const text = await upstream.text();

    if (!upstream.ok) {
      // KHÔNG throw: trả JSON lỗi rõ ràng để client hiển thị, tránh crash RSC
      console.error("Upstream error:", upstream.status, text);
      // Thử parse JSON nếu upstream trả JSON
      let error: any = text;
      try { error = JSON.parse(text); } catch {}
      return NextResponse.json(
        { ok: false, upstreamStatus: upstream.status, error },
        { status: 400 }
      );
    }

    // Trả nguyên body upstream (nếu là JSON)
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Lỗi mạng/TLS/DNS… sẽ vào đây → trả JSON, không throw
    console.error("Route /dashboard/cards/[id]/edit failed:", err?.stack || err);
    return NextResponse.json(
      { ok: false, message: String(err?.message || err) },
      { status: 500 }
    );
  }
}
