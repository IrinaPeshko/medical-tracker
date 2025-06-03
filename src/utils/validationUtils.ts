import { PARAMETERS } from '../config/parameters';
import { DateUtils } from './dateUtils';

/**
 * Утилиты для валидации данных
 */
export class ValidationUtils {
  /**
   * Валидирует значение анализа
   */
  static validateAnalysisValue(
    parameterId: string,
    value: string | number
  ): { isValid: boolean; error?: string } {
    const parameter = PARAMETERS.find((p) => p.id === parameterId);

    if (!parameter) {
      return { isValid: false, error: 'Неизвестный параметр' };
    }

    // Для текстовых параметров
    if (!parameter.isNumeric) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return { isValid: false, error: 'Значение не может быть пустым' };
      }
      return { isValid: true };
    }

    // Для числовых параметров
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return { isValid: false, error: 'Значение должно быть числом' };
    }

    if (numericValue < 0) {
      return { isValid: false, error: 'Значение не может быть отрицательным' };
    }

    // Проверка на разумные пределы
    const reasonableLimits = this.getReasonableLimits(parameterId);
    if (reasonableLimits) {
      if (
        numericValue < reasonableLimits.min ||
        numericValue > reasonableLimits.max
      ) {
        return {
          isValid: false,
          error: `Значение должно быть от ${reasonableLimits.min} до ${reasonableLimits.max}`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Валидирует дату
   */
  static validateDate(date: string): { isValid: boolean; error?: string } {
    if (!date || date.trim().length === 0) {
      return { isValid: false, error: 'Дата обязательна' };
    }

    if (!DateUtils.isValidDate(date)) {
      return { isValid: false, error: 'Неверный формат даты' };
    }

    const analysisDate = new Date(date);
    const today = new Date();
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);

    if (analysisDate > today) {
      return { isValid: false, error: 'Дата не может быть в будущем' };
    }

    if (analysisDate < hundredYearsAgo) {
      return { isValid: false, error: 'Дата слишком давняя' };
    }

    return { isValid: true };
  }

  /**
   * Валидирует заметки
   */
  static validateNotes(notes: string): { isValid: boolean; error?: string } {
    if (notes && notes.length > 500) {
      return {
        isValid: false,
        error: 'Заметки не должны превышать 500 символов',
      };
    }

    return { isValid: true };
  }

  /**
   * Валидирует форму добавления результата
   */
  static validateAnalysisForm(data: {
    parameterId: string;
    value: string | number;
    date: string;
    notes?: string;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Валидация параметра
    if (!data.parameterId) {
      errors.parameterId = 'Выберите показатель';
    }

    // Валидация значения
    const valueValidation = this.validateAnalysisValue(
      data.parameterId,
      data.value
    );
    if (!valueValidation.isValid && valueValidation.error) {
      errors.value = valueValidation.error;
    }

    // Валидация даты
    const dateValidation = this.validateDate(data.date);
    if (!dateValidation.isValid && dateValidation.error) {
      errors.date = dateValidation.error;
    }

    // Валидация заметок
    if (data.notes) {
      const notesValidation = this.validateNotes(data.notes);
      if (!notesValidation.isValid && notesValidation.error) {
        errors.notes = notesValidation.error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Валидирует email
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email обязателен' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Неверный формат email' };
    }

    return { isValid: true };
  }

  /**
   * Валидирует номер телефона
   */
  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    if (!phone || phone.trim().length === 0) {
      return { isValid: true }; // Телефон необязателен
    }

    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
      return { isValid: false, error: 'Неверный формат номера телефона' };
    }

    return { isValid: true };
  }

  /**
   * Валидирует файл для импорта
   */
  static validateImportFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'Файл не выбран' };
    }

    if (file.type !== 'application/json') {
      return { isValid: false, error: 'Поддерживаются только JSON файлы' };
    }

    // Максимальный размер файла 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'Размер файла не должен превышать 10MB' };
    }

    return { isValid: true };
  }

  /**
   * Получает разумные пределы для параметра
   */
  private static getReasonableLimits(
    parameterId: string
  ): { min: number; max: number } | null {
    // Определяем разумные пределы для различных параметров
    const limits: Record<string, { min: number; max: number }> = {
      // Общий анализ крови
      wbc: { min: 0.1, max: 50 },
      rbc: { min: 1, max: 10 },
      hgb: { min: 30, max: 250 },
      hct: { min: 10, max: 70 },
      mcv: { min: 50, max: 150 },
      mch: { min: 15, max: 50 },
      mchc: { min: 200, max: 400 },
      rdw_cv: { min: 5, max: 30 },
      plt: { min: 10, max: 1000 },
      esr: { min: 0, max: 100 },

      // Лейкоцитарная формула
      neutrophils_abs: { min: 0, max: 20 },
      lymphocytes_abs: { min: 0, max: 10 },
      monocytes_abs: { min: 0, max: 5 },
      eosinophils_abs: { min: 0, max: 2 },

      // Биохимия
      glucose: { min: 1, max: 30 },
      ferritin: { min: 1, max: 1000 },

      // Гормоны
      dhea_s: { min: 10, max: 1000 },
      oh_progesterone: { min: 0, max: 10 },
      ttg: { min: 0, max: 20 },
      prolactin: { min: 0, max: 100 },
      lh: { min: 0, max: 200 },
      fsh: { min: 0, max: 200 },
      estradiol: { min: 0, max: 1000 },
      testosterone_total: { min: 0, max: 20 },
      androstenedione: { min: 0, max: 10 },
      shbg: { min: 0, max: 300 },
      amh: { min: 0, max: 20 },

      // Витамины
      vitamin_d: { min: 0, max: 200 },
    };

    return limits[parameterId] || null;
  }

  /**
   * Проверяет силу пароля
   */
  static validatePassword(password: string): {
    isValid: boolean;
    error?: string;
    strength: 'weak' | 'medium' | 'strong';
  } {
    if (!password || password.length === 0) {
      return { isValid: false, error: 'Пароль обязателен', strength: 'weak' };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Пароль должен содержать минимум 8 символов',
        strength: 'weak',
      };
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    let score = 0;

    // Проверяем различные критерии
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return {
      isValid: true,
      strength,
    };
  }

  /**
   * Валидирует настройки приложения
   */
  static validateAppSettings(settings: Record<string, unknown>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      settings.dateFormat &&
      !['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(
        settings.dateFormat as string
      )
    ) {
      errors.push('Неверный формат даты');
    }

    if (
      settings.language &&
      !['ru', 'en'].includes(settings.language as string)
    ) {
      errors.push('Неподдерживаемый язык');
    }

    if (settings.notifications && typeof settings.notifications === 'object') {
      const notifications = settings.notifications as Record<string, unknown>;
      if (
        notifications.reminderDays &&
        !Array.isArray(notifications.reminderDays)
      ) {
        errors.push('Дни напоминаний должны быть массивом');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
