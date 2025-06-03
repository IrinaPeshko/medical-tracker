import type { Category } from "../types/analysis";

export const CATEGORIES: Category[] = [
  {
    id: 'blood_general',
    name: 'Общий анализ крови',
    description: 'Клинический анализ крови с лейкоцитарной формулой',
    icon: 'BloodtypeIcon',
    color: '#d32f2f',
    frequency: 'раз в 6 месяцев',
    order: 1
  },
  {
    id: 'blood_biochemistry',
    name: 'Биохимия крови',
    description: 'Биохимические показатели крови',
    icon: 'ScienceIcon',
    color: '#1976d2',
    frequency: 'раз в год',
    order: 2
  },
  {
    id: 'hormones',
    name: 'Гормональные исследования',
    description: 'Гормоны репродуктивной системы и щитовидной железы',
    icon: 'BiotechIcon',
    color: '#7b1fa2',
    frequency: 'по показаниям',
    order: 3
  },
  {
    id: 'vitamins',
    name: 'Витамины и микроэлементы',
    description: 'Содержание витаминов в крови',
    icon: 'MedicationIcon',
    color: '#388e3c',
    frequency: 'раз в год',
    order: 4
  },
  {
    id: 'gynecology',
    name: 'Гинекологические анализы',
    description: 'Инфекции, микрофлора, онкоцитология',
    icon: 'FavoriteIcon',
    color: '#e91e63',
    frequency: 'раз в год',
    order: 5
  },
  {
    id: 'ultrasound',
    name: 'УЗИ исследования',
    description: 'Ультразвуковая диагностика органов',
    icon: 'CameraAltIcon',
    color: '#0097a7',
    frequency: 'по показаниям',
    order: 6
  },
  {
    id: 'cytology',
    name: 'Цитологические исследования',
    description: 'Жидкостная цитология, PAP-тест',
    icon: 'VisibilityIcon',
    color: '#f57c00',
    frequency: 'раз в год',
    order: 7
  }
];

// Получение категории по ID
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};

// Получение категорий в порядке отображения
export const getCategoriesOrdered = (): Category[] => {
  return [...CATEGORIES].sort((a, b) => a.order - b.order);
};