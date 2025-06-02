
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Здесь будут мои слайсы
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;