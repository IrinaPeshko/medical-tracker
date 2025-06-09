import { Text, View } from '@react-pdf/renderer';
import type { AnalysisResult, Parameter } from '../../types';
import { AnalysisUtils } from '../../utils';
import { styles } from './styles';

// Компонент для отображения параметра
export const ParameterSection: React.FC<{
  parameter: Parameter;
  results: AnalysisResult[];
  options: {
    includeNotes: boolean;
    includeStatistics: boolean;
    includeTrends: boolean;
    title: string;
  };
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
