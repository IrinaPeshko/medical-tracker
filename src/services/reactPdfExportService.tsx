import { pdf } from '@react-pdf/renderer';
import type { AnalysisResult, Category } from '../types/analysis';
import { PDFDocument } from '../components/pdf/PDFDocument';
import { SimpleDoc } from '../components/pdf/SimpleDoc';

// Основной сервис для экспорта
export class ReactPDFExportService {
  /**
   * Создает PDF документ с использованием react-pdf
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
    };
  }): Promise<Blob> {
    try {
      const pdfData = {
        results: data.results,
        categories: data.categories.filter((cat) =>
          data.results.some((r) => r.categoryId === cat.id)
        ),
        options: {
          includeNotes: data.options.includeNotes,
          includeStatistics: data.options.includeStatistics !== false,
          includeTrends: data.options.includeTrends !== false,
          title: data.options.title || 'Отчет по медицинским анализам',
        },
      };

      const blob = await pdf(<PDFDocument data={pdfData} />).toBlob();
      return blob;
    } catch (error) {
      console.error('Ошибка создания PDF с react-pdf:', error);
      throw new Error(
        `Не удалось создать PDF: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      );
    }
  }

  /**
   * Создает простой PDF документ
   */
  static async createSimplePDF(data: {
    results: AnalysisResult[];
    title: string;
  }): Promise<Blob> {
    try {
      const blob = await pdf(
        <SimpleDoc data={{ results: data.results, title: data.title }} />
      ).toBlob();
      return blob;
    } catch (error) {
      console.error('Ошибка создания простого PDF:', error);
      throw new Error(
        `Не удалось создать простой PDF: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      );
    }
  }
}
