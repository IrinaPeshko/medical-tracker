// services/pdfExportService.ts (исправленная версия с поддержкой русского языка)
import type { AnalysisResult, Parameter, Category } from '../types/analysis';
import { PARAMETERS, CATEGORIES } from '../config';
import { AnalysisUtils } from '../utils/analysisUtils';

/**
 * Сервис для экспорта медицинских данных в PDF
 * Использует jsPDF для генерации PDF-документов
 */
export class PDFExportService {
  private static readonly PAGE_WIDTH = 210; // A4 ширина в мм
  private static readonly PAGE_HEIGHT = 297; // A4 высота в мм
  private static readonly MARGIN = 20;
  private static readonly LINE_HEIGHT = 6;

  /**
   * Экспортирует данные анализов в PDF
   */
  static async exportToPDF(data: {
    results: AnalysisResult[];
    categories: Category[];
    options: {
      includeCharts: boolean;
      includeNotes: boolean;
      includeStatistics?: boolean;
      includeTrends?: boolean;
      title?: string;
      paperSize?: 'a4' | 'letter';
      orientation?: 'portrait' | 'landscape';
    };
  }): Promise<Blob> {
    try {
      // Динамический импорт jsPDF
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      // Создаем PDF документ
      const doc = new jsPDF({
        orientation: data.options.orientation || 'portrait',
        unit: 'mm',
        format: data.options.paperSize || 'a4'
      });

      let currentY = this.MARGIN;

      // Используем стандартный шрифт без попыток добавить кастомные
      doc.setFont('helvetica');

      // Заголовок документа
      currentY = this.addTitle(doc, data.options.title || 'Otchet po medicinskim analizim', currentY);
      currentY = this.addMetadata(doc, data.results, currentY);

      // Сводная статистика
      if (data.options.includeStatistics !== false) {
        currentY = this.addSummaryStats(doc, data.results, currentY);
      }

      // Результаты по категориям
      for (const category of data.categories) {
        const categoryResults = data.results.filter(r => r.categoryId === category.id);
        if (categoryResults.length === 0) continue;

        currentY = this.addCategorySection(doc, category, categoryResults, data.options, currentY);
      }

      // Добавляем номера страниц
      this.addPageNumbers(doc);

      // Возвращаем PDF как Blob
      const pdfOutput = doc.output('blob');
      return pdfOutput;
    } catch (error) {
      console.error('Error in exportToPDF:', error);
      throw new Error(`Oshibka sozdaniya PDF: ${error instanceof Error ? error.message : 'Neizvestnaya oshibka'}`);
    }
  }

  /**
   * Преобразует русский текст в транслитерацию для PDF
   */
  private static transliterate(text: string): string {
    const ruToEn: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
      'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
      'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };

    return text.replace(/[а-яёА-ЯЁ]/g, char => ruToEn[char] || char);
  }

  /**
   * Безопасный вывод текста в PDF
   */
  private static safeText(doc: any, text: string, x: number, y: number): void {
    try {
      // Попробуем вывести оригинальный текст
      doc.text(text, x, y);
    } catch (error) {
      // Если не получается, используем транслитерацию
      const transliterated = this.transliterate(text);
      doc.text(transliterated, x, y);
    }
  }

  /**
   * Добавляет заголовок документа
   */
  private static addTitle(doc: any, title: string, startY: number): number {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, title, this.MARGIN, startY);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.safeText(doc, `Sformirovan: ${date}`, this.MARGIN, startY + 8);

    return startY + 20;
  }

  /**
   * Добавляет метаданные
   */
  private static addMetadata(doc: any, results: AnalysisResult[], startY: number): number {
    const stats = this.calculateStats(results);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, 'Obshchaya informatsiya', this.MARGIN, startY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let y = startY + 8;
    const info = [
      `Vsego rezultatov: ${stats.totalResults}`,
      `Otkloneniy ot normy: ${stats.abnormalCount}`,
      `Period: ${stats.dateRange}`,
      `Kategoriy: ${stats.categoriesCount}`
    ];

    info.forEach(line => {
      this.safeText(doc, line, this.MARGIN, y);
      y += this.LINE_HEIGHT;
    });

    return y + 10;
  }

  /**
   * Добавляет сводную статистику
   */
  private static addSummaryStats(doc: any, results: AnalysisResult[], startY: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, 'Svodnaya statistika', this.MARGIN, startY);

    // Таблица со статистикой по категориям
    const tableData = this.prepareCategoryStatsTable(results);
    
    let y = startY + 10;
    const colWidths = [60, 40, 40, 50];
    const headers = ['Kategoriya', 'Rezultatov', 'Otkloneniy', 'Posledniy analiz'];

    // Заголовки таблицы
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let x = this.MARGIN;
    headers.forEach((header, i) => {
      this.safeText(doc, header, x, y);
      x += colWidths[i];
    });

    y += 8;

    // Данные таблицы
    doc.setFont('helvetica', 'normal');
    tableData.forEach(row => {
      x = this.MARGIN;
      row.forEach((cell, i) => {
        this.safeText(doc, cell, x, y);
        x += colWidths[i];
      });
      y += this.LINE_HEIGHT;
    });

    return y + 15;
  }

  /**
   * Добавляет секцию категории
   */
  private static addCategorySection(
    doc: any,
    category: Category,
    results: AnalysisResult[],
    options: any,
    startY: number
  ): number {
    let currentY = startY;

    // Проверяем, нужна ли новая страница
    if (currentY > this.PAGE_HEIGHT - 50) {
      doc.addPage();
      currentY = this.MARGIN;
    }

    // Заголовок категории
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, this.transliterate(category.name), this.MARGIN, currentY);

    if (category.description) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      currentY += 6;
      this.safeText(doc, this.transliterate(category.description), this.MARGIN, currentY);
    }

    currentY += 15;

    // Группируем результаты по параметрам
    const parameterGroups = this.groupResultsByParameter(results);

    for (const [parameterId, paramResults] of Object.entries(parameterGroups)) {
      const parameter = PARAMETERS.find(p => p.id === parameterId);
      if (!parameter) continue;

      currentY = this.addParameterSection(doc, parameter, paramResults, options, currentY);
    }

    return currentY + 10;
  }

  /**
   * Добавляет секцию параметра
   */
  private static addParameterSection(
    doc: any,
    parameter: Parameter,
    results: AnalysisResult[],
    options: any,
    startY: number
  ): number {
    let currentY = startY;

    // Проверяем место на странице
    if (currentY > this.PAGE_HEIGHT - 40) {
      doc.addPage();
      currentY = this.MARGIN;
    }

    // Название параметра
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    this.safeText(doc, this.transliterate(parameter.name), this.MARGIN, currentY);

    // Норма
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const normalRange = AnalysisUtils.getNormalRangeText(parameter.id, 'female');
    if (normalRange) {
      currentY += 5;
      this.safeText(doc, `Norma: ${normalRange}`, this.MARGIN, currentY);
    }

    currentY += 10;

    // Таблица результатов
    const sortedResults = results.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Заголовки таблицы результатов
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const resultHeaders = ['Data', 'Znachenie', 'Status'];
    if (options.includeNotes) resultHeaders.push('Zametki');

    let x = this.MARGIN;
    const colWidths = options.includeNotes ? [30, 30, 25, 75] : [40, 40, 30];
    
    resultHeaders.forEach((header, i) => {
      this.safeText(doc, header, x, currentY);
      x += colWidths[i];
    });

    currentY += 6;

    // Данные результатов
    doc.setFont('helvetica', 'normal');
    sortedResults.slice(0, 10).forEach(result => {
      x = this.MARGIN;
      const status = AnalysisUtils.checkNormal(result.value, parameter.id, 'female');
      const statusText = this.getStatusTextEn(status);
      
      const row = [
        new Date(result.date).toLocaleDateString('en-US'),
        AnalysisUtils.formatValue(result.value, result.unit),
        statusText
      ];
      
      if (options.includeNotes) {
        const notes = result.notes ? this.transliterate(result.notes) : '';
        row.push(notes.length > 50 ? notes.slice(0, 50) + '...' : notes);
      }

      // Цвет для статуса
      if (status !== 'normal') {
        doc.setTextColor(status === 'high' ? 255 : 255, status === 'high' ? 0 : 140, 0);
      }

      row.forEach((cell, i) => {
        this.safeText(doc, cell, x, currentY);
        x += colWidths[i];
      });

      doc.setTextColor(0, 0, 0); // Сброс цвета
      currentY += this.LINE_HEIGHT;
    });

    // Показать тренд
    if (options.includeTrends !== false && sortedResults.length > 1) {
      currentY += 5;
      const trend = this.calculateTrend(sortedResults.slice(0, 3));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      this.safeText(doc, `Trend: ${trend}`, this.MARGIN, currentY);
      currentY += 5;
    }

    return currentY + 10;
  }

  /**
   * Получает статус на английском
   */
  private static getStatusTextEn(status: string): string {
    switch (status) {
      case 'normal': return 'Normal';
      case 'high': return 'High';
      case 'low': return 'Low';
      case 'attention': return 'Attention';
      default: return 'Unknown';
    }
  }

  /**
   * Вычисляет статистику
   */
  private static calculateStats(results: AnalysisResult[]) {
    const abnormalCount = PARAMETERS.reduce((count, param) => {
      const latest = AnalysisUtils.getLatestResult(results, param.id);
      if (latest && AnalysisUtils.checkNormal(latest.value, param.id, 'female') !== 'normal') {
        return count + 1;
      }
      return count;
    }, 0);

    const dates = results.map(r => new Date(r.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return {
      totalResults: results.length,
      abnormalCount,
      categoriesCount: new Set(results.map(r => r.categoryId)).size,
      dateRange: `${minDate.toLocaleDateString('en-US')} - ${maxDate.toLocaleDateString('en-US')}`
    };
  }

  /**
   * Подготавливает данные таблицы статистики по категориям
   */
  private static prepareCategoryStatsTable(results: AnalysisResult[]): string[][] {
    return CATEGORIES.map(category => {
      const categoryResults = results.filter(r => r.categoryId === category.id);
      const abnormalInCategory = PARAMETERS
        .filter(p => p.category === category.id)
        .reduce((count, param) => {
          const latest = AnalysisUtils.getLatestResult(results, param.id);
          if (latest && AnalysisUtils.checkNormal(latest.value, param.id, 'female') !== 'normal') {
            return count + 1;
          }
          return count;
        }, 0);

      const lastResult = categoryResults
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const categoryName = this.transliterate(category.name);
      return [
        categoryName.length > 25 ? categoryName.slice(0, 22) + '...' : categoryName,
        categoryResults.length.toString(),
        abnormalInCategory.toString(),
        lastResult ? new Date(lastResult.date).toLocaleDateString('en-US') : 'No data'
      ];
    }).filter(row => row[1] !== '0');
  }

  /**
   * Группирует результаты по параметрам
   */
  private static groupResultsByParameter(results: AnalysisResult[]): Record<string, AnalysisResult[]> {
    return results.reduce((groups, result) => {
      if (!groups[result.parameterId]) {
        groups[result.parameterId] = [];
      }
      groups[result.parameterId].push(result);
      return groups;
    }, {} as Record<string, AnalysisResult[]>);
  }

  /**
   * Вычисляет тренд
   */
  private static calculateTrend(results: AnalysisResult[]): string {
    if (results.length < 2) return 'Insufficient data';

    const values = results
      .filter(r => typeof r.value === 'number')
      .map(r => r.value as number);

    if (values.length < 2) return 'Insufficient data';

    const recent = values[0];
    const previous = values[1];
    const change = ((recent - previous) / previous) * 100;

    if (Math.abs(change) < 2) return 'Stable';
    return change > 0 ? `Up ${change.toFixed(1)}%` : `Down ${Math.abs(change).toFixed(1)}%`;
  }

  /**
   * Добавляет номера страниц
   */
  private static addPageNumbers(doc: any): void {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      this.safeText(
        doc,
        `Page ${i} of ${pageCount}`,
        this.PAGE_WIDTH - this.MARGIN - 20,
        this.PAGE_HEIGHT - 10
      );
    }
  }

  /**
   * Создает простой PDF с базовой информацией (альтернативный метод)
   */
  static async createSimplePDF(data: {
    results: AnalysisResult[];
    title: string;
  }): Promise<Blob> {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();

      doc.setFontSize(16);
      this.safeText(doc, this.transliterate(data.title), 20, 20);

      doc.setFontSize(12);
      this.safeText(doc, `Vsego rezultatov: ${data.results.length}`, 20, 40);
      this.safeText(doc, `Data sozdaniya: ${new Date().toLocaleDateString('en-US')}`, 20, 50);

      let y = 70;
      data.results.slice(0, 20).forEach((result, index) => {
        const param = PARAMETERS.find(p => p.id === result.parameterId);
        if (param) {
          doc.setFontSize(10);
          const text = `${index + 1}. ${this.transliterate(param.name)}: ${AnalysisUtils.formatValue(result.value, result.unit)} (${new Date(result.date).toLocaleDateString('en-US')})`;
          this.safeText(doc, text, 20, y);
          y += 10;
          
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        }
      });

      return new Blob([doc.output('blob')], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error in createSimplePDF:', error);
      throw new Error(`Oshibka sozdaniya prostogo PDF: ${error instanceof Error ? error.message : 'Neizvestnaya oshibka'}`);
    }
  }
}