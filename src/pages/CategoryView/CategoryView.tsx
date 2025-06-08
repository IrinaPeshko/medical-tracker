import { useEffect, useState } from 'react';
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
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Home as HomeIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectAnalysisResults,
  selectAnalysisLoading,
  selectAnalysisError,
} from '../../store/slices/analysisSlice';
import { openAddForm, setSelectedCategory } from '../../store/slices/uiSlice';
import { CATEGORIES, PARAMETERS } from '../../config';
import { ParameterCard, LoadingSpinner, ErrorAlert } from '../../components/ui';
import {
  CategoryFilters,
  type CategoryFilters as CategoryFiltersType,
} from '../../components/analysis';
import type { AnalysisResult, Parameter } from '../../types';
import { useNavigation } from '../../hooks';
import { AnalysisUtils } from '../../utils';

export const CategoryView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentCategoryId, goToDashboard } = useNavigation();
  const results = useAppSelector(selectAnalysisResults);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);

  const [filters, setFilters] = useState<CategoryFiltersType>({
    dateRange: { start: null, end: null },
    selectedParameters: [],
    onlyAbnormal: false,
    sortBy: 'date',
    sortOrder: 'desc',
    searchQuery: '',
  });

  const category = CATEGORIES.find((c) => c.id === currentCategoryId);
  const categoryParameters = PARAMETERS.filter(
    (p) => p.category === currentCategoryId
  );

  useEffect(() => {
    if (currentCategoryId) {
      dispatch(setSelectedCategory(currentCategoryId));
    }
  }, [currentCategoryId, dispatch]);

  const handleBackToDashboard = () => {
    goToDashboard();
  };

  const handleAddResult = () => {
    dispatch(openAddForm());
  };

  const handleResultClick = (result: AnalysisResult) => {
    console.log('Clicked result:', result);
    // TODO: Открыть модал с деталями результата
  };

  const handleFiltersChange = (newFilters: CategoryFiltersType) => {
    setFilters(newFilters);
  };

  // Применяем фильтры к параметрам
  const getFilteredParameters = (): Parameter[] => {
    let filtered = [...categoryParameters];

    // Фильтр по поисковому запросу
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((param) =>
        param.name.toLowerCase().includes(query)
      );
    }

    // Фильтр по выбранным параметрам
    if (filters.selectedParameters.length > 0) {
      filtered = filtered.filter((param) =>
        filters.selectedParameters.includes(param.id)
      );
    }

    // Фильтр "только отклонения"
    if (filters.onlyAbnormal) {
      filtered = filtered.filter((param) => {
        const latest = AnalysisUtils.getLatestResult(results, param.id);
        return (
          latest &&
          AnalysisUtils.checkNormal(latest.value, param.id, 'female') !==
            'normal'
        );
      });
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'parameter': {
          const nameComparison = a.name.localeCompare(b.name, 'ru');
          return filters.sortOrder === 'asc' ? nameComparison : -nameComparison;
        }

        case 'value': {
          const latestA = AnalysisUtils.getLatestResult(results, a.id);
          const latestB = AnalysisUtils.getLatestResult(results, b.id);

          if (!latestA && !latestB) return 0;
          if (!latestA) return 1;
          if (!latestB) return -1;

          const valueA = typeof latestA.value === 'number' ? latestA.value : 0;
          const valueB = typeof latestB.value === 'number' ? latestB.value : 0;

          const valueComparison = valueA - valueB;
          return filters.sortOrder === 'asc'
            ? valueComparison
            : -valueComparison;
        }

        case 'date':
        default: {
          const latestA = AnalysisUtils.getLatestResult(results, a.id);
          const latestB = AnalysisUtils.getLatestResult(results, b.id);

          if (!latestA && !latestB) return 0;
          if (!latestA) return 1;
          if (!latestB) return -1;

          const dateComparison =
            new Date(latestA.date).getTime() - new Date(latestB.date).getTime();
          return filters.sortOrder === 'asc' ? dateComparison : -dateComparison;
        }
      }
    });

    return filtered;
  };

  // Фильтруем результаты по дате если задан диапазон
  const getFilteredResults = (): AnalysisResult[] => {
    let filtered = [...results];

    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((result) => {
        const resultDate = new Date(result.date);

        if (
          filters.dateRange.start &&
          resultDate < filters.dateRange.start.toDate()
        ) {
          return false;
        }

        if (
          filters.dateRange.end &&
          resultDate > filters.dateRange.end.toDate()
        ) {
          return false;
        }

        return true;
      });
    }

    return filtered;
  };

  const filteredParameters = getFilteredParameters();
  const filteredResults = getFilteredResults();

  // Статистика после применения фильтров
  const getFilteredStats = () => {
    const categoryResults = filteredResults.filter(
      (r) => r.categoryId === currentCategoryId
    );

    const abnormalParams = filteredParameters.filter((param) => {
      const latest = AnalysisUtils.getLatestResult(filteredResults, param.id);
      return (
        latest &&
        AnalysisUtils.checkNormal(latest.value, param.id, 'female') !== 'normal'
      );
    });

    const lastResult = categoryResults.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return {
      totalResults: categoryResults.length,
      totalParameters: filteredParameters.length,
      abnormalParameters: abnormalParams.length,
      lastResultDate: lastResult?.date,
      parametersWithData: filteredParameters.filter((param) =>
        filteredResults.some((r) => r.parameterId === param.id)
      ).length,
    };
  };

  const stats = getFilteredStats();

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

      {/* Статистика категории после фильтрации */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon color="action" />
            <Typography variant="h6">
              Статистика{' '}
              {filters.dateRange.start ||
              filters.dateRange.end ||
              filters.selectedParameters.length > 0 ||
              filters.onlyAbnormal ||
              filters.searchQuery
                ? '(с фильтрами)'
                : ''}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Параметров
              </Typography>
              <Typography variant="h6">
                {stats.parametersWithData}/{stats.totalParameters}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Результатов
              </Typography>
              <Typography variant="h6">{stats.totalResults}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Отклонений
              </Typography>
              <Typography
                variant="h6"
                color={stats.abnormalParameters > 0 ? 'error' : 'success.main'}
              >
                {stats.abnormalParameters}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Последний анализ
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                {stats.lastResultDate
                  ? new Date(stats.lastResultDate).toLocaleDateString('ru-RU')
                  : 'Нет данных'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Компонент фильтров */}
      <CategoryFilters
        parameters={categoryParameters}
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
      />

      {/* Индикаторы активных фильтров */}
      {(filters.onlyAbnormal ||
        filters.searchQuery ||
        filters.selectedParameters.length > 0 ||
        filters.dateRange.start ||
        filters.dateRange.end) && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Активные фильтры:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {filters.onlyAbnormal && (
              <Chip
                label="Только отклонения"
                color="error"
                size="small"
                onDelete={() =>
                  handleFiltersChange({ ...filters, onlyAbnormal: false })
                }
              />
            )}
            {filters.searchQuery && (
              <Chip
                label={`Поиск: "${filters.searchQuery}"`}
                color="primary"
                size="small"
                onDelete={() =>
                  handleFiltersChange({ ...filters, searchQuery: '' })
                }
              />
            )}
            {filters.selectedParameters.length > 0 && (
              <Chip
                label={`Параметры: ${filters.selectedParameters.length}`}
                color="primary"
                size="small"
                onDelete={() =>
                  handleFiltersChange({ ...filters, selectedParameters: [] })
                }
              />
            )}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Chip
                label="Период задан"
                color="primary"
                size="small"
                onDelete={() =>
                  handleFiltersChange({
                    ...filters,
                    dateRange: { start: null, end: null },
                  })
                }
              />
            )}
          </Box>
        </Box>
      )}

      {/* Параметры категории */}
      {filteredParameters.length > 0 ? (
        <Grid container spacing={3}>
          {filteredParameters.map((parameter) => (
            <Grid size={{ xs: 12 }} key={parameter.id}>
              <ParameterCard
                parameter={parameter}
                results={filteredResults}
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
            {categoryParameters.length === 0
              ? 'В этой категории пока нет параметров'
              : 'Нет параметров, соответствующих фильтрам'}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {categoryParameters.length === 0
              ? 'Параметры для этой категории будут добавлены в будущих версиях приложения.'
              : 'Попробуйте изменить настройки фильтров или очистить их.'}
          </Typography>

          {categoryParameters.length === 0 ? (
            <Button variant="outlined" onClick={handleBackToDashboard}>
              Вернуться на главную
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() =>
                handleFiltersChange({
                  dateRange: { start: null, end: null },
                  selectedParameters: [],
                  onlyAbnormal: false,
                  sortBy: 'date',
                  sortOrder: 'desc',
                  searchQuery: '',
                })
              }
            >
              Очистить фильтры
            </Button>
          )}
        </Box>
      )}

      {/* Рекомендации для категории */}
      {stats.abnormalParameters > 0 && (
        <Card sx={{ mt: 4, border: '1px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="warning.main">
              ⚠️ Рекомендации
            </Typography>
            <Typography variant="body2" paragraph>
              В категории "{category.name}" обнаружено{' '}
              {stats.abnormalParameters} параметров с отклонениями от нормы.
              Рекомендуем:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2">
                Обратиться к соответствующему специалисту для консультации
              </Typography>
              <Typography component="li" variant="body2">
                Повторить анализы через рекомендуемый период:{' '}
                {category.frequency}
              </Typography>
              <Typography component="li" variant="body2">
                Отслеживать динамику показателей с отклонениями
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Дополнительная информация о категории */}
      {filteredParameters.length > 0 && (
        <Box mt={4} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            О категории "{category.name}"
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Всего параметров
              </Typography>
              <Typography variant="h6">{categoryParameters.length}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Всего результатов
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
