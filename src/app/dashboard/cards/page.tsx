import axios, { isAxiosError } from "@/lib/axios"; // Thêm isAxiosError vào import

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

async function fetchCards(): Promise<Card[]> {
  const response = await axios.get("/cards");
  return response.data;
}

export default async function CardsPage() {
  let cards: Card[] = [];
  let error: string | null = null;

  try {
    cards = await fetchCards();
  } catch (err) {
    error =
      "Lỗi khi tải danh sách thẻ: " +
      (isAxiosError(err) ? err.response?.data?.message : err.message);
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (!cards)
    return <div className="animate-pulse text-foreground">Đang tải...</div>;
  if (!cards.length) return <div>Không có thẻ nào</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Danh sách thẻ</h1>
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
    </div>
  );
}
