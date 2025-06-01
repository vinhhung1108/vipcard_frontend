"use server"; // Directive để khai báo Server Actions

import { authAxios } from "@/components/AuthAxios";

interface Card {
  code: string;
  value: string;
  remainingValue: string;
  expiredAt: string;
  serviceIds: number[];
  partnerIds: number[];
}

export async function createCardAction(data: Card) {
  await authAxios.post("/cards", data);
}

export async function updateCardAction(cardId: string, data: Card) {
  await authAxios.put(`/cards/${cardId}`, data);
}
