// components/HijriDatePicker.tsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import arabic from 'react-date-object/calendars/arabic';
import arabic_ar from 'react-date-object/locales/arabic_ar';

interface HijriDatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date, hijriString: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  calendar?: 'gregorian' | 'persian' | 'arabic';
  language?: 'en' | 'fa' | 'ar';
  format?: string;
}

export const HijriDatePicker: React.FC<HijriDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  disabled = false,
  calendar = 'persian',
  language = 'fa',
  format = 'YYYY/MM/DD',
}) => {
  const [selectedDate, setSelectedDate] = useState<any>(null);

  // Get calendar and locale based on selection
  const getCalendar = () => {
    switch (calendar) {
      case 'persian':
        return persian;
      case 'arabic':
        return arabic;
      default:
        return gregorian;
    }
  };

  const getLocale = () => {
    if (calendar === 'persian') {
      return persian_fa;
    } else if (calendar === 'arabic') {
      return arabic_ar;
    } else {
      return gregorian_en;
    }
  };

  useEffect(() => {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value;
      if (!isNaN(date.getTime())) {
        setSelectedDate(new DateObject(date));
      }
    }
  }, [value]);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    if (date && onChange) {
      const gregorianDate = date.toDate();
      const hijriString = date.format('YYYY/MM/DD');
      onChange(gregorianDate, hijriString);
    }
  };

  return (
    <div className={`hijri-date-picker ${className}`}>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        placeholder={placeholder}
        disabled={disabled}
        calendar={getCalendar()}
        locale={getLocale()}
        format={format}
        className="rmdp-container"
        containerClassName="w-full"
        inputClassName="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        calendarPosition="bottom-right"
        showTodayButton
        showOtherDays
        range={false}
        multiple={false}
      />
    </div>
  );
};