"use client";
import { useState, useCallback } from "react";
import FetchCards from "@/components/FetchCards";

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleData = useCallback(
    (fetchedCards: Card[] | null, fetchedError: string | null) => {
      setCards(fetchedCards);
      setError(fetchedError);
    },
    [] // Không có dependency vì setCards và setError không thay đổi
  );

  return (
    <div className="p-6">
      <FetchCards onDataAction={handleData} />
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : !cards ? (
        <div className="animate-pulse text-foreground">Đang tải...</div>
      ) : cards.length === 0 ? (
        <div>Không có thẻ nào</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            Danh sách thẻ
          </h1>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Mã thẻ</th>
                <th className="border p-2">Giá trị</th>
                <th className="border p-2">Còn lại</th>
                <th className="border p-2">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id}>
                  <td className="border p-2">
                    <a
                      href={`/dashboard/cards/${card.id}/modal`}
                      className="text-blue-500"
                    >
                      {card.code}
                    </a>
                  </td>
                  <td className="border p-2">{card.value}</td>
                  <td className="border p-2">{card.remaining}</td>
                  <td className="border p-2">{card.expiredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
