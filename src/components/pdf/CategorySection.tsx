import { Text, View } from '@react-pdf/renderer';
import { PARAMETERS } from '../../config';
import type { AnalysisResult, Category } from '../../types';
import { styles } from './styles';
import { ParameterSection } from './ParameterSection';

// Компонент для категории
export const CategorySection: React.FC<{
  category: Category;
  results: AnalysisResult[];
  options: {
    includeNotes: boolean;
    includeStatistics: boolean;
    includeTrends: boolean;
    title: string;
  };
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
