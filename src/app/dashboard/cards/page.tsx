"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import FetchCards from "@/components/FetchCards";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

export default function CardsPage() {
  const router = useRouter();
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

  const handleLoadingChangeAction = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  return (
    <div className="p-6 bg-gray-50">
      <FetchCards
        onDataAction={handleData}
        onLoadingChangeAction={handleLoadingChangeAction}
      />
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              Danh sách thẻ
            </h1>
            <button
              onClick={() => router.push("/dashboard/cards/new")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thêm mới thẻ
            </button>
          </div>
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
                  <td className="border p-2">
                    {Number(card.value).toLocaleString()} VNĐ
                  </td>
                  <td className="border p-2">
                    {Number(card.remainingValue).toLocaleString()} VNĐ
                  </td>
                  <td className="border p-2">
                    {format(new Date(card.expiredAt), "dd/MM/yyyy HH:mm:ss", {
                      locale: vi,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
