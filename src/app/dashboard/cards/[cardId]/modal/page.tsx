"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Spinner } from "@nextui-org/react";
import { authAxios, isAxiosError } from "@/components/AuthAxios";
import { AxiosError } from "axios"; // Import AxiosError để kiểu hóa

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

export default function CardModal() {
  const { cardId } = useParams() as { cardId: string };
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          const axiosError = err as AxiosError<{ message?: string }>; // Ép kiểu AxiosError với data có message tùy chọn
          errorMessage +=
            (axiosError.response?.data?.message as string | undefined) ||
            axiosError.message ||
            "Lỗi không xác định";
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
  const formattedCreatedAt =
    card && card.createdAt
      ? format(new Date(card.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })
      : null;
  const formattedUpdatedAt =
    card && card.updatedAt
      ? format(new Date(card.updatedAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })
      : null;

  const handleDelete = async () => {
    if (confirm("Xác nhận xóa?")) {
      setDeleting(true);
      setError(null);
      try {
        const response = await authAxios.delete(`/cards/${cardId}`);
        if (response.status === 200 || response.status === 204) {
          router.push("/dashboard/cards");
        } else {
          setError("Xóa thẻ thất bại: Phản hồi không hợp lệ từ server");
          setDeleting(false);
        }
      } catch (error: unknown) {
        let errorMessage = "Lỗi khi xóa thẻ: ";
        if (isAxiosError(error)) {
          const axiosError = error as AxiosError<{ message?: string }>; // Ép kiểu AxiosError với data có message tùy chọn
          errorMessage +=
            (axiosError.response?.data?.message as string | undefined) ||
            axiosError.message ||
            "Lỗi không xác định";
        } else {
          errorMessage += (error as Error).message || "Lỗi không xác định";
        }
        setError(errorMessage);
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
              <strong>Giá trị:</strong> {Number(card.value).toLocaleString()}{" "}
              VNĐ
            </p>
            <p>
              <strong>Còn lại:</strong>{" "}
              {Number(card.remainingValue).toLocaleString()} VNĐ
            </p>
            <p>
              <strong>Hết hạn:</strong> {formattedExpiredAt || "Không có"}
            </p>
            {formattedCreatedAt && (
              <p>
                <strong>Ngày tạo:</strong> {formattedCreatedAt}
              </p>
            )}
            {formattedUpdatedAt && (
              <p>
                <strong>Ngày cập nhật:</strong> {formattedUpdatedAt}
              </p>
            )}
            {card.services && card.services.length > 0 && (
              <div>
                <strong>Dịch vụ:</strong>
                <ul className="list-disc pl-5">
                  {card.services.map((service) => (
                    <li key={service.id}>
                      {service.name}: {service.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {card.partners && card.partners.length > 0 && (
              <div>
                <strong>Đối tác:</strong>
                <ul className="list-disc pl-5">
                  {card.partners.map((partner) => (
                    <li key={partner.id}>
                      {partner.name} - {partner.address}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {card.referralCode && (
              <p>
                <strong>Mã giới thiệu:</strong> {card.referralCode.code} (
                {card.referralCode.description})
              </p>
            )}
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
              disabled={deleting}
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
