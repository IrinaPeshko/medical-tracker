import { Text, View } from '@react-pdf/renderer';
import { CATEGORIES, PARAMETERS } from '../../config';
import type { AnalysisResult } from '../../types';
import { AnalysisUtils } from '../../utils';
import { styles } from './styles';

// Компонент сводной таблицы по категориям
export const CategoriesSummary: React.FC<{ results: AnalysisResult[] }> = ({
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
