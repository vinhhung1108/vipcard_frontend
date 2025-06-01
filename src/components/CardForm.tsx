"use client";
import { useState, useCallback, useEffect } from "react";
import DatePicker from "react-datepicker";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

interface Card {
  code: string;
  value: string;
  remainingValue: string;
  expiredAt: string;
  serviceIds: number[];
  partnerIds: number[];
}

interface Service {
  id: number;
  name: string;
}

interface Partner {
  id: number;
  name: string;
}

interface CardFormProps {
  initialData?: Partial<Card>;
  services: Service[];
  partners: Partner[];
  onSubmit: (data: Card) => Promise<void>;
  isLoading: boolean;
}

export default function CardForm({
  initialData = {},
  services,
  partners,
  onSubmit,
  isLoading,
}: CardFormProps) {
  const [formData, setFormData] = useState<Card>({
    code: initialData.code || "",
    value: initialData.value || "",
    remainingValue: initialData.remainingValue || "",
    expiredAt: initialData.expiredAt || "",
    serviceIds: initialData.serviceIds || [],
    partnerIds: initialData.partnerIds || [],
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (name: string, selectedKeys: Set<string>) => {
      const values = Array.from(selectedKeys).map(Number);
      setFormData((prev) => ({ ...prev, [name]: values }));
    },
    []
  );

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      const isoDate = date.toISOString();
      setFormData((prev) => ({ ...prev, expiredAt: isoDate }));
    } else {
      setFormData((prev) => ({ ...prev, expiredAt: "" }));
    }
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
    if (isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      setError("Giá trị phải là số dương");
      return;
    }
    if (
      isNaN(Number(formData.remainingValue)) ||
      Number(formData.remainingValue) < 0
    ) {
      setError("Số dư phải là số không âm");
      return;
    }
    if (formData.serviceIds.length === 0 || formData.partnerIds.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ và một đối tác");
      return;
    }

    try {
      const payload: Card = {
        code: formData.code,
        value: formData.value,
        remainingValue: formData.remainingValue,
        expiredAt: formData.expiredAt,
        serviceIds: formData.serviceIds,
        partnerIds: formData.partnerIds,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    }
  }, [formData, onSubmit]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-foreground">Mã thẻ</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="VD: VIP-0004"
          />
        </div>
        <div>
          <label className="block text-foreground">Giá trị (VNĐ)</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="VD: 300000000"
          />
        </div>
        <div>
          <label className="block text-foreground">Còn lại (VNĐ)</label>
          <input
            type="number"
            name="remainingValue"
            value={formData.remainingValue}
            onChange={handleChange}
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="VD: 200000"
          />
        </div>
        <div>
          <label className="block text-foreground">Ngày hết hạn</label>
          <DatePicker
            selected={formData.expiredAt ? new Date(formData.expiredAt) : null}
            onChange={handleDateChange}
            minDate={new Date()} // Giới hạn ngày nhỏ nhất là hôm nay
            dateFormat="dd/MM/yyyy" // Chỉ hiển thị ngày
            placeholderText="Chọn ngày"
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 bg-blue-50"
            wrapperClassName="w-full"
            showIcon
            icon={<CalendarDaysIcon className="w-5 h-5 text-blue-500 mt-2" />}
          />
        </div>
        <div>
          <label className="block text-foreground">Dịch vụ</label>
          <select
            multiple
            value={formData.serviceIds.map(String)}
            onChange={(e) =>
              handleSelectChange(
                "serviceIds",
                new Set(
                  Array.from(e.target.selectedOptions).map((opt) => opt.value)
                )
              )
            }
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-foreground">Đối tác</label>
          <select
            multiple
            value={formData.partnerIds.map(String)}
            onChange={(e) =>
              handleSelectChange(
                "partnerIds",
                new Set(
                  Array.from(e.target.selectedOptions).map((opt) => opt.value)
                )
              )
            }
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
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
