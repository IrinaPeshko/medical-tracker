// Типы для UI компонентов и состояния интерфейса

import type { TooltipProps } from 'recharts';
import type { CategoryType, ChartDataPoint } from './analysis';
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

// Состояние UI приложения
export interface UIState {
  selectedCategory: CategoryType | null;
  isAddFormOpen: boolean;
  isImportDialogOpen: boolean;
  isExportDialogOpen: boolean;
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// Опции для форм
export interface FormData {
  parameterId: string;
  value: string;
  date: string;
  notes: string;
}

// Пропсы для компонентов
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

export interface CategoryCardProps {
  categoryId: CategoryType;
  resultCount: number;
  abnormalCount: number;
  lastResultDate?: string;
  onClick: (categoryId: CategoryType) => void;
}

export interface ParameterCardProps {
  parameterId: string;
  showChart?: boolean;
  compact?: boolean;
}

// Настройки приложения
export interface AppSettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  language: 'ru' | 'en';
  notifications: {
    enabled: boolean;
    reminderDays: number[];
  };
  export: {
    includeNotes: boolean;
    includeCharts: boolean;
  };
}

// Фильтры для анализов
export interface AnalysisFilters {
  categories: CategoryType[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  onlyAbnormal: boolean;
  parameterId?: string;
}

// Опции сортировки
export interface SortOptions {
  field: 'date' | 'value' | 'parameter';
  direction: 'asc' | 'desc';
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  payload: ChartDataPoint;
}

// Типизированные пропсы для CustomTooltip
export interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}
