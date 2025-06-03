import { useEffect } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  loadAnalysisResults,
  selectIsInitialized,
} from './store/slices/analysisSlice';
import { selectSelectedCategory } from './store/slices/uiSlice';
import { Dashboard, CategoryView } from './pages';
import { LoadingSpinner } from './components/ui';

function App() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const selectedCategory = useAppSelector(selectSelectedCategory);

  // Загружаем данные при первом рендере
  useEffect(() => {
    if (!isInitialized) {
      dispatch(loadAnalysisResults());
    }
  }, [dispatch, isInitialized]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen message="Инициализация приложения..." />;
  }

  // Простая навигация без роутера
  const getCurrentPage = () => {
    if (selectedCategory) {
      return <CategoryView />;
    }
    return <Dashboard />;
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Медицинский трекер
          </Typography>
          {selectedCategory && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {selectedCategory}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {getCurrentPage()}
    </>
  );
}

export default App;
