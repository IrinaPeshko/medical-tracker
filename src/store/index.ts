import { configureStore } from '@reduxjs/toolkit';

import analysisReducer from './slices/analysisSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем эти action types в проверке сериализации
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// TypeScript типы для store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
