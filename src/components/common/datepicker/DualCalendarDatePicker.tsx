// components/DualCalendarDatePicker.tsx
import React, { useState, useEffect } from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';


interface DualCalendarDatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date, hijriDate: string, gregorianDate: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  showHijri?: boolean;
  showGregorian?: boolean;
}

export const DualCalendarDatePicker: React.FC<DualCalendarDatePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  className = '',
  showHijri = true,
  showGregorian = true,
}) => {
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [gregorianDate, setGregorianDate] = useState<string>('');
  const [activeCalendar, setActiveCalendar] = useState<'hijri' | 'gregorian'>('hijri');

  useEffect(() => {
    if (value) {
      const date = typeof value === 'string' ? new Date(value) : value;
      if (!isNaN(date.getTime())) {
        const dateObj = new DateObject(date);
        setSelectedDate(dateObj);
        
        // Get Hijri date (Persian/Arabic)
        const hijriObj = new DateObject(date).convert(persian, persian_fa);
        setHijriDate(hijriObj.format('YYYY/MM/DD'));
        
        // Get Gregorian date
        setGregorianDate(dateObj.format('YYYY/MM/DD'));
      }
    }
  }, [value]);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    
    if (date) {
      const gregorianDateObj = date.toDate();
      const hijriObj = new DateObject(gregorianDateObj).convert(persian, persian_fa);
      const hijriStr = hijriObj.format('YYYY/MM/DD');
      const gregorianStr = date.format('YYYY/MM/DD');
      
      setHijriDate(hijriStr);
      setGregorianDate(gregorianStr);
      
      onChange?.(gregorianDateObj, hijriStr, gregorianStr);
    } else {
      setHijriDate('');
      setGregorianDate('');
      onChange?.(null as any, '', '');
    }
  };

  const getCalendarConfig = () => {
    if (activeCalendar === 'hijri') {
      return {
        calendar: persian,
        locale: persian_fa,
        placeholder: 'انتخاب تاریخ هجری قمری',
      };
    } else {
      return {
        calendar: gregorian,
        locale: gregorian_en,
        placeholder: 'Select Gregorian Date',
      };
    }
  };

  const config = getCalendarConfig();

  return (
    <div className={`dual-calendar-date-picker ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Calendar Toggle Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveCalendar('hijri')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCalendar === 'hijri'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📅 تاریخ هجری قمری
        </button>
        <button
          type="button"
          onClick={() => setActiveCalendar('gregorian')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCalendar === 'gregorian'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📅 Gregorian Date
        </button>
      </div>
      
      {/* Date Picker */}
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        calendar={config.calendar}
        locale={config.locale}
        format="YYYY/MM/DD"
        placeholder={config.placeholder}
        className="rmdp-container w-full"
        containerClassName="w-full"
        inputClass="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        calendarPosition="bottom-right"
        
        showOtherDays
      />
      
      {/* Display Both Dates */}
      {(showHijri || showGregorian) && selectedDate && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {showHijri && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">تاریخ هجری قمری:</span>
              <span className="text-sm font-medium text-gray-800">{hijriDate}</span>
            </div>
          )}
          {showGregorian && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gregorian Date:</span>
              <span className="text-sm font-medium text-gray-800">{gregorianDate}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};