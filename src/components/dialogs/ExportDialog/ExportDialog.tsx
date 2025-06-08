import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  Chip,
  Paper,
  CircularProgress,
  LinearProgress,
  Switch,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Close as CloseIcon,
  Description as PdfIcon,
  Code as JsonIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsExportDialogOpen,
  closeExportDialog,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
} from '../../../store/slices/uiSlice';
import { selectAnalysisResults } from '../../../store/slices/analysisSlice';
import { CATEGORIES } from '../../../config';
import { PDFExportService } from '../../../services/pdfExportService';
import type { CategoryType } from '../../../types';

type ExportFormat = 'json' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  includeHistorical: boolean;
  includeNotes: boolean;
  includeCharts: boolean;
  includeStatistics: boolean;
  includeTrends: boolean;
  selectedCategories: CategoryType[];
  dateRange: {
    enabled: boolean;
    start: Dayjs | null;
    end: Dayjs | null;
  };
  pdfSettings: {
    paperSize: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
    fontSize: 'small' | 'normal' | 'large';
    includeMetadata: boolean;
  };
}

const defaultOptions: ExportOptions = {
  format: 'json',
  includeHistorical: true,
  includeNotes: true,
  includeCharts: false,
  includeStatistics: true,
  includeTrends: true,
  selectedCategories: [],
  dateRange: {
    enabled: false,
    start: null,
    end: null,
  },
  pdfSettings: {
    paperSize: 'a4',
    orientation: 'portrait',
    fontSize: 'normal',
    includeMetadata: true,
  },
};

export const ExportDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsExportDialogOpen);
  const results = useAppSelector(selectAnalysisResults);

  const [options, setOptions] = useState<ExportOptions>(defaultOptions);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleClose = () => {
    if (isExporting) return;

    dispatch(closeExportDialog());
    setOptions(defaultOptions);
    setExportProgress(0);
    setShowAdvanced(false);
    setPreviewData(null);
  };

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
    setPreviewData(null); // Сброс превью при изменении опций
  };

  const updatePdfSettings = (
    updates: Partial<ExportOptions['pdfSettings']>
  ) => {
    setOptions((prev) => ({
      ...prev,
      pdfSettings: { ...prev.pdfSettings, ...updates },
    }));
  };

  const getFilteredResults = () => {
    let filtered = [...results];

    // Фильтр по категориям
    if (options.selectedCategories.length > 0) {
      filtered = filtered.filter((r) =>
        options.selectedCategories.includes(r.categoryId)
      );
    }

    // Фильтр по историческим данным
    if (!options.includeHistorical) {
      filtered = filtered.filter((r) => !r.isHistorical);
    }

    // Фильтр по датам
    if (
      options.dateRange.enabled &&
      options.dateRange.start &&
      options.dateRange.end
    ) {
      const startDate = options.dateRange.start.toDate();
      const endDate = options.dateRange.end.toDate();
      filtered = filtered.filter((r) => {
        const resultDate = new Date(r.date);
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    return filtered;
  };

  const getExportStats = () => {
    const filtered = getFilteredResults();
    const categoriesWithData = new Set(filtered.map((r) => r.categoryId));

    return {
      totalResults: filtered.length,
      categoriesCount: categoriesWithData.size,
      historicalCount: filtered.filter((r) => r.isHistorical).length,
      userCount: filtered.filter((r) => !r.isHistorical).length,
      withNotes: filtered.filter((r) => r.notes && r.notes.trim()).length,
      dateRange:
        filtered.length > 0
          ? {
              start: new Date(
                Math.min(...filtered.map((r) => new Date(r.date).getTime()))
              ),
              end: new Date(
                Math.max(...filtered.map((r) => new Date(r.date).getTime()))
              ),
            }
          : null,
      categoriesWithData: Array.from(categoriesWithData),
      avgResultsPerCategory:
        categoriesWithData.size > 0
          ? Math.round(filtered.length / categoriesWithData.size)
          : 0,
    };
  };

  const generatePreview = () => {
    const filtered = getFilteredResults();
    const stats = getExportStats();

    setPreviewData({
      results: filtered.slice(0, 5), // Первые 5 для превью
      stats,
      estimatedFileSize:
        options.format === 'pdf'
          ? `${Math.max(1, Math.round(filtered.length / 50))} МБ`
          : `${Math.max(1, Math.round(filtered.length / 100))} КБ`,
    });
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateJSONExport = (filtered: any[]) => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'json',
        version: '1.0',
        totalResults: filtered.length,
        appVersion: '1.0.0',
        filters: {
          includeHistorical: options.includeHistorical,
          includeNotes: options.includeNotes,
          selectedCategories: options.selectedCategories,
          dateRange: options.dateRange.enabled
            ? {
                start: options.dateRange.start?.format('YYYY-MM-DD'),
                end: options.dateRange.end?.format('YYYY-MM-DD'),
              }
            : null,
        },
      },
      categories: CATEGORIES.filter(
        (cat) =>
          options.selectedCategories.length === 0 ||
          options.selectedCategories.includes(cat.id)
      ),
      results: filtered.map((result) => ({
        ...result,
        notes: options.includeNotes ? result.notes : undefined,
      })),
      statistics: options.includeStatistics ? getExportStats() : undefined,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  };

  const generatePDFExport = async (filtered: any[]) => {
    try {
      setExportProgress(20);

      const exportData = {
        results: filtered.map((result) => ({
          ...result,
          notes: options.includeNotes ? result.notes : undefined,
        })),
        categories: CATEGORIES.filter(
          (cat) =>
            options.selectedCategories.length === 0 ||
            options.selectedCategories.includes(cat.id)
        ),
        options: {
          includeCharts: options.includeCharts,
          includeNotes: options.includeNotes,
          includeStatistics: options.includeStatistics,
          includeTrends: options.includeTrends,
          title: 'Отчет по медицинским анализам',
          ...options.pdfSettings,
        },
      };

      setExportProgress(50);

      const blob = await PDFExportService.exportToPDF(exportData);
      setExportProgress(90);

      return blob;
    } catch (error) {
      console.error('PDF Export Error:', error);

      dispatch(
        showWarningNotification({
          title: 'Переход к упрощенному PDF',
          message:
            'Создается упрощенная версия отчета из-за ошибки в основном алгоритме.',
        })
      );

      // Fallback на простой PDF
      const simpleData = {
        results: filtered,
        title: 'Медицинские анализы - Упрощенный отчет',
      };

      return await PDFExportService.createSimplePDF(simpleData);
    }
  };

  const handleExport = async () => {
    const filtered = getFilteredResults();

    if (filtered.length === 0) {
      dispatch(
        showErrorNotification({
          title: 'Нет данных для экспорта',
          message: 'С выбранными фильтрами не найдено ни одного результата.',
        })
      );
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      setExportProgress(10);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-');

      let blob: Blob;
      let filename: string;

      if (options.format === 'json') {
        setExportProgress(30);
        blob = generateJSONExport(filtered);
        setExportProgress(80);
        filename = `medical-tracker-export-${timestamp}.json`;

        dispatch(
          showSuccessNotification({
            title: 'JSON экспорт завершен',
            message: `Экспортировано ${filtered.length} записей в формате JSON`,
          })
        );
      } else {
        blob = await generatePDFExport(filtered);
        filename = `medical-tracker-report-${timestamp}.pdf`;

        dispatch(
          showSuccessNotification({
            title: 'PDF отчет создан успешно',
            message: `Создан детальный PDF отчет с ${filtered.length} записями`,
          })
        );
      }

      setExportProgress(95);
      downloadFile(blob, filename);
      setExportProgress(100);

      // Небольшая задержка для показа завершения
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      dispatch(
        showErrorNotification({
          title: 'Ошибка экспорта',
          message:
            error instanceof Error
              ? `Не удалось создать экспорт: ${error.message}`
              : 'Неизвестная ошибка при создании экспорта',
        })
      );
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  const handleCategoryToggle = (categoryId: CategoryType) => {
    updateOptions({
      selectedCategories: options.selectedCategories.includes(categoryId)
        ? options.selectedCategories.filter((id) => id !== categoryId)
        : [...options.selectedCategories, categoryId],
    });
  };

  const selectAllCategories = () => {
    updateOptions({ selectedCategories: CATEGORIES.map((c) => c.id) });
  };

  const clearCategories = () => {
    updateOptions({ selectedCategories: [] });
  };

  const stats = getExportStats();

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ExportIcon />
            <Typography variant="h6" component="div">
              Экспорт медицинских данных
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Прогресс экспорта */}
          {isExporting && (
            <Paper
              sx={{
                p: 2,
                bgcolor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.200',
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {options.format === 'pdf'
                    ? 'Создание PDF отчета...'
                    : 'Подготовка JSON файла...'}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={exportProgress} />
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {exportProgress}% завершено
              </Typography>
            </Paper>
          )}

          {/* Формат экспорта */}
          <Box>
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}
              >
                Формат экспорта
              </FormLabel>
              <RadioGroup
                value={options.format}
                onChange={(e) =>
                  updateOptions({ format: e.target.value as ExportFormat })
                }
                row
              >
                <FormControlLabel
                  value="json"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <JsonIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          JSON данные
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Для резервного копирования
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="pdf"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <PdfIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          PDF отчет
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Для просмотра и печати
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Информация о форматах */}
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              icon={options.format === 'pdf' ? <PdfIcon /> : <JsonIcon />}
            >
              {options.format === 'json'
                ? 'JSON формат содержит все данные в структурированном виде и подходит для импорта в другие приложения или создания резервных копий.'
                : 'PDF отчет создает красиво оформленный документ с таблицами, статистикой и анализом, который удобен для просмотра врачом.'}
            </Alert>
          </Box>

          <Divider />

          {/* Основные настройки содержимого */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Содержимое экспорта
            </Typography>

            <Box display="flex" flexDirection="column" gap={1.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={options.includeHistorical}
                    onChange={(e) =>
                      updateOptions({ includeHistorical: e.target.checked })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Исторические данные</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Включить захардкоженные данные из приложения
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={options.includeNotes}
                    onChange={(e) =>
                      updateOptions({ includeNotes: e.target.checked })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Заметки к анализам</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Персональные комментарии к результатам
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={options.includeStatistics}
                    onChange={(e) =>
                      updateOptions({ includeStatistics: e.target.checked })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Статистика</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Сводная информация по категориям и трендам
                    </Typography>
                  </Box>
                }
              />

              {options.format === 'pdf' && (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.includeTrends}
                        onChange={(e) =>
                          updateOptions({ includeTrends: e.target.checked })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Анализ трендов</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Динамика изменения показателей
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={options.includeCharts}
                        onChange={(e) =>
                          updateOptions({ includeCharts: e.target.checked })
                        }
                        disabled // Пока не реализовано
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          variant="body2"
                          color={
                            options.includeCharts ? 'inherit' : 'textSecondary'
                          }
                        >
                          Графики (в разработке)
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Визуализация данных в PDF
                        </Typography>
                      </Box>
                    }
                  />
                </>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Выбор категорий */}
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Категории анализов
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  onClick={clearCategories}
                  disabled={options.selectedCategories.length === 0}
                >
                  Сбросить
                </Button>
                <Button
                  size="small"
                  onClick={selectAllCategories}
                  disabled={
                    options.selectedCategories.length === CATEGORIES.length
                  }
                >
                  Все
                </Button>
              </Box>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              {CATEGORIES.map((category) => {
                const isSelected = options.selectedCategories.includes(
                  category.id
                );
                const categoryResults = results.filter(
                  (r) => r.categoryId === category.id
                );

                return (
                  <Chip
                    key={category.id}
                    label={`${category.name} (${categoryResults.length})`}
                    clickable
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => handleCategoryToggle(category.id)}
                    sx={{
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 1,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Расширенные настройки */}
          <Collapse in={showAdvanced}>
            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {/* Временной диапазон */}
              <Box mb={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={options.dateRange.enabled}
                      onChange={(e) =>
                        updateOptions({
                          dateRange: {
                            ...options.dateRange,
                            enabled: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Фильтр по датам
                    </Typography>
                  }
                />

                {options.dateRange.enabled && (
                  <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                    <DatePicker
                      label="Начальная дата"
                      value={options.dateRange.start}
                      onChange={(date) =>
                        updateOptions({
                          dateRange: { ...options.dateRange, start: date },
                        })
                      }
                      slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                      label="Конечная дата"
                      value={options.dateRange.end}
                      onChange={(date) =>
                        updateOptions({
                          dateRange: { ...options.dateRange, end: date },
                        })
                      }
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </Box>
                )}
              </Box>

              {/* PDF настройки */}
              {options.format === 'pdf' && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Настройки PDF
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <FormControl size="small">
                      <FormLabel>Размер страницы</FormLabel>
                      <RadioGroup
                        value={options.pdfSettings.paperSize}
                        onChange={(e) =>
                          updatePdfSettings({
                            paperSize: e.target.value as 'a4' | 'letter',
                          })
                        }
                        row
                      >
                        <FormControlLabel
                          value="a4"
                          control={<Radio />}
                          label="A4"
                        />
                        <FormControlLabel
                          value="letter"
                          control={<Radio />}
                          label="Letter"
                        />
                      </RadioGroup>
                    </FormControl>

                    <FormControl size="small">
                      <FormLabel>Ориентация</FormLabel>
                      <RadioGroup
                        value={options.pdfSettings.orientation}
                        onChange={(e) =>
                          updatePdfSettings({
                            orientation: e.target.value as
                              | 'portrait'
                              | 'landscape',
                          })
                        }
                        row
                      >
                        <FormControlLabel
                          value="portrait"
                          control={<Radio />}
                          label="Книжная"
                        />
                        <FormControlLabel
                          value="landscape"
                          control={<Radio />}
                          label="Альбомная"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>

          <Divider />

          {/* Предварительный просмотр статистики */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Предварительный просмотр
              </Typography>
              <Button
                size="small"
                startIcon={<PreviewIcon />}
                onClick={generatePreview}
                disabled={stats.totalResults === 0}
              >
                Обновить
              </Button>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
              gap={2}
            >
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.totalResults}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Записей
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color="success.main"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.categoriesCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Категорий
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color="warning.main"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.withNotes}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  С заметками
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color="info.main"
                  sx={{ fontWeight: 700 }}
                >
                  {stats.avgResultsPerCategory}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  В среднем на категорию
                </Typography>
              </Box>
            </Box>

            {stats.dateRange && (
              <Box mt={2} p={1} bgcolor="white" borderRadius={1}>
                <Typography variant="caption" color="textSecondary">
                  Период данных:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {stats.dateRange.start.toLocaleDateString('ru-RU')} —{' '}
                  {stats.dateRange.end.toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            )}

            {previewData && (
              <Box mt={2} p={1} bgcolor="white" borderRadius={1}>
                <Typography variant="caption" color="textSecondary">
                  Ожидаемый размер файла:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {previewData.estimatedFileSize}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Предупреждения */}
          {stats.totalResults === 0 && (
            <Alert severity="warning">
              С выбранными настройками не найдено ни одной записи для экспорта.
              Проверьте фильтры категорий и дат.
            </Alert>
          )}

          {options.format === 'pdf' && stats.totalResults > 100 && (
            <Alert severity="info">
              Большое количество данных ({stats.totalResults} записей) может
              увеличить время создания PDF. Ожидаемое время: ~
              {Math.ceil(stats.totalResults / 50)} секунд.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          startIcon={<CloseIcon />}
          disabled={isExporting}
          variant="outlined"
        >
          {isExporting ? 'Отмена недоступна' : 'Отмена'}
        </Button>

        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={
            isExporting ? <CircularProgress size={16} /> : <ExportIcon />
          }
          disabled={isExporting || stats.totalResults === 0}
          sx={{
            minWidth: 180,
            '&:disabled': {
              bgcolor: 'action.disabledBackground',
            },
          }}
        >
          {isExporting
            ? `${options.format === 'pdf' ? 'Создание PDF' : 'Экспорт'}... ${exportProgress}%`
            : `${options.format === 'pdf' ? 'Создать PDF' : 'Экспортировать'} (${stats.totalResults})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
