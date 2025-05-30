"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Spinner } from "@nextui-org/react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";

interface Card {
  id: string;
  code: string;
  value?: number;
  remaining?: number;
  expiredAt: string;
}

export default function CardModal() {
  const { cardId } = useParams() as { cardId: string };
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false); // Thêm trạng thái deleting

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await authAxios.get(`/cards/${cardId}`);
        if (response.data && typeof response.data === "object") {
          setCard(response.data as Card);
        } else {
          setError("Dữ liệu thẻ không hợp lệ từ API");
        }
      } catch (err: unknown) {
        let errorMessage = "Lỗi khi tải chi tiết thẻ: ";
        if (isAxiosError(err)) {
          errorMessage +=
            err.response?.data?.message || err.message || "Lỗi không xác định";
        } else {
          errorMessage += (err as Error).message || "Lỗi không xác định";
        }
        setError(errorMessage);
      }
    };
    fetchCard();
  }, [cardId]);

  const formattedExpiredAt = card
    ? format(new Date(card.expiredAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })
    : null;

  const handleDelete = async () => {
    if (confirm("Xác nhận xóa?")) {
      setDeleting(true);
      try {
        await authAxios.delete(`/cards/${cardId}`);
        router.push("/dashboard/cards");
      } catch (error) {
        setError("Lỗi khi xóa thẻ: " + (error as Error).message);
        setDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      {error ? (
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      ) : !card ? (
        <div className="flex justify-center items-center">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Chi tiết thẻ
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Mã thẻ:</strong> {card.code || "Không có"}
            </p>
            <p>
              <strong>Giá trị:</strong> {card.value?.toLocaleString() ?? "0"}{" "}
              VNĐ
            </p>
            <p>
              <strong>Còn lại:</strong>{" "}
              {card.remaining?.toLocaleString() ?? "0"} VNĐ
            </p>
            <p>
              <strong>Hết hạn:</strong> {formattedExpiredAt || "Không có"}
            </p>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => router.push(`/dashboard/cards/${cardId}/edit`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting} // Vô hiệu hóa nút khi đang xóa
              className={`px-4 py-2 bg-red-500 text-white rounded ${
                deleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
              }`}
            >
              {deleting ? <Spinner size="sm" color="white" /> : "Xóa"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
