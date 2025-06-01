"use client";

import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { isAxiosError } from "axios";

interface Card {
  code: string;
  value: number;
  remainingValue: number;
  expiredAt: string;
  serviceIds: number[];
  partnerIds: number[];
  referralCodeId?: number | null;
}

interface Service {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
}

interface ReferralCode {
  id: number;
  code: string;
  description: string;
}

interface CardFormProps {
  initialData?: Partial<Card>;
  services: Service[];
  partners: Partner[];
  referralCodes: ReferralCode[];
  onSubmitAction: (data: Card) => Promise<void>;
  isLoading: boolean;
}

export default function CardForm({
  initialData = {},
  services,
  partners,
  referralCodes,
  onSubmitAction,
  isLoading,
}: CardFormProps) {
  const [formData, setFormData] = useState<Card>({
    code: initialData.code ?? "",
    value: initialData.value ?? 0,
    remainingValue: initialData.remainingValue ?? 0,
    expiredAt: initialData.expiredAt ?? "",
    serviceIds: initialData.serviceIds ?? [],
    partnerIds: initialData.partnerIds ?? [],
    referralCodeId: initialData.referralCodeId ?? null,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
      name: keyof Pick<
        Card,
        "code" | "value" | "remainingValue" | "expiredAt" | "referralCodeId"
      >
    ) => {
      const { value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "value" || name === "remainingValue"
            ? Number(value)
            : name === "referralCodeId"
            ? value
              ? Number(value)
              : null
            : value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (name: "serviceIds" | "partnerIds", selectedKeys: Set<string>) => {
      const values = Array.from(selectedKeys).map(Number);
      setFormData((prev) => ({ ...prev, [name]: values }));
    },
    []
  );

  const handleDateChange = useCallback((date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      expiredAt: date ? date.toISOString() : "",
    }));
  }, []);

  const handleFormSubmit = useCallback(async () => {
    setError(null);

    if (
      !formData.code ||
      !formData.value ||
      !formData.remainingValue ||
      !formData.expiredAt
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (isNaN(formData.value) || formData.value <= 0) {
      setError("Giá trị phải là số dương");
      return;
    }

    if (isNaN(formData.remainingValue) || formData.remainingValue < 0) {
      setError("Số dư phải là số không âm");
      return;
    }

    try {
      await onSubmitAction({
        ...formData,
        value: Number(formData.value),
        remainingValue: Number(formData.remainingValue),
        referralCodeId:
          formData.referralCodeId !== undefined
            ? formData.referralCodeId
            : null,
      });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const apiMsg = err.response?.data?.message;
        setError(
          Array.isArray(apiMsg)
            ? apiMsg.join(", ")
            : err.response?.data?.error || err.message || "Lỗi không xác định"
        );
      } else {
        setError((err as Error).message || "Lỗi không xác định");
      }
    }
  }, [formData, onSubmitAction]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="space-y-4">
        {/* Mã thẻ */}
        <div>
          <label className="block text-foreground">Mã thẻ</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleChange(e, "code")}
            className="w-full p-2 border rounded border-gray-300"
            placeholder="VD: VIP-0001"
          />
        </div>

        {/* Giá trị */}
        <div>
          <label className="block text-foreground">Giá trị (VNĐ)</label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => handleChange(e, "value")}
            className="w-full p-2 border rounded border-gray-300"
            placeholder="VD: 1000000"
          />
        </div>

        {/* Còn lại */}
        <div>
          <label className="block text-foreground">Còn lại (VNĐ)</label>
          <input
            type="number"
            value={formData.remainingValue}
            onChange={(e) => handleChange(e, "remainingValue")}
            className="w-full p-2 border rounded border-gray-300"
            placeholder="VD: 500000"
          />
        </div>

        {/* Ngày hết hạn */}
        <div>
          <label className="block text-foreground">Ngày hết hạn</label>
          <DatePicker
            selected={formData.expiredAt ? new Date(formData.expiredAt) : null}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            placeholderText="Chọn ngày"
            className="w-full p-2 border rounded border-gray-300 bg-blue-50"
            showIcon
            icon={<CalendarDaysIcon className="w-5 h-5 text-blue-500" />}
          />
        </div>

        {/* Dịch vụ */}
        <div>
          <label className="block text-foreground">Dịch vụ</label>
          <select
            multiple
            value={formData.serviceIds.map(String)}
            onChange={(e) =>
              handleSelectChange(
                "serviceIds",
                new Set(
                  Array.from(e.target.selectedOptions).map((o) => o.value)
                )
              )
            }
            className="w-full p-2 border rounded border-gray-300"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Đối tác */}
        <div>
          <label className="block text-foreground">Đối tác</label>
          <select
            multiple
            value={formData.partnerIds.map(String)}
            onChange={(e) =>
              handleSelectChange(
                "partnerIds",
                new Set(
                  Array.from(e.target.selectedOptions).map((o) => o.value)
                )
              )
            }
            className="w-full p-2 border rounded border-gray-300"
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Giới thiệu */}
        <div>
          <label className="block text-foreground">Giới thiệu</label>
          <select
            value={formData.referralCodeId?.toString() || ""}
            onChange={(e) => handleChange(e, "referralCodeId")}
            className="w-full p-2 border rounded border-gray-300"
          >
            <option value="">Không chọn</option>
            {referralCodes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleFormSubmit}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-500 text-white rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Lưu"}
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
