import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CategoryType } from '../../types/analysis';

interface UIState {
  selectedCategory: CategoryType | null;
  isAddFormOpen: boolean;
  isImportDialogOpen: boolean;
  isExportDialogOpen: boolean;
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoHide?: boolean;
  duration?: number;
}

const initialState: UIState = {
  selectedCategory: null,
  isAddFormOpen: false,
  isImportDialogOpen: false,
  isExportDialogOpen: false,
  loading: false,
  error: null,
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Управление категориями
    setSelectedCategory: (
      state,
      action: PayloadAction<CategoryType | null>
    ) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },

    // Управление диалогами
    openAddForm: (state) => {
      state.isAddFormOpen = true;
    },
    closeAddForm: (state) => {
      state.isAddFormOpen = false;
    },
    openImportDialog: (state) => {
      state.isImportDialogOpen = true;
    },
    closeImportDialog: (state) => {
      state.isImportDialogOpen = false;
    },
    openExportDialog: (state) => {
      state.isExportDialogOpen = true;
    },
    closeExportDialog: (state) => {
      state.isExportDialogOpen = false;
    },

    // Управление состоянием загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Управление темой
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Управление сайдбаром
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Управление уведомлениями
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Быстрые действия для уведомлений
    showSuccessNotification: (
      state,
      action: PayloadAction<{ title: string; message: string }>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'success',
        autoHide: true,
        duration: 5000,
      };
      state.notifications.push(notification);
    },
    showErrorNotification: (
      state,
      action: PayloadAction<{ title: string; message: string }>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'error',
        autoHide: false,
      };
      state.notifications.push(notification);
    },
    showWarningNotification: (
      state,
      action: PayloadAction<{ title: string; message: string }>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'warning',
        autoHide: true,
        duration: 7000,
      };
      state.notifications.push(notification);
    },
    showInfoNotification: (
      state,
      action: PayloadAction<{ title: string; message: string }>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'info',
        autoHide: true,
        duration: 5000,
      };
      state.notifications.push(notification);
    },

    // Сброс всего UI состояния
    resetUI: () => initialState,
  },
});

// Экспортируем действия
export const {
  setSelectedCategory,
  clearSelectedCategory,
  openAddForm,
  closeAddForm,
  openImportDialog,
  closeImportDialog,
  openExportDialog,
  closeExportDialog,
  setLoading,
  setError,
  clearError,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  addNotification,
  removeNotification,
  clearAllNotifications,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  resetUI,
} = uiSlice.actions;

export const selectSelectedCategory = (state: { ui: UIState }) =>
  state.ui.selectedCategory;
export const selectIsAddFormOpen = (state: { ui: UIState }) =>
  state.ui.isAddFormOpen;
export const selectIsImportDialogOpen = (state: { ui: UIState }) =>
  state.ui.isImportDialogOpen;
export const selectIsExportDialogOpen = (state: { ui: UIState }) =>
  state.ui.isExportDialogOpen;
export const selectUILoading = (state: { ui: UIState }) => state.ui.loading;
export const selectUIError = (state: { ui: UIState }) => state.ui.error;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) =>
  state.ui.sidebarOpen;
export const selectNotifications = (state: { ui: UIState }) =>
  state.ui.notifications;

export default uiSlice.reducer;
