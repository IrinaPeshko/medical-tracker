import { Text, View } from '@react-pdf/renderer';
import type { AnalysisResult } from '../../types';
import { styles } from './styles';
import { AnalysisUtils } from '../../utils';
import { PARAMETERS } from '../../config';

// Компонент статистики
export const StatisticsSection: React.FC<{ results: AnalysisResult[] }> = ({
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
