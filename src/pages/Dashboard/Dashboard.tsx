import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  Fab,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectAnalysisStats,
  selectAnalysisResults,
  selectAnalysisLoading,
  selectAnalysisError,
} from '../../store/slices/analysisSlice';
import {
  setSelectedCategory,
  openAddForm,
  openImportDialog,
  openExportDialog,
} from '../../store/slices/uiSlice';
import { CATEGORIES, PARAMETERS } from '../../config';
import {
  StatCard,
  CategoryCard,
  LoadingSpinner,
  ErrorAlert,
} from '../../components/ui';
import { AnalysisUtils } from '../../utils/analysisUtils';
import type { CategoryType } from '../../types/analysis';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAnalysisStats);
  const results = useAppSelector(selectAnalysisResults);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);

  const handleCategoryClick = (categoryId: CategoryType) => {
    dispatch(setSelectedCategory(categoryId));
  };

  const handleAddResult = () => {
    dispatch(openAddForm());
  };

  const handleImport = () => {
    dispatch(openImportDialog());
  };

  const handleExport = () => {
    dispatch(openExportDialog());
  };

  // Получаем рекомендации для пользователя
  const getRecommendations = () => {
    const recommendations = [];

    // Проверяем давность последних анализов
    if (stats.lastAnalysisDate) {
      const lastDate = new Date(stats.lastAnalysisDate);
      const daysSinceLastAnalysis = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastAnalysis > 180) {
        recommendations.push({
          type: 'warning' as const,
          title: 'Давно не было анализов',
          message: `Последний анализ был ${daysSinceLastAnalysis} дней назад. Рекомендуем пройти базовое обследование.`,
        });
      }
    }

    // Проверяем отклонения
    if (stats.abnormalCount > 0) {
      recommendations.push({
        type: 'error' as const,
        title: 'Есть отклонения от нормы',
        message: `${stats.abnormalCount} показателей вне нормальных значений. Обратитесь к врачу.`,
      });
    }

    // Проверяем витамин D (если есть данные)
    const vitaminDResult = AnalysisUtils.getLatestResult(results, 'vitamin_d');
    if (
      vitaminDResult &&
      typeof vitaminDResult.value === 'number' &&
      vitaminDResult.value < 30
    ) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Низкий уровень витамина D',
        message:
          'Рассмотрите возможность приема добавок витамина D и больше времени на солнце.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  if (loading) {
    return <LoadingSpinner fullScreen message="Загрузка данных анализов..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок страницы */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Медицинский трекер
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Отслеживайте свое здоровье с помощью анализов
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={handleImport}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Импорт
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Экспорт
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddResult}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Добавить результат
          </Button>
        </Box>
      </Box>

      {/* Ошибки */}
      {error && (
        <ErrorAlert
          error={error}
          title="Ошибка загрузки данных"
          sx={{ mb: 3 }}
        />
      )}

      {/* Рекомендации */}
      {recommendations.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Рекомендации
          </Typography>
          {recommendations.map((rec, index) => (
            <Alert
              key={index}
              severity={rec.type}
              sx={{ mb: 1 }}
              variant="outlined"
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {rec.title}
              </Typography>
              {rec.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Всего анализов"
            value={stats.totalResults}
            icon={<TrendingUpIcon />}
            color="#1976d2"
            description="результатов в базе данных"
            onClick={() => console.log('Показать все результаты')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Отклонения"
            value={stats.abnormalCount}
            icon={<WarningIcon />}
            color="#f44336"
            description="показателей вне нормы"
            onClick={() => console.log('Показать отклонения')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Последний анализ"
            value={stats.lastAnalysisDate || 'Нет данных'}
            icon={<CalendarIcon />}
            color="#4caf50"
            description="дата последнего результата"
          />
        </Grid>
      </Grid>

      {/* Категории анализов */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Категории анализов
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Выберите категорию для просмотра детальной информации
        </Typography>

        <Grid container spacing={3}>
          {CATEGORIES.map((category) => {
            const categoryResults = results.filter(
              (r) => r.categoryId === category.id
            );
            const categoryResultsCount = categoryResults.length;

            const abnormalInCategory = PARAMETERS.filter(
              (p) => p.category === category.id
            ).reduce((count, param) => {
              const latest = AnalysisUtils.getLatestResult(results, param.id);
              if (
                latest &&
                AnalysisUtils.checkNormal(latest.value, param.id, 'female') !==
                  'normal'
              ) {
                return count + 1;
              }
              return count;
            }, 0);

            const lastResult = categoryResults.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];

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
      </Box>

      {/* Быстрые действия */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddResult}
              sx={{ py: 1.5 }}
            >
              Добавить результат
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ImportIcon />}
              onClick={handleImport}
              sx={{ py: 1.5 }}
            >
              Импорт данных
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ExportIcon />}
              onClick={handleExport}
              sx={{ py: 1.5 }}
            >
              Экспорт данных
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CalendarIcon />}
              onClick={() => console.log('Календарь анализов')}
              sx={{ py: 1.5 }}
            >
              Календарь
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Сообщение об отсутствии данных */}
      {results.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ opacity: 0.6 }}>
            📊
          </Typography>
          <Typography variant="h6" gutterBottom>
            Добро пожаловать в медицинский трекер!
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Начните отслеживать свое здоровье, добавив первый результат анализа.
            Это поможет вам контролировать важные показатели и отслеживать
            динамику.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleAddResult}
            sx={{ mt: 2 }}
          >
            Добавить первый результат
          </Button>
        </Paper>
      )}

      {/* FAB для мобильных устройств */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddResult}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { sm: 'none' },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Отладочная информация (только в dev режиме) */}
      {process.env.NODE_ENV === 'development' && (
        <Paper sx={{ p: 2, mt: 4, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="textSecondary">
            Debug: Загружено {results.length} результатов | Исторических:{' '}
            {results.filter((r) => r.isHistorical).length} | Пользовательских:{' '}
            {results.filter((r) => !r.isHistorical).length} | Категорий с
            данными: {stats.categoriesWithData.length}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
