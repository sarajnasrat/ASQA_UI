// components/HijriRangeDatePicker.tsx
import React, { useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

interface HijriRangeDatePickerProps {
  onRangeChange?: (startDate: Date, endDate: Date) => void;
  label?: string;
}

export const HijriRangeDatePicker: React.FC<HijriRangeDatePickerProps> = ({
  onRangeChange,
  label,
}) => {
  const [dates, setDates] = useState<any[]>([]);

  const handleChange = (range: any) => {
    setDates(range);
    if (range && range.length === 2 && onRangeChange) {
      const startDate = range[0].toDate();
      const endDate = range[1].toDate();
      onRangeChange(startDate, endDate);
    }
  };

  return (
    <div className="hijri-range-picker">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <DatePicker
        value={dates}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        range
        placeholder="Select date range"
        inputClassName="w-full border border-gray-300 rounded-lg px-4 py-2"
        rangeHover
        showOtherDays
      />
    </div>
  );
};