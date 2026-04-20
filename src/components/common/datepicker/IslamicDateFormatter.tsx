import DateObject from "react-date-object";
import arabic from "react-date-object/calendars/arabic";
import arabic_ar from "react-date-object/locales/arabic_ar";

export class IslamicDateFormatter {

  /**
   * Convert Gregorian → Hijri Qamari
   */
  static format(
    date: Date | string,
    format: string = "DD MMMM YYYY"
  ): string {
    const dateObj =
      typeof date === "string" ? new Date(date) : date;

    return new DateObject(dateObj)
      .convert(arabic, arabic_ar)
      .format(format);
  }

  /**
   * Full Hijri date with weekday
   * Example: الاثنين 11 شوال 1447
   */
  static getFullIslamicDate(date: Date | string): string {
    return this.format(date, "dddd DD MMMM YYYY");
  }

  /**
   * Short Hijri date
   * Example: 1447/10/11
   */
  static getShortIslamicDate(date: Date | string): string {
    return this.format(date, "YYYY/MM/DD");
  }

  /**
   * Hijri + Gregorian together
   */
  static getDualDate(date: Date | string): {
    hijri: string;
    gregorian: string;
  } {
    const dateObj =
      typeof date === "string" ? new Date(date) : date;

    const hijri = this.format(dateObj, "DD MMMM YYYY");

    const gregorian = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      hijri,
      gregorian,
    };
  }
}