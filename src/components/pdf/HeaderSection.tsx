import { Text, View } from '@react-pdf/renderer';
import { styles } from './styles';

// Компонент заголовка
export const HeaderSection: React.FC<{ title: string }> = ({ title }) => (
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
