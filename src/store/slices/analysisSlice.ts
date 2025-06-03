import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type {
  AnalysisResult,
  AnalysisStats,
  CategoryType,
} from '../../types/analysis';
import { DataService } from '../../services/dataService';
import { AnalysisUtils } from '../../utils/analysisUtils';

interface AnalysisState {
  results: AnalysisResult[];
  stats: AnalysisStats;
  loading: boolean;
  error: string | null;
  lastSaved: string | null;
  isInitialized: boolean;
}

const initialState: AnalysisState = {
  results: [],
  stats: {
    totalResults: 0,
    abnormalCount: 0,
    lastAnalysisDate: null,
    categoriesWithData: [],
    recentTrends: [],
  },
  loading: false,
  error: null,
  lastSaved: null,
  isInitialized: false,
};

/**
 * Загружает все результаты анализов
 */
export const loadAnalysisResults = createAsyncThunk(
  'analysis/loadResults',
  async (_, { rejectWithValue }) => {
    try {
      const results = DataService.loadAllResults();
      return results;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка при загрузке данных'
      );
    }
  }
);

/**
 * Добавляет новый результат анализа
 */
export const addAnalysisResult = createAsyncThunk(
  'analysis/addResult',
  async (
    resultData: Omit<AnalysisResult, 'id' | 'createdAt' | 'isHistorical'>,
    { rejectWithValue }
  ) => {
    try {
      const newResult = DataService.addResult(resultData);
      return newResult;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка при добавлении результата'
      );
    }
  }
);

/**
 * Обновляет существующий результат
 */
export const updateAnalysisResult = createAsyncThunk(
  'analysis/updateResult',
  async (
    { id, updates }: { id: string; updates: Partial<AnalysisResult> },
    { rejectWithValue }
  ) => {
    try {
      const updatedResult = DataService.updateResult(id, updates);
      if (!updatedResult) {
        throw new Error('Результат не найден или не может быть обновлен');
      }
      return updatedResult;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении результата'
      );
    }
  }
);

/**
 * Удаляет результат анализа
 */
export const deleteAnalysisResult = createAsyncThunk(
  'analysis/deleteResult',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = DataService.deleteResult(id);
      if (!success) {
        throw new Error('Результат не найден или не может быть удален');
      }
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Ошибка при удалении результата'
      );
    }
  }
);

/**
 * Импортирует данные из JSON
 */
export const importAnalysisData = createAsyncThunk(
  'analysis/importData',
  async (
    {
      jsonData,
      mergeWithExisting,
    }: { jsonData: string; mergeWithExisting: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await DataService.importData(jsonData, mergeWithExisting);
      if (!result.success) {
        throw new Error(
          `Импорт завершен с ошибками: ${result.errors.join(', ')}`
        );
      }
      // Перезагружаем все данные после импорта
      const allResults = DataService.loadAllResults();
      return { importResult: result, allResults };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка при импорте данных'
      );
    }
  }
);

/**
 * Очищает пользовательские данные
 */
export const clearUserData = createAsyncThunk(
  'analysis/clearUserData',
  async (_, { rejectWithValue }) => {
    try {
      DataService.clearUserData();
      // Загружаем только исторические данные
      const historicalResults = DataService.loadHistoricalResults();
      return historicalResults;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Ошибка при очистке данных'
      );
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    // Синхронные действия
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state) => {
      state.stats = AnalysisUtils.getAnalysisStats(state.results, 'female');
    },
    setLastSaved: (state, action: PayloadAction<string>) => {
      state.lastSaved = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Загрузка результатов
    builder
      .addCase(loadAnalysisResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAnalysisResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.stats = AnalysisUtils.getAnalysisStats(action.payload, 'female');
        state.isInitialized = true;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(loadAnalysisResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      });

    // Добавление результата
    builder
      .addCase(addAnalysisResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAnalysisResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results.push(action.payload);
        // Пересортировываем по дате
        state.results.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        state.stats = AnalysisUtils.getAnalysisStats(state.results, 'female');
        state.lastSaved = new Date().toISOString();
      })
      .addCase(addAnalysisResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Обновление результата
    builder
      .addCase(updateAnalysisResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnalysisResult.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.results.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.results[index] = action.payload;
          state.stats = AnalysisUtils.getAnalysisStats(state.results, 'female');
          state.lastSaved = new Date().toISOString();
        }
      })
      .addCase(updateAnalysisResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Удаление результата
    builder
      .addCase(deleteAnalysisResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAnalysisResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results = state.results.filter((r) => r.id !== action.payload);
        state.stats = AnalysisUtils.getAnalysisStats(state.results, 'female');
        state.lastSaved = new Date().toISOString();
      })
      .addCase(deleteAnalysisResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Импорт данных
    builder
      .addCase(importAnalysisData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importAnalysisData.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.allResults;
        state.stats = AnalysisUtils.getAnalysisStats(state.results, 'female');
        state.lastSaved = new Date().toISOString();
      })
      .addCase(importAnalysisData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Очистка пользовательских данных
    builder
      .addCase(clearUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.stats = AnalysisUtils.getAnalysisStats(state.results, 'female');
        state.lastSaved = new Date().toISOString();
      })
      .addCase(clearUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateStats, setLastSaved } = analysisSlice.actions;

export const selectAnalysisResults = (state: { analysis: AnalysisState }) =>
  state.analysis.results;

export const selectAnalysisStats = (state: { analysis: AnalysisState }) =>
  state.analysis.stats;

export const selectAnalysisLoading = (state: { analysis: AnalysisState }) =>
  state.analysis.loading;

export const selectAnalysisError = (state: { analysis: AnalysisState }) =>
  state.analysis.error;

export const selectIsInitialized = (state: { analysis: AnalysisState }) =>
  state.analysis.isInitialized;

export const selectLastSaved = (state: { analysis: AnalysisState }) =>
  state.analysis.lastSaved;

export const selectResultsByCategory =
  (category: CategoryType) => (state: { analysis: AnalysisState }) =>
    state.analysis.results.filter((result) => result.categoryId === category);

export const selectResultsByParameter =
  (parameterId: string) => (state: { analysis: AnalysisState }) =>
    AnalysisUtils.getResultsForParameter(state.analysis.results, parameterId);

export const selectLatestResult =
  (parameterId: string) => (state: { analysis: AnalysisState }) =>
    AnalysisUtils.getLatestResult(state.analysis.results, parameterId);

export const selectChartData =
  (parameterId: string) => (state: { analysis: AnalysisState }) =>
    AnalysisUtils.getChartData(state.analysis.results, parameterId, 'female');

export default analysisSlice.reducer;
