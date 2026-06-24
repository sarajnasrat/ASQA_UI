type DateInput = Date | string;

type DualDateResult = {
  gregorian: string;
  hijri: string;
  shamsi: string;
  time: string | null;
};

export class IslamicDateFormatter {
  private static readonly SHAMSI_LOCALE = "fa-AF-u-ca-persian";
  private static readonly GREGORIAN_LOCALE = "en-US";
  private static readonly DEFAULT_TIME_ZONE = "UTC";

  private static hasExplicitTime(date: DateInput): boolean {
    if (date instanceof Date) {
      return !(
        date.getHours() === 0 &&
        date.getMinutes() === 0 &&
        date.getSeconds() === 0 &&
        date.getMilliseconds() === 0
      );
    }

    return /T\d{2}:\d{2}/.test(date) || /\s\d{2}:\d{2}/.test(date);
  }

  private static parseOriginalDate(date: DateInput): Date {
    const parsed =
      date instanceof Date ? new Date(date.getTime()) : new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: ${date}`);
    }

    return parsed;
  }

  /**
   * Normalizes incoming values to a stable noon-UTC date so plain YYYY-MM-DD
   * strings do not shift around midnight or by local timezone.
   */
  private static normalizeDate(date: DateInput): Date {
    if (date instanceof Date) {
      return new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          12,
          0,
          0,
          0,
        ),
      );
    }

    const plainDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    if (plainDateMatch) {
      const [, year, month, day] = plainDateMatch;
      return new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0),
      );
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: ${date}`);
    }

    return new Date(
      Date.UTC(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate(),
        12,
        0,
        0,
        0,
      ),
    );
  }

  private static buildFormatter(
    locale: string,
    options: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone: this.DEFAULT_TIME_ZONE,
    });
  }

  private static formatWithLocale(
    date: DateInput,
    locale: string,
    options: Intl.DateTimeFormatOptions,
  ): string {
    return this.buildFormatter(locale, options).format(this.normalizeDate(date));
  }

  /**
   * Main view formatter.
   * Kept on the existing API so current view usages render Afghanistan-style
   * Hijri Shamsi dates without requiring broader refactors.
   */
  static format(date: DateInput): string {
    return this.getShamsiDate(date);
  }

  /**
   * Backward-compatible full date formatter for existing view code.
   */
  static getFullIslamicDate(date: DateInput): string {
    return this.getFullShamsiDate(date);
  }

  /**
   * Backward-compatible short date formatter for existing view code.
   */
  static getShortIslamicDate(date: DateInput): string {
    return this.getShortShamsiDate(date);
  }

  /**
   * Afghanistan Shamsi date.
   * Example: ۳۱ جوزا ۱۴۰۵
   */
  static getShamsiDate(date: DateInput): string {
    return this.formatWithLocale(date, this.SHAMSI_LOCALE, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Full Afghanistan Shamsi date with weekday.
   */
  static getFullShamsiDate(date: DateInput): string {
    return this.formatWithLocale(date, this.SHAMSI_LOCALE, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Short Afghanistan Shamsi date.
   */
  static getShortShamsiDate(date: DateInput): string {
    return this.formatWithLocale(date, this.SHAMSI_LOCALE, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  /**
   * Original time, formatted as hour:minute when the input actually contains time.
   */
  static getTime(date: DateInput): string | null {
    if (!this.hasExplicitTime(date)) {
      return null;
    }

    return this.parseOriginalDate(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static formatQamari(date: DateInput, showTime: boolean = false): string {
    const shamsi = this.getShamsiDate(date);
    const time = showTime ? this.getTime(date) : null;
    return time ? `${shamsi} - ${time}` : shamsi;
  }

  static formatFullQamari(date: DateInput, showTime: boolean = false): string {
    const shamsi = this.getFullShamsiDate(date);
    const time = showTime ? this.getTime(date) : null;
    return time ? `${shamsi} - ${time}` : shamsi;
  }

  static formatQamariRange(
    startDate?: DateInput | null,
    endDate?: DateInput | null,
    separator: string = " - ",
    showTime: boolean = false,
  ): string {
    if (!startDate && !endDate) return "-";
    if (!startDate) return this.formatQamari(endDate as DateInput, showTime);
    if (!endDate) return this.formatQamari(startDate, showTime);

    return `${this.formatQamari(startDate, showTime)}${separator}${this.formatQamari(endDate, showTime)}`;
  }

  /**
   * Gregorian + Shamsi together.
   * `hijri` is kept as a backward-compatible field name for current views.
   */
  static getDualDate(date: DateInput): DualDateResult {
    const normalizedDate = this.normalizeDate(date);
    const shamsi = this.getShamsiDate(normalizedDate);

    return {
      hijri: shamsi,
      shamsi,
      gregorian: this.buildFormatter(this.GREGORIAN_LOCALE, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(normalizedDate),
      time: this.getTime(date),
    };
  }
}
