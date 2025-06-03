/**
 * Утилиты для работы с датами
 */
export class DateUtils {
  /**
   * Форматирует дату в русском формате
   */
  static formatDate(
    date: string | Date,
    format: 'short' | 'long' = 'short'
  ): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'long') {
      return d.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return d.toLocaleDateString('ru-RU');
  }

  /**
   * Возвращает дату в формате YYYY-MM-DD для input[type="date"]
   */
  static toInputDate(date: string | Date = new Date()): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  /**
   * Вычисляет возраст по дате рождения
   */
  static calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Получает дату N дней назад
   */
  static getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.toInputDate(date);
  }

  /**
   * Получает дату N месяцев назад
   */
  static getMonthsAgo(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return this.toInputDate(date);
  }

  /**
   * Получает дату N лет назад
   */
  static getYearsAgo(years: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return this.toInputDate(date);
  }

  /**
   * Проверяет, является ли дата валидной
   */
  static isValidDate(date: string): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * Сравнивает две даты
   */
  static compareDates(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getTime() - d2.getTime();
  }

  /**
   * Проверяет, находится ли дата в указанном диапазоне
   */
  static isDateInRange(
    date: string,
    startDate: string,
    endDate: string
  ): boolean {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d <= end;
  }

  /**
   * Получает разность между датами в днях
   */
  static getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Группирует даты по периодам
   */
  static groupByPeriod(
    dates: string[],
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Record<string, string[]> {
    const groups: Record<string, string[]> = {};

    dates.forEach((date) => {
      const d = new Date(date);
      let key: string;

      switch (period) {
        case 'week': {
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          key = this.toInputDate(weekStart);
          break;
        }
        case 'month':
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter': {
          const quarter = Math.floor(d.getMonth() / 3) + 1;
          key = `${d.getFullYear()}-Q${quarter}`;
          break;
        }
        case 'year':
          key = d.getFullYear().toString();
          break;
        default:
          key = date;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(date);
    });

    return groups;
  }

  /**
   * Получает человекочитаемое описание времени, прошедшего с даты
   */
  static getTimeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'неделю' : 'недель'} назад`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'месяц' : 'месяцев'} назад`;
    }

    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'год' : 'лет'} назад`;
  }

  /**
   * Получает следующую рекомендуемую дату для анализа
   */
  static getNextRecommendedDate(
    lastDate: string,
    frequency: string
  ): string | null {
    const last = new Date(lastDate);

    // Простая логика на основе текста частоты
    if (frequency.includes('месяц')) {
      const match = frequency.match(/(\d+)/);
      const months = match ? parseInt(match[1]) : 6;
      last.setMonth(last.getMonth() + months);
      return this.toInputDate(last);
    }

    if (frequency.includes('год')) {
      last.setFullYear(last.getFullYear() + 1);
      return this.toInputDate(last);
    }

    return null; // Для анализов "по показаниям"
  }
}
