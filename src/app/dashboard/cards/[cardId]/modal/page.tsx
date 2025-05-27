import axios, { isAxiosError } from "@/lib/axios";

interface Card {
  id: string;
  code: string;
  value: number;
  remaining: number;
  expiredAt: string;
}

interface Params {
  cardId: string;
}

async function fetchCard(cardId: string): Promise<Card> {
  const response = await axios.get(`/cards/${cardId}`);
  return response.data;
}

export default async function CardModal({
  params,
}: {
  params: Promise<Params>;
}) {
  const { cardId } = await params; // Giải quyết params để lấy cardId
  let card: Card | null = null;
  let error: string | null = null;

  try {
    card = await fetchCard(cardId);
  } catch (err: unknown) {
    let errorMessage = "Lỗi khi tải chi tiết thẻ: ";
    if (isAxiosError(err)) {
      errorMessage +=
        err.response?.data?.message || err.message || "Lỗi không xác định";
    } else {
      errorMessage += (err as Error).message || "Lỗi không xác định";
    }
    error = errorMessage;
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (!card) return <div>Không tìm thấy thẻ</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded shadow-lg w-[40%] relative">
        <h2 className="text-xl font-bold mb-4 text-foreground">Chi tiết thẻ</h2>
        <p>
          <strong>Mã thẻ:</strong> {card.code}
        </p>
        <p>
          <strong>Giá trị:</strong> {card.value}
        </p>
        <p>
          <strong>Còn lại:</strong> {card.remaining}
        </p>
        <p>
          <strong>Hết hạn:</strong> {card.expiredAt}
        </p>
        <a
          href="/dashboard/cards"
          className="mt-4 inline-block bg-blue-500 text-white p-2 rounded"
        >
          Đóng
        </a>
      </div>
    </div>
  );
}
