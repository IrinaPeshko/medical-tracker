import { PARAMETERS } from '../config/parameters';
import type {
  AnalysisResult,
  AnalysisStats,
  CategoryType,
  ChartDataPoint,
  NormalStatus,
} from '../types';

export class AnalysisUtils {
  /**
   * Проверяет, находится ли значение в пределах нормы
   */
  static checkNormal(
    value: number | string,
    parameterId: string,
    gender: 'male' | 'female' = 'female'
  ): NormalStatus {
    const parameter = PARAMETERS.find((p) => p.id === parameterId);
    if (!parameter || !parameter.isNumeric) {
      return 'normal';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      return 'normal';
    }

    const { normalRange } = parameter;

    // Проверяем гендерно-специфичные нормы
    const range =
      gender === 'female'
        ? normalRange.femaleRange || normalRange
        : normalRange.maleRange || normalRange;

    if (range.min !== undefined && numericValue < range.min) {
      return 'low';
    }
    if (range.max !== undefined && numericValue > range.max) {
      return 'high';
    }

    return 'normal';
  }

  /**
   * Получает последний результат для указанного параметра
   */
  static getLatestResult(
    results: AnalysisResult[],
    parameterId: string
  ): AnalysisResult | undefined {
    return results
      .filter((r) => r.parameterId === parameterId)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
  }

  /**
   * Получает все результаты для параметра, отсортированные по дате
   */
  static getResultsForParameter(
    results: AnalysisResult[],
    parameterId: string
  ): AnalysisResult[] {
    return results
      .filter((r) => r.parameterId === parameterId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Подготавливает данные для графика
   */
  static getChartData(
    results: AnalysisResult[],
    parameterId: string,
    gender: 'male' | 'female' = 'female'
  ): ChartDataPoint[] {
    const parameterResults = this.getResultsForParameter(results, parameterId);

    return parameterResults
      .filter((r) => r.value !== null && r.value !== undefined)
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString('ru-RU'),
        value: typeof r.value === 'string' ? parseFloat(r.value) : r.value,
        fullDate: r.date,
        status: this.checkNormal(r.value, parameterId, gender),
        notes: r.notes,
      }))
      .filter((point) => !isNaN(point.value));
  }

  /**
   * Подсчитывает количество отклонений от нормы
   */
  static getAbnormalCount(
    results: AnalysisResult[],
    gender: 'male' | 'female' = 'female'
  ): number {
    return PARAMETERS.reduce((count, param) => {
      const latest = this.getLatestResult(results, param.id);
      if (
        latest &&
        this.checkNormal(latest.value, param.id, gender) !== 'normal'
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  /**
   * Получает статистику по всем анализам
   */
  static getAnalysisStats(
    results: AnalysisResult[],
    gender: 'male' | 'female' = 'female'
  ): AnalysisStats {
    const abnormalCount = this.getAbnormalCount(results, gender);
    const lastAnalysisDate =
      results.length > 0
        ? new Date(
            Math.max(...results.map((r) => new Date(r.date).getTime()))
          ).toLocaleDateString('ru-RU')
        : null;

    const categoriesWithData = Array.from(
      new Set(results.map((r) => r.categoryId))
    ) as CategoryType[];

    // Простой анализ трендов (сравнение последних двух результатов)
    const recentTrends = PARAMETERS.map((param) => {
      const paramResults = this.getResultsForParameter(results, param.id);
      if (paramResults.length < 2) {
        return { parameterId: param.id, trend: 'stable' as const };
      }

      const latest = paramResults[paramResults.length - 1];
      const previous = paramResults[paramResults.length - 2];

      if (
        typeof latest.value === 'number' &&
        typeof previous.value === 'number'
      ) {
        const change = latest.value - previous.value;
        const changePercent = Math.abs(change / previous.value) * 100;

        // Считаем значимым изменение более 5%
        if (changePercent > 5) {
          return {
            parameterId: param.id,
            trend: change > 0 ? ('worsening' as const) : ('improving' as const),
          };
        }
      }

      return { parameterId: param.id, trend: 'stable' as const };
    }).filter((trend) => trend.trend !== 'stable');

    return {
      totalResults: results.length,
      abnormalCount,
      lastAnalysisDate,
      categoriesWithData,
      recentTrends,
    };
  }

  /**
   * Фильтрует результаты по категории
   */
  static getResultsByCategory(
    results: AnalysisResult[],
    categoryId: CategoryType
  ): AnalysisResult[] {
    return results.filter((r) => r.categoryId === categoryId);
  }

  /**
   * Фильтрует результаты по дате
   */
  static getResultsByDateRange(
    results: AnalysisResult[],
    startDate: string,
    endDate: string
  ): AnalysisResult[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return results.filter((r) => {
      const resultDate = new Date(r.date);
      return resultDate >= start && resultDate <= end;
    });
  }

  /**
   * Получает только результаты с отклонениями от нормы
   */
  static getAbnormalResults(
    results: AnalysisResult[],
    gender: 'male' | 'female' = 'female'
  ): AnalysisResult[] {
    return results.filter(
      (r) => this.checkNormal(r.value, r.parameterId, gender) !== 'normal'
    );
  }

  /**
   * Форматирует значение для отображения
   */
  static formatValue(value: number | string, unit: string): string {
    if (typeof value === 'string') {
      return value;
    }

    // Округляем до разумного количества знаков после запятой
    const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2);
    return `${formatted} ${unit}`;
  }

  /**
   * Получает цвет для статуса
   */
  static getStatusColor(status: NormalStatus): string {
    switch (status) {
      case 'normal':
        return '#4caf50'; // зеленый
      case 'high':
        return '#f44336'; // красный
      case 'low':
        return '#ff9800'; // оранжевый
      case 'attention':
        return '#2196f3'; // синий
      default:
        return '#757575'; // серый
    }
  }

  /**
   * Получает текстовое описание статуса
   */
  static getStatusText(status: NormalStatus): string {
    switch (status) {
      case 'normal':
        return 'В норме';
      case 'high':
        return 'Выше нормы';
      case 'low':
        return 'Ниже нормы';
      case 'attention':
        return 'Требует внимания';
      default:
        return 'Неизвестно';
    }
  }

  /**
   * Проверяет, является ли параметр числовым
   */
  static isNumericParameter(parameterId: string): boolean {
    const parameter = PARAMETERS.find((p) => p.id === parameterId);
    return parameter?.isNumeric ?? false;
  }

  /**
   * Получает описание нормального диапазона
   */
  static getNormalRangeText(
    parameterId: string,
    gender: 'male' | 'female' = 'female'
  ): string {
    const parameter = PARAMETERS.find((p) => p.id === parameterId);
    if (!parameter) return '';

    const { normalRange } = parameter;

    if (normalRange.reference) {
      return normalRange.reference;
    }

    const range =
      gender === 'female'
        ? normalRange.femaleRange || normalRange
        : normalRange.maleRange || normalRange;

    const parts: string[] = [];
    if (range.min !== undefined) parts.push(`от ${range.min}`);
    if (range.max !== undefined) parts.push(`до ${range.max}`);

    const rangeText = parts.join(' ');
    return rangeText ? `${rangeText} ${parameter.unit}` : '';
  }
}
