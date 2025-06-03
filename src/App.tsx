import { useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from './store/hooks';
import { 
  loadAnalysisResults, 
  selectAnalysisStats, 
  selectAnalysisLoading, 
  selectAnalysisError,
  selectIsInitialized,
  selectAnalysisResults,
} from './store/slices/analysisSlice';
import { CATEGORIES, PARAMETERS } from './config';
import { StatCard, CategoryCard, LoadingSpinner, ErrorAlert } from './components/ui';
import { AnalysisUtils } from './utils/analysisUtils';

function App() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAnalysisStats);
  const results = useAppSelector(selectAnalysisResults);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);
  const isInitialized = useAppSelector(selectIsInitialized);

  // Загружаем данные при первом рендере
  useEffect(() => {
    if (!isInitialized) {
      dispatch(loadAnalysisResults());
    }
  }, [dispatch, isInitialized]);

  const handleRetry = () => {
    dispatch(loadAnalysisResults());
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log('Clicked category:', categoryId);
    // TODO: Навигация к странице категории
  };

  if (loading && !isInitialized) {
    return <LoadingSpinner fullScreen message="Загрузка данных анализов..." />;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Медицинский трекер
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <ErrorAlert 
            error={error} 
            onRetry={handleRetry}
            title="Ошибка загрузки данных"
          />
        )}

        {/* Статистика */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard 
              title="Всего анализов"
              value={stats.totalResults}
              icon={<TrendingUpIcon />}
              color="#1976d2"
              description="результатов в базе данных"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard 
              title="Отклонения"
              value={stats.abnormalCount}
              icon={<WarningIcon />}
              color="#f44336"
              description="показателей вне нормы"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard 
              title="Последний анализ"
              value={stats.lastAnalysisDate || 'Нет данных'}
              icon={<CalendarIcon />}
              color="#4caf50"
              description="дата последнего результата"
            />
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Категории анализов
        </Typography>
        
        <Grid container spacing={3}>
          {CATEGORIES.map(category => {
            const categoryResults = results.filter(r => r.categoryId === category.id);
            const categoryResultsCount = categoryResults.length;
            
            const abnormalInCategory = PARAMETERS
              .filter(p => p.category === category.id)
              .reduce((count, param) => {
                const latest = AnalysisUtils.getLatestResult(results, param.id);
                if (latest && AnalysisUtils.checkNormal(latest.value, param.id, 'female') !== 'normal') {
                  return count + 1;
                }
                return count;
              }, 0);

            const lastResult = categoryResults
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
                <CategoryCard
                  category={category}
                  resultCount={categoryResultsCount}
                  abnormalCount={abnormalInCategory}
                  lastResultDate={lastResult?.date}
                  onClick={handleCategoryClick}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Сообщение об отсутствии данных */}
        {results.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h4" gutterBottom sx={{ opacity: 0.6 }}>
              📊
            </Typography>
            <Typography variant="h6" gutterBottom>
              Пока нет результатов анализов
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Добавьте первый результат, чтобы начать отслеживать свое здоровье
            </Typography>
          </Box>
        )}

        {/* Отладочная информация */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Debug: Redux работает ✅ | Загружено {results.length} результатов | 
            Исторических: {results.filter(r => r.isHistorical).length} | 
            Пользовательских: {results.filter(r => !r.isHistorical).length}
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default App;