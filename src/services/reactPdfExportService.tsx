// services/reactPdfExportService.ts
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import type { AnalysisResult, Parameter, Category } from '../types/analysis';
import { PARAMETERS, CATEGORIES } from '../config';
import { AnalysisUtils } from '../utils/analysisUtils';
import RobotoRegular from '../assets/fonts/Roboto-Regular.ttf';
import RobotoItalic from '../assets/fonts/Roboto-Italic.ttf';
import RobotoBold from '../assets/fonts/Roboto-Bold.ttf';
import RobotoBoldItalic from '../assets/fonts/Roboto-BoldItalic.ttf';

// Регистрируем шрифт для поддержки русского языка
Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal', fontStyle: 'normal' },
    { src: RobotoItalic, fontWeight: 'normal', fontStyle: 'italic' },
    { src: RobotoBold, fontWeight: 'bold', fontStyle: 'normal' },
    { src: RobotoBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// Стили для PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 12,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1976d2',
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    color: '#333333',
    borderBottom: '1px solid #cccccc',
    paddingBottom: 3,
  },
  text: {
    fontFamily: 'Roboto',
    fontSize: 11,
    marginBottom: 4,
    color: '#333333',
  },
  boldText: {
    fontFamily: 'Roboto',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
  },
  smallText: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  metadata: {
    fontFamily: 'Roboto',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 15,
    border: '1px solid #dddddd',
  },
  table: {
    fontFamily: 'Roboto',
    // display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 15,
  },
  tableRow: {
    fontFamily: 'Roboto',
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    fontFamily: 'Roboto',
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
  },
  tableColWide: {
    fontFamily: 'Roboto',
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
  },
  tableColNarrow: {
    fontFamily: 'Roboto',
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
  },
  tableCell: {
    fontFamily: 'Roboto',
    fontSize: 9,
    textAlign: 'left',
  },
  tableCellHeader: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalStatus: {
    fontFamily: 'Roboto',
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  abnormalStatus: {
    fontFamily: 'Roboto',
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  warningStatus: {
    fontFamily: 'Roboto',
    color: '#f57c00',
    fontWeight: 'bold',
  },
  parameterHeader: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#1976d2',
  },
  trendText: {
    fontFamily: 'Roboto',
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 3,
  },
  pageNumber: {
    fontFamily: 'Roboto',
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666666',
  },
  statsGrid: {
    fontFamily: 'Roboto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    fontFamily: 'Roboto',
    width: '23%',
    backgroundColor: '#f8f9fa',
    padding: 8,
    textAlign: 'center',
    border: '1px solid #dee2e6',
  },
  statNumber: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
  },
});

interface PDFDocumentProps {
  data: {
    results: AnalysisResult[];
    categories: Category[];
    options: {
      includeNotes: boolean;
      includeStatistics: boolean;
      includeTrends: boolean;
      title: string;
    };
  };
}

// Компонент заголовка
const HeaderSection: React.FC<{ title: string }> = ({ title }) => (
  <View>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.metadata}>
      <Text style={styles.text}>
        Дата создания:{' '}
        {new Date().toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <Text style={styles.text}>
        Время: {new Date().toLocaleTimeString('ru-RU')}
      </Text>
    </View>
  </View>
);

// Компонент статистики
const StatisticsSection: React.FC<{ results: AnalysisResult[] }> = ({
  results,
}) => {
  const abnormalCount = PARAMETERS.reduce((count, param) => {
    const latest = AnalysisUtils.getLatestResult(results, param.id);
    return latest &&
      AnalysisUtils.checkNormal(latest.value, param.id, 'female') !== 'normal'
      ? count + 1
      : count;
  }, 0);

  const categoriesCount = new Set(results.map((r) => r.categoryId)).size;
  const withNotesCount = results.filter(
    (r) => r.notes && r.notes.trim()
  ).length;

  const dates = results.map((r) => new Date(r.date));
  const dateRange =
    dates.length > 0
      ? {
          start: new Date(Math.min(...dates.map((d) => d.getTime()))),
          end: new Date(Math.max(...dates.map((d) => d.getTime()))),
        }
      : null;

  return (
    <View>
      <Text style={styles.subtitle}>Общая статистика</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{results.length}</Text>
          <Text style={styles.statLabel}>Всего результатов</Text>
        </View>
        <View style={styles.statBox}>
          <Text
            style={[
              styles.statNumber,
              abnormalCount > 0 ? { color: '#d32f2f' } : {},
            ]}
          >
            {abnormalCount}
          </Text>
          <Text style={styles.statLabel}>Отклонений</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{categoriesCount}</Text>
          <Text style={styles.statLabel}>Категорий</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{withNotesCount}</Text>
          <Text style={styles.statLabel}>С заметками</Text>
        </View>
      </View>

      {dateRange && (
        <Text style={styles.text}>
          Период данных: {dateRange.start.toLocaleDateString('ru-RU')} —{' '}
          {dateRange.end.toLocaleDateString('ru-RU')}
        </Text>
      )}
    </View>
  );
};

// Компонент сводной таблицы по категориям
const CategoriesSummary: React.FC<{ results: AnalysisResult[] }> = ({
  results,
}) => {
  const categoryStats = CATEGORIES.map((category) => {
    const categoryResults = results.filter((r) => r.categoryId === category.id);
    const abnormalInCategory = PARAMETERS.filter(
      (p) => p.category === category.id
    ).reduce((count, param) => {
      const latest = AnalysisUtils.getLatestResult(results, param.id);
      return latest &&
        AnalysisUtils.checkNormal(latest.value, param.id, 'female') !== 'normal'
        ? count + 1
        : count;
    }, 0);

    const lastResult = categoryResults.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return {
      category,
      resultCount: categoryResults.length,
      abnormalCount: abnormalInCategory,
      lastDate: lastResult?.date,
    };
  }).filter((stat) => stat.resultCount > 0);

  return (
    <View>
      <Text style={styles.subtitle}>Сводка по категориям</Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Категория</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Результатов</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Отклонений</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Последний анализ</Text>
          </View>
        </View>

        {categoryStats.map((stat, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {stat.category.name.length > 30
                  ? stat.category.name.slice(0, 27) + '...'
                  : stat.category.name}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{stat.resultCount}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text
                style={[
                  styles.tableCell,
                  stat.abnormalCount > 0
                    ? styles.abnormalStatus
                    : styles.normalStatus,
                ]}
              >
                {stat.abnormalCount}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {stat.lastDate
                  ? new Date(stat.lastDate).toLocaleDateString('ru-RU')
                  : 'Нет данных'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Компонент для отображения параметра
const ParameterSection: React.FC<{
  parameter: Parameter;
  results: AnalysisResult[];
  options: any;
}> = ({ parameter, results, options }) => {
  const paramResults = results
    .filter((r) => r.parameterId === parameter.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (paramResults.length === 0) return null;

  const normalRange = AnalysisUtils.getNormalRangeText(parameter.id, 'female');

  // Вычисляем тренд
  const trend =
    paramResults.length > 1
      ? (() => {
          const values = paramResults
            .filter((r) => typeof r.value === 'number')
            .map((r) => r.value as number);

          if (values.length < 2) return 'Недостаточно данных';

          const recent = values[0];
          const previous = values[1];
          const change = ((recent - previous) / previous) * 100;

          if (Math.abs(change) < 2) return 'Стабильный';
          return change > 0
            ? `Рост на ${change.toFixed(1)}%`
            : `Снижение на ${Math.abs(change).toFixed(1)}%`;
        })()
      : null;

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.parameterHeader}>{parameter.name}</Text>

      {normalRange && (
        <Text style={styles.smallText}>Норма: {normalRange}</Text>
      )}

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColNarrow}>
            <Text style={styles.tableCellHeader}>Дата</Text>
          </View>
          <View style={styles.tableColNarrow}>
            <Text style={styles.tableCellHeader}>Значение</Text>
          </View>
          <View style={styles.tableColNarrow}>
            <Text style={styles.tableCellHeader}>Статус</Text>
          </View>
          {options.includeNotes && (
            <View style={styles.tableColWide}>
              <Text style={styles.tableCellHeader}>Заметки</Text>
            </View>
          )}
        </View>

        {paramResults.slice(0, 8).map((result, index) => {
          const status = AnalysisUtils.checkNormal(
            result.value,
            parameter.id,
            'female'
          );
          const statusText = AnalysisUtils.getStatusText(status);

          return (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColNarrow}>
                <Text style={styles.tableCell}>
                  {new Date(result.date).toLocaleDateString('ru-RU')}
                </Text>
              </View>
              <View style={styles.tableColNarrow}>
                <Text style={styles.tableCell}>
                  {AnalysisUtils.formatValue(result.value, result.unit)}
                </Text>
              </View>
              <View style={styles.tableColNarrow}>
                <Text
                  style={[
                    styles.tableCell,
                    status === 'normal'
                      ? styles.normalStatus
                      : status === 'high' || status === 'low'
                        ? styles.abnormalStatus
                        : styles.warningStatus,
                  ]}
                >
                  {statusText}
                </Text>
              </View>
              {options.includeNotes && (
                <View style={styles.tableColWide}>
                  <Text style={styles.tableCell}>
                    {result.notes
                      ? result.notes.length > 60
                        ? result.notes.slice(0, 57) + '...'
                        : result.notes
                      : ''}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {options.includeTrends && trend && (
        <Text style={styles.trendText}>Тренд: {trend}</Text>
      )}
    </View>
  );
};

// Компонент для категории
const CategorySection: React.FC<{
  category: Category;
  results: AnalysisResult[];
  options: any;
}> = ({ category, results, options }) => {
  const categoryResults = results.filter((r) => r.categoryId === category.id);
  const parameters = PARAMETERS.filter((p) => p.category === category.id);

  if (categoryResults.length === 0) return null;

  return (
    <View>
      <Text style={styles.subtitle}>{category.name}</Text>

      {category.description && (
        <Text style={[styles.text, { fontStyle: 'italic', marginBottom: 10 }]}>
          {category.description}
        </Text>
      )}

      <Text style={styles.smallText}>
        Всего результатов в категории: {categoryResults.length} | Рекомендуемая
        частота: {category.frequency || 'По показаниям'}
      </Text>

      {parameters.map((parameter) => (
        <ParameterSection
          key={parameter.id}
          parameter={parameter}
          results={categoryResults}
          options={options}
        />
      ))}
    </View>
  );
};

// Основной компонент PDF документа
const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <HeaderSection title={data.options.title} />

      {data.options.includeStatistics && (
        <StatisticsSection results={data.results} />
      )}

      <CategoriesSummary results={data.results} />

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Страница ${pageNumber} из ${totalPages}`
        }
        fixed
      />
    </Page>

    {data.categories.map((category) => (
      <Page key={category.id} size="A4" style={styles.page}>
        <CategorySection
          category={category}
          results={data.results}
          options={data.options}
        />

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Страница ${pageNumber} из ${totalPages}`
          }
          fixed
        />
      </Page>
    ))}
  </Document>
);

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
      const simpleDoc = (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.title}>{data.title}</Text>

            <View style={styles.metadata}>
              <Text style={styles.text}>
                Всего результатов: {data.results.length}
              </Text>
              <Text style={styles.text}>
                Дата создания: {new Date().toLocaleDateString('ru-RU')}
              </Text>
            </View>

            {data.results.slice(0, 20).map((result, index) => {
              const param = PARAMETERS.find((p) => p.id === result.parameterId);
              if (!param) return null;

              return (
                <Text key={index} style={styles.text}>
                  {index + 1}. {param.name}:{' '}
                  {AnalysisUtils.formatValue(result.value, result.unit)}(
                  {new Date(result.date).toLocaleDateString('ru-RU')})
                </Text>
              );
            })}

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Страница ${pageNumber} из ${totalPages}`
              }
              fixed
            />
          </Page>
        </Document>
      );

      const blob = await pdf(simpleDoc).toBlob();
      return blob;
    } catch (error) {
      console.error('Ошибка создания простого PDF:', error);
      throw new Error(
        `Не удалось создать простой PDF: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      );
    }
  }
}
