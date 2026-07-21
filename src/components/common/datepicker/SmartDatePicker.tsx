import React, { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";

import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import arabic from "react-date-object/calendars/arabic";

import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import arabic_ar from "react-date-object/locales/arabic_ar";

type CalendarType = "gregorian" | "persian" | "arabic";

const afghanPersianLocale = {
  ...persian_fa,
  months: [
    ["حمل", "حم"],
    ["ثور", "ثو"],
    ["جوزا", "جو"],
    ["سرطان", "سر"],
    ["اسد", "اسد"],
    ["سنبله", "سن"],
    ["میزان", "میز"],
    ["عقرب", "عقر"],
    ["قوس", "قوس"],
    ["جدی", "جد"],
    ["دلو", "دل"],
    ["حوت", "حوت"],
  ],
};

interface Props {
  value: any;
  onChange: (value: any) => void;
  calendarType: CalendarType;
  label?: string;
  className?: string;
  widthValue?: number;
  inputClassName?: string;
  labelClassName?: string;
}

export const SmartDatePicker: React.FC<Props> = ({
  value,
  onChange,
  calendarType,
  label,
  className = "",
  widthValue = 0,
  inputClassName = "",
  labelClassName = "font-semibold mb-2 block",
}) => {
  const [internalValue, setInternalValue] = useState<any>(null);

  // ================= SYNC VALUE =================
  useEffect(() => {
    if (value) {
      setInternalValue(new DateObject(value));
    } else {
      setInternalValue(null);
    }
  }, [value]);

  // ================= FORCE RE-RENDER ON TYPE CHANGE =================
  const key = calendarType;

  // ================= CALENDAR CONFIG =================
  const getConfig = () => {
    switch (calendarType) {
      case "persian":
        return {
          calendar: persian,
          locale: afghanPersianLocale,
        };

      case "arabic":
        return {
          calendar: arabic,
          locale: arabic_ar,
        };

      default:
        return {
          calendar: gregorian,
          locale: gregorian_en,
        };
    }
  };

  const config = getConfig();

  const handleChange = (date: any) => {
    setInternalValue(date);
    onChange(date);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}

      <DatePicker
        key={key}
        value={internalValue}
        onChange={handleChange}
        calendar={config.calendar}
        locale={config.locale}
        format="YYYY/MM/DD"
        className="max-w-full"
        style={{
          width: widthValue?`${widthValue}px`:"100%",
        }}
        inputClass={`w-full border border-gray-300 rounded-lg px-3 py-2 ${inputClassName}`}
        calendarPosition="bottom-right"
      />
    </div>
  );
};
