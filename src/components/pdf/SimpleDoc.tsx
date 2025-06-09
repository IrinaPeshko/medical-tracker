import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './styles';
import type { AnalysisResult } from '../../types';
import { PARAMETERS } from '../../config';
import { AnalysisUtils } from '../../utils';

interface PDFDocumentProps {
  data: {
    results: AnalysisResult[];
    title: string;
  };
}
export const SimpleDoc: React.FC<PDFDocumentProps> = ({ data }) => {
  return (
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
};
