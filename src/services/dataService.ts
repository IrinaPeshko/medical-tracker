import type { AnalysisResult } from '../types/analysis';
import { getHistoricalData } from '../config/historicalData';

/**
 * Сервис для работы с данными анализов
 */
export class DataService {
  private static readonly USER_DATA_KEY = 'userResults';
  private static readonly SETTINGS_KEY = 'appSettings';

  /**
   * Загружает все результаты (исторические + пользовательские)
   */
  static loadAllResults(): AnalysisResult[] {
    const historical = this.loadHistoricalResults();
    const user = this.loadUserResults();

    // Объединяем и сортируем по дате
    return [...historical, ...user].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Загружает исторические данные
   */
  static loadHistoricalResults(): AnalysisResult[] {
    const historicalData = getHistoricalData();
    return historicalData.results;
  }

  /**
   * Загружает пользовательские результаты из localStorage
   */
  static loadUserResults(): AnalysisResult[] {
    try {
      const saved = localStorage.getItem(this.USER_DATA_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Ошибка при загрузке пользовательских данных:', error);
      return [];
    }
  }

  /**
   * Сохраняет пользовательские результаты в localStorage
   */
  static saveUserResults(results: AnalysisResult[]): void {
    try {
      // Фильтруем только пользовательские результаты (не исторические)
      const userResults = results.filter((r) => !r.isHistorical);
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userResults));
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      throw new Error('Не удалось сохранить данные');
    }
  }

  /**
   * Добавляет новый результат
   */
  static addResult(
    result: Omit<AnalysisResult, 'id' | 'createdAt'>
  ): AnalysisResult {
    const newResult: AnalysisResult = {
      ...result,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isHistorical: false,
    };

    const userResults = this.loadUserResults();
    userResults.push(newResult);
    this.saveUserResults(userResults);

    return newResult;
  }

  /**
   * Обновляет существующий результат
   */
  static updateResult(
    id: string,
    updates: Partial<Omit<AnalysisResult, 'id' | 'createdAt'>>
  ): AnalysisResult | null {
    const userResults = this.loadUserResults();
    const index = userResults.findIndex((r) => r.id === id);

    if (index === -1) {
      return null; // Результат не найден или это исторический результат
    }

    const updatedResult = {
      ...userResults[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    userResults[index] = updatedResult;
    this.saveUserResults(userResults);

    return updatedResult;
  }

  /**
   * Удаляет результат
   */
  static deleteResult(id: string): boolean {
    const userResults = this.loadUserResults();
    const index = userResults.findIndex((r) => r.id === id);

    if (index === -1) {
      return false; // Результат не найден или это исторический результат
    }

    userResults.splice(index, 1);
    this.saveUserResults(userResults);
    return true;
  }

  /**
   * Экспортирует все данные в JSON
   */
  static exportData(includeHistorical = true): string {
    const data = includeHistorical
      ? this.loadAllResults()
      : this.loadUserResults();

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalResults: data.length,
      results: data,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Импортирует данные из JSON
   */
  static async importData(
    jsonData: string,
    mergeWithExisting = true
  ): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
  }> {
    try {
      const data = JSON.parse(jsonData);
      const results = data.results || data; // Поддержка разных форматов

      if (!Array.isArray(results)) {
        throw new Error('Неверный формат данных');
      }

      const validResults: AnalysisResult[] = [];
      const errors: string[] = [];

      // Валидируем каждый результат
      results.forEach((result: unknown, index: number) => {
        try {
          if (this.validateResult(result)) {
            // Создаем результат без isHistorical поля
            const resultData = result as AnalysisResult;
            validResults.push({
              id: resultData.id || this.generateId(),
              categoryId: resultData.categoryId,
              parameterId: resultData.parameterId,
              value: resultData.value,
              unit: resultData.unit,
              date: resultData.date,
              notes: resultData.notes,
              createdAt: resultData.createdAt,
              updatedAt: resultData.updatedAt,
              importedAt: new Date().toISOString(),
              isHistorical: false, // Импортированные данные не являются историческими
            });
          } else {
            errors.push(`Результат ${index + 1}: неверная структура данных`);
          }
        } catch (error) {
          errors.push(`Результат ${index + 1}: ${error}`);
        }
      });

      // Сохраняем валидные результаты
      if (validResults.length > 0) {
        const existingResults = mergeWithExisting ? this.loadUserResults() : [];
        const allResults = [...existingResults, ...validResults];
        this.saveUserResults(allResults);
      }

      return {
        success: true,
        imported: validResults.length,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
      };
    }
  }

  /**
   * Очищает все пользовательские данные
   */
  static clearUserData(): void {
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Получает информацию о хранилище
   */
  static getStorageInfo(): {
    totalResults: number;
    historicalResults: number;
    userResults: number;
    lastSaved: string | null;
  } {
    const historical = this.loadHistoricalResults();
    const user = this.loadUserResults();

    return {
      totalResults: historical.length + user.length,
      historicalResults: historical.length,
      userResults: user.length,
      lastSaved: localStorage.getItem(`${this.USER_DATA_KEY}_lastSaved`),
    };
  }

  /**
   * Создает резервную копию данных
   */
  static createBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      userResults: this.loadUserResults(),
      settings: localStorage.getItem(this.SETTINGS_KEY),
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Восстанавливает данные из резервной копии
   */
  static restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);

      if (backup.userResults) {
        this.saveUserResults(backup.userResults);
      }

      if (backup.settings) {
        localStorage.setItem(this.SETTINGS_KEY, backup.settings);
      }

      return true;
    } catch (error) {
      console.error('Ошибка при восстановлении из резервной копии:', error);
      return false;
    }
  }

  /**
   * Генерирует уникальный ID
   */
  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Валидирует структуру результата
   */
  private static validateResult(result: unknown): result is AnalysisResult {
    if (!result || typeof result !== 'object') {
      return false;
    }

    const required = ['categoryId', 'parameterId', 'value', 'unit', 'date'];
    return required.every(
      (field) =>
        field in result &&
        (result as Record<string, unknown>)[field] !== undefined
    );
  }
}
