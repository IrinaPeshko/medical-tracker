import type { Parameter } from '../types/analysis';

export const PARAMETERS: Parameter[] = [
  // ===== ОБЩИЙ АНАЛИЗ КРОВИ =====
  {
    id: 'wbc',
    name: 'Лейкоциты (WBC)',
    unit: 'x10^9/л',
    normalRange: { min: 4.0, max: 9.0 },
    category: 'blood_general',
    importance: 'high',
    isNumeric: true,
  },
  {
    id: 'rbc',
    name: 'Эритроциты (RBC)',
    unit: 'x10^12/л',
    normalRange: {
      femaleRange: { min: 3.7, max: 4.7 },
      maleRange: { min: 4.0, max: 5.1 },
    },
    category: 'blood_general',
    importance: 'high',
    isNumeric: true,
  },
  {
    id: 'hgb',
    name: 'Гемоглобин (HGB)',
    unit: 'г/л',
    normalRange: {
      femaleRange: { min: 120, max: 150 },
      maleRange: { min: 130, max: 170 },
    },
    category: 'blood_general',
    importance: 'high',
    isNumeric: true,
  },
  {
    id: 'hct',
    name: 'Гематокрит (HCT)',
    unit: '%',
    normalRange: {
      femaleRange: { min: 33, max: 46 },
      maleRange: { min: 39, max: 49 },
    },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'mcv',
    name: 'Средний объем эритроцита (MCV)',
    unit: 'фл',
    normalRange: { min: 78, max: 98 },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'mch',
    name: 'Среднее содержание гемоглобина (MCH)',
    unit: 'пг',
    normalRange: { min: 27, max: 32 },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'mchc',
    name: 'Средняя концентрация гемоглобина (MCHC)',
    unit: 'г/л',
    normalRange: { min: 320, max: 360 },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'rdw_cv',
    name: 'Ширина распределения эритроцитов (RDW-CV)',
    unit: '%',
    normalRange: { min: 11.5, max: 14.5 },
    category: 'blood_general',
    importance: 'low',
    isNumeric: true,
  },
  {
    id: 'plt',
    name: 'Тромбоциты (PLT)',
    unit: 'x10^9/л',
    normalRange: { min: 150, max: 450 },
    category: 'blood_general',
    importance: 'high',
    isNumeric: true,
  },
  {
    id: 'esr',
    name: 'Скорость оседания эритроцитов (СОЭ)',
    unit: 'мм/час',
    normalRange: {
      femaleRange: { min: 2, max: 15 },
      maleRange: { min: 2, max: 10 },
    },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },

  // Лейкоцитарная формула
  {
    id: 'neutrophils_abs',
    name: 'Нейтрофилы (абс.)',
    unit: 'x10^9/л',
    normalRange: { min: 1.7, max: 7.7 },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'lymphocytes_abs',
    name: 'Лимфоциты (абс.)',
    unit: 'x10^9/л',
    normalRange: { min: 1.2, max: 3.5 },
    category: 'blood_general',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'monocytes_abs',
    name: 'Моноциты (абс.)',
    unit: 'x10^9/л',
    normalRange: { min: 0.09, max: 0.6 },
    category: 'blood_general',
    importance: 'low',
    isNumeric: true,
  },
  {
    id: 'eosinophils_abs',
    name: 'Эозинофилы (абс.)',
    unit: 'x10^9/л',
    normalRange: { min: 0.04, max: 0.35 },
    category: 'blood_general',
    importance: 'low',
    isNumeric: true,
  },

  // ===== БИОХИМИЯ КРОВИ =====
  {
    id: 'glucose',
    name: 'Глюкоза',
    unit: 'ммоль/л',
    normalRange: { min: 3.8, max: 6.1 },
    category: 'blood_biochemistry',
    importance: 'high',
    isNumeric: true,
  },
  {
    id: 'ferritin',
    name: 'Ферритин',
    unit: 'мкг/л',
    normalRange: {
      femaleRange: { min: 5.5, max: 94.0 },
      maleRange: { min: 12, max: 300 },
    },
    category: 'blood_biochemistry',
    importance: 'high',
    isNumeric: true,
  },

  // ===== ГОРМОНЫ =====
  {
    id: 'dhea_s',
    name: 'Дегидроэпиандростерон-сульфат (ДГЭА-С)',
    unit: 'мкг/дл',
    normalRange: { femaleRange: { min: 18.0, max: 391.0 } },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'oh_progesterone',
    name: '17-гидроксипрогестерон',
    unit: 'нг/мл',
    normalRange: { min: 0.1, max: 0.8, cycleDependent: true },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'ttg',
    name: 'Тиреотропный гормон (ТТГ)',
    unit: 'мЕд/л',
    normalRange: { min: 0.4, max: 4.0 },
    category: 'hormones',
    importance: 'high',
    isNumeric: true,
  },
  {
    id: 'prolactin',
    name: 'Пролактин',
    unit: 'нг/мл',
    normalRange: { femaleRange: { min: 4.8, max: 23.3 }, cycleDependent: true },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'lh',
    name: 'Лютеинизирующий гормон (ЛГ)',
    unit: 'мЕд/мл',
    normalRange: { femaleRange: { min: 2.4, max: 12.6 }, cycleDependent: true },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'fsh',
    name: 'Фолликулостимулирующий гормон (ФСГ)',
    unit: 'мЕд/мл',
    normalRange: { femaleRange: { min: 3.5, max: 12.5 }, cycleDependent: true },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'estradiol',
    name: 'Эстрадиол',
    unit: 'пг/мл',
    normalRange: { femaleRange: { min: 12.5, max: 166 }, cycleDependent: true },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'testosterone_total',
    name: 'Общий тестостерон',
    unit: 'нг/мл',
    normalRange: { femaleRange: { min: 0.06, max: 0.82 } },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'androstenedione',
    name: 'Андростендион',
    unit: 'нг/мл',
    normalRange: { femaleRange: { min: 0.7, max: 2.7 } },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'shbg',
    name: 'Глобулин, связывающий половые гормоны (ГСПГ)',
    unit: 'нмоль/л',
    normalRange: { femaleRange: { min: 26.1, max: 110 } },
    category: 'hormones',
    importance: 'medium',
    isNumeric: true,
  },
  {
    id: 'amh',
    name: 'Антимюллеров гормон (АМГ)',
    unit: 'нг/мл',
    normalRange: { femaleRange: { min: 1.0, max: 2.5 } },
    category: 'hormones',
    importance: 'high',
    isNumeric: true,
  },

  // ===== ВИТАМИНЫ =====
  {
    id: 'vitamin_d',
    name: 'Витамин D общий',
    unit: 'нг/мл',
    normalRange: {
      min: 30,
      max: 100,
      reference:
        '<20 - дефицит; 20-29 - недостаточность; 30-100 - оптимальный уровень',
    },
    category: 'vitamins',
    importance: 'high',
    isNumeric: true,
  },

  // ===== ГИНЕКОЛОГИЧЕСКИЕ АНАЛИЗЫ =====
  {
    id: 'hpv_test',
    name: 'Анализ на ВПЧ инфекции',
    unit: '',
    normalRange: { reference: 'не обнаружено' },
    category: 'gynecology',
    importance: 'high',
    isNumeric: false,
  },
  {
    id: 'femoflor_screen',
    name: 'Фемофлор скрин',
    unit: '',
    normalRange: { reference: 'нормоценоз' },
    category: 'gynecology',
    importance: 'medium',
    isNumeric: false,
  },

  // ===== ЦИТОЛОГИЯ =====
  {
    id: 'liquid_cytology',
    name: 'Жидкостная цитология',
    unit: '',
    normalRange: { reference: 'NILM (норма)' },
    category: 'cytology',
    importance: 'high',
    isNumeric: false,
  },
];

// Получение параметра по ID
export const getParameterById = (id: string): Parameter | undefined => {
  return PARAMETERS.find((param) => param.id === id);
};

// Получение параметров по категории
export const getParametersByCategory = (categoryId: string): Parameter[] => {
  return PARAMETERS.filter((param) => param.category === categoryId);
};
