import type { AnalysisResult, HistoricalDataSet } from '../types';

export const HISTORICAL_DATA: HistoricalDataSet = {
  patientInfo: {
    name: 'Ирина Н.',
    birthDate: '1999-11-11',
    gender: 'female',
  },
  lastUpdated: '2025-06-03',
  results: [
    // Ферритин от 02.06.2025
    {
      id: 'ferritin_2025_06_02',
      categoryId: 'blood_biochemistry',
      parameterId: 'ferritin',
      value: 28.6,
      unit: 'мкг/л',
      date: '2025-06-02',
      notes: 'Фолликулярная фаза цикла',
      isHistorical: true,
    },

    // Общий анализ крови от 02.06.2025
    {
      id: 'wbc_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'wbc',
      value: 5.3,
      unit: 'x10^9/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'rbc_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'rbc',
      value: 4.63,
      unit: 'x10^12/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'hgb_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'hgb',
      value: 136,
      unit: 'г/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'hct_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'hct',
      value: 40.8,
      unit: '%',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'mcv_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'mcv',
      value: 88.1,
      unit: 'фл',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'mch_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'mch',
      value: 29.4,
      unit: 'пг',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'mchc_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'mchc',
      value: 333,
      unit: 'г/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'rdw_cv_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'rdw_cv',
      value: 12.5,
      unit: '%',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'plt_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'plt',
      value: 256.0,
      unit: 'x10^9/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'esr_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'esr',
      value: 17,
      unit: 'мм/час',
      date: '2025-06-02',
      notes: 'Немного выше нормы',
      isHistorical: true,
    },
    {
      id: 'neutrophils_abs_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'neutrophils_abs',
      value: 2.6,
      unit: 'x10^9/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'lymphocytes_abs_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'lymphocytes_abs',
      value: 1.9,
      unit: 'x10^9/л',
      date: '2025-06-02',
      isHistorical: true,
    },
    {
      id: 'monocytes_abs_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'monocytes_abs',
      value: 0.69,
      unit: 'x10^9/л',
      date: '2025-06-02',
      notes: 'Немного выше нормы',
      isHistorical: true,
    },
    {
      id: 'eosinophils_abs_2025_06_02',
      categoryId: 'blood_general',
      parameterId: 'eosinophils_abs',
      value: 0.13,
      unit: 'x10^9/л',
      date: '2025-06-02',
      isHistorical: true,
    },

    // Витамин D от 02.06.2025
    {
      id: 'vitamin_d_2025_06_02',
      categoryId: 'vitamins',
      parameterId: 'vitamin_d',
      value: 18.7,
      unit: 'нг/мл',
      date: '2025-06-02',
      notes: 'Недостаточность витамина D',
      isHistorical: true,
    },

    // Гормоны от 03.06.2025
    {
      id: 'dhea_s_2025_06_03',
      categoryId: 'hormones',
      parameterId: 'dhea_s',
      value: 237.2,
      unit: 'мкг/дл',
      date: '2025-06-03',
      notes: 'Фолликулярная фаза цикла',
      isHistorical: true,
    },
    {
      id: 'oh_progesterone_2025_06_03',
      categoryId: 'hormones',
      parameterId: 'oh_progesterone',
      value: 1.12,
      unit: 'нг/мл',
      date: '2025-06-03',
      notes: 'Немного выше нормы, фолликулярная фаза',
      isHistorical: true,
    },

    // Глюкоза от 02.06.2025
    {
      id: 'glucose_2025_06_02',
      categoryId: 'blood_biochemistry',
      parameterId: 'glucose',
      value: 4.46,
      unit: 'ммоль/л',
      date: '2025-06-02',
      isHistorical: true,
    },
  ],
};

// Функция для получения исторических данных
export const getHistoricalData = (): HistoricalDataSet => {
  return HISTORICAL_DATA;
};

// Функция для добавления новых исторических данных
export const addHistoricalResult = (
  newResult: Omit<AnalysisResult, 'id' | 'isHistorical'>
) => {
  const result: AnalysisResult = {
    ...newResult,
    id: `${newResult.parameterId}_${newResult.date.replace(/-/g, '_')}`,
    isHistorical: true,
  };

  HISTORICAL_DATA.results.push(result);
  HISTORICAL_DATA.lastUpdated = new Date().toISOString().split('T')[0];

  return result;
};
