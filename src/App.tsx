import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  loadAnalysisResults,
  selectIsInitialized,
} from './store/slices/analysisSlice';
import { AppRouter } from './router/AppRouter';
import { LoadingSpinner } from './components/ui';

function App() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);

  // Загружаем данные при первом рендере
  useEffect(() => {
    if (!isInitialized) {
      dispatch(loadAnalysisResults());
    }
  }, [dispatch, isInitialized]);

  // Показываем загрузку пока данные не инициализированы
  if (!isInitialized) {
    return <LoadingSpinner fullScreen message="Инициализация приложения..." />;
  }

  return <AppRouter />;
}

export default App;
