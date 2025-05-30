"use client";
import { useState, useCallback } from "react";
import { Spinner } from "@nextui-org/react";
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
  const [loading, setLoading] = useState(true);

  const handleData = useCallback(
    (
      fetchedCards: Card[] | null,
      fetchedError: string | null,
      isLoading: boolean
    ) => {
      setCards(fetchedCards);
      setError(fetchedError);
      setLoading(isLoading);
    },
    []
  );

  return (
    <div className="p-6 bg-gray-50">
      <FetchCards onDataAction={handleData} />
      {loading ? (
        <div className="flex justify-center items-center">
          <Spinner size="lg" color="primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : !cards ? (
        <div className="text-center text-foreground">Không có dữ liệu</div>
      ) : cards.length === 0 ? (
        <div className="text-center text-foreground">Không có thẻ nào</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4 text-foreground text-center">
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
