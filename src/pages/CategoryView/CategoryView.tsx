import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectAnalysisResults,
  selectAnalysisLoading,
  selectAnalysisError,
} from '../../store/slices/analysisSlice';
import {
  selectSelectedCategory,
  clearSelectedCategory,
  openAddForm,
} from '../../store/slices/uiSlice';
import { CATEGORIES, PARAMETERS } from '../../config';
import { ParameterCard, LoadingSpinner, ErrorAlert } from '../../components/ui';
import type { AnalysisResult } from '../../types';

export const CategoryView: React.FC = () => {
  const dispatch = useAppDispatch();
  const results = useAppSelector(selectAnalysisResults);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);
  const selectedCategoryId = useAppSelector(selectSelectedCategory);

  const category = CATEGORIES.find((c) => c.id === selectedCategoryId);
  const categoryParameters = PARAMETERS.filter(
    (p) => p.category === selectedCategoryId
  );

  const handleBackToDashboard = () => {
    dispatch(clearSelectedCategory());
  };

  const handleAddResult = () => {
    dispatch(openAddForm());
  };

  const handleResultClick = (result: AnalysisResult) => {
    console.log('Clicked result:', result);
    // TODO: Открыть модал с деталями результата
  };

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorAlert
          error="Категория не найдена"
          title="Ошибка"
          onRetry={handleBackToDashboard}
          retryText="Вернуться на главную"
        />
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Загрузка данных категории..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Навигация */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleBackToDashboard}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Главная
          </Link>
          <Typography variant="body2" color="text.primary">
            {category.name}
          </Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={handleBackToDashboard}
              sx={{ mr: 1, display: { sm: 'none' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {category.name}
              </Typography>
              {category.description && (
                <Typography variant="body1" color="textSecondary">
                  {category.description}
                </Typography>
              )}
            </Box>
          </Box>

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

      {/* Параметры категории */}
      {categoryParameters.length > 0 ? (
        <Grid container spacing={3}>
          {categoryParameters.map((parameter) => (
            <Grid size={{ xs: 12 }} key={parameter.id}>
              <ParameterCard
                parameter={parameter}
                results={results}
                showChart={true}
                compact={false}
                onResultClick={handleResultClick}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" gutterBottom>
            В этой категории пока нет параметров
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Параметры для этой категории будут добавлены в будущих версиях
            приложения.
          </Typography>
          <Button variant="outlined" onClick={handleBackToDashboard}>
            Вернуться на главную
          </Button>
        </Box>
      )}

      {/* Дополнительная информация о категории */}
      {categoryParameters.length > 0 && (
        <Box mt={4} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            О категории "{category.name}"
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Параметров в категории
              </Typography>
              <Typography variant="h6">{categoryParameters.length}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Результатов в базе
              </Typography>
              <Typography variant="h6">
                {results.filter((r) => r.categoryId === category.id).length}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Рекомендуемая частота
              </Typography>
              <Typography variant="h6">
                {category.frequency || 'По показаниям'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Последний анализ
              </Typography>
              <Typography variant="h6">
                {(() => {
                  const categoryResults = results.filter(
                    (r) => r.categoryId === category.id
                  );
                  const lastResult = categoryResults.sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];
                  return lastResult
                    ? new Date(lastResult.date).toLocaleDateString('ru-RU')
                    : 'Нет данных';
                })()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
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
    </Container>
  );
};
