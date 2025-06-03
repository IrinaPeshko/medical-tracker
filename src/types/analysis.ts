// Основные типы для медицинских анализов

// Типы категорий анализов
export type CategoryType = 
  | 'blood_general'      // Общий анализ крови
  | 'blood_biochemistry' // Биохимия крови
  | 'hormones'          // Гормональные исследования
  | 'vitamins'          // Витамины
  | 'gynecology'        // Гинекологические анализы
  | 'ultrasound'        // УЗИ исследования
  | 'cytology';         // Цитологические исследования

// Статус результата относительно нормы
export type NormalStatus = 'normal' | 'high' | 'low' | 'attention';

// Результат анализа
export interface AnalysisResult {
  id: string;
  categoryId: CategoryType;
  parameterId: string;
  value: number | string; // Может быть числом или текстом ("не обнаружено")
  unit: string;
  date: string; // ISO строка даты (YYYY-MM-DD)
  notes?: string;
  createdAt?: string; // Когда добавлен в систему
  updatedAt?: string; // Когда последний раз изменен
  isHistorical?: boolean; // Захардкоженные исторические данные
}

// Параметр анализа
export interface Parameter {
  id: string;
  name: string;
  shortName?: string;
  unit: string;
  normalRange: NormalRange;
  category: CategoryType;
  description?: string;
  importance?: 'low' | 'medium' | 'high';
  isNumeric: boolean; // Числовой или текстовый показатель
}

// Диапазон нормальных значений
export interface NormalRange {
  min?: number;
  max?: number;
  reference?: string; // Для качественных показателей
  femaleRange?: { min?: number; max?: number }; // Для женщин
  maleRange?: { min?: number; max?: number };   // Для мужчин
  ageDependent?: boolean;
  cycleDependent?: boolean; // Зависит от фазы цикла
}

// Интерфейс категории анализов
export interface Category {
  id: CategoryType;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency?: string; // Рекомендуемая частота
  order: number; // Порядок отображения
}

// Данные для графика
export interface ChartDataPoint {
  date: string;
  value: number;
  fullDate: string;
  status?: NormalStatus;
  notes?: string;
}

// Статистика по анализам
export interface AnalysisStats {
  totalResults: number;
  abnormalCount: number;
  lastAnalysisDate: string | null;
  categoriesWithData: CategoryType[];
  recentTrends: {
    parameterId: string;
    trend: 'improving' | 'worsening' | 'stable';
  }[];
}

// Исторические данные (для захардкоженных результатов)
export interface HistoricalDataSet {
  patientInfo: {
    name: string;
    birthDate: string;
    gender: 'female' | 'male';
  };
  results: AnalysisResult[];
  lastUpdated: string;
}