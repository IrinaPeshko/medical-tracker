// Основной компонент PDF документа

import { Document, Page, Text } from '@react-pdf/renderer';
import type { AnalysisResult, Category } from '../../types';
import { styles } from './styles';
import { HeaderSection } from './HeaderSection';
import { StatisticsSection } from './StatisticsSection';
import { CategoriesSummary } from './CategoriesSummary';
import { CategorySection } from './CategorySection';

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

export const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => (
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
