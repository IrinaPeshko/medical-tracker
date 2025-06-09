import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  FileUpload as ImportIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectIsImportDialogOpen,
  closeImportDialog,
  showSuccessNotification,
  showErrorNotification,
} from '../../../store/slices/uiSlice';
import { importAnalysisData } from '../../../store/slices/analysisSlice';
import { ValidationUtils } from '../../../utils';
import type { AnalysisResult } from '../../../types';

interface ImportStats {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  categories: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: ImportStats | null;
}

export const ImportDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsImportDialogOpen);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mergeWithExisting, setMergeWithExisting] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    dispatch(closeImportDialog());
    // Сброс состояния
    setSelectedFile(null);
    setMergeWithExisting(true);
    setValidationResult(null);
    setIsValidating(false);
    setIsImporting(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      validateFile(file);
    }
  };

  const validateFile = async (file: File) => {
    setIsValidating(true);

    try {
      // Валидация файла
      const fileValidation = ValidationUtils.validateImportFile(file);
      if (!fileValidation.isValid) {
        setValidationResult({
          isValid: false,
          errors: [fileValidation.error!],
          warnings: [],
          stats: null,
        });
        setIsValidating(false);
        return;
      }

      // Чтение и парсинг JSON
      const text = await file.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setValidationResult({
          isValid: false,
          errors: ['Файл содержит некорректный JSON'],
          warnings: [],
          stats: null,
        });
        setIsValidating(false);
        return;
      }

      // Анализ структуры данных
      const results = data.results || data;
      if (!Array.isArray(results)) {
        setValidationResult({
          isValid: false,
          errors: ['Файл должен содержать массив результатов анализов'],
          warnings: [],
          stats: null,
        });
        setIsValidating(false);
        return;
      }

      // Детальная валидация записей
      const errors: string[] = [];
      const warnings: string[] = [];
      let validCount = 0;
      const categories = new Set<string>();
      const dates: string[] = [];

      results.forEach((record: AnalysisResult, index: number) => {
        try {
          // Проверяем обязательные поля
          if (!record.parameterId) {
            errors.push(`Запись ${index + 1}: отсутствует parameterId`);
            return;
          }
          if (!record.categoryId) {
            errors.push(`Запись ${index + 1}: отсутствует categoryId`);
            return;
          }
          if (record.value === undefined || record.value === null) {
            errors.push(`Запись ${index + 1}: отсутствует значение`);
            return;
          }
          if (!record.date) {
            errors.push(`Запись ${index + 1}: отсутствует дата`);
            return;
          }
          if (!record.unit) {
            warnings.push(`Запись ${index + 1}: отсутствуют единицы измерения`);
          }

          // Валидация даты
          const dateValidation = ValidationUtils.validateDate(record.date);
          if (!dateValidation.isValid) {
            errors.push(`Запись ${index + 1}: ${dateValidation.error}`);
            return;
          }

          // Валидация значения (если есть parameterId)
          if (record.parameterId && record.value !== undefined) {
            const valueValidation = ValidationUtils.validateAnalysisValue(
              record.parameterId,
              record.value
            );
            if (!valueValidation.isValid) {
              warnings.push(`Запись ${index + 1}: ${valueValidation.error}`);
            }
          }

          categories.add(record.categoryId);
          dates.push(record.date);
          validCount++;
        } catch {
          errors.push(`Запись ${index + 1}: ошибка валидации`);
        }
      });

      // Статистика
      const sortedDates = dates.sort();
      const stats: ImportStats = {
        totalRecords: results.length,
        validRecords: validCount,
        invalidRecords: results.length - validCount,
        categories: Array.from(categories),
        dateRange: {
          start: sortedDates[0] || null,
          end: sortedDates[sortedDates.length - 1] || null,
        },
      };

      // Дополнительные предупреждения
      if (stats.totalRecords > 1000) {
        warnings.push(
          'Большое количество записей может замедлить работу приложения'
        );
      }

      if (stats.categories.length > 10) {
        warnings.push('Обнаружены неизвестные категории анализов');
      }

      setValidationResult({
        isValid: errors.length === 0 && validCount > 0,
        errors,
        warnings,
        stats,
      });
    } catch {
      setValidationResult({
        isValid: false,
        errors: ['Ошибка при обработке файла'],
        warnings: [],
        stats: null,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.isValid) return;

    setIsImporting(true);

    try {
      const text = await selectedFile.text();
      const result = await dispatch(
        importAnalysisData({
          jsonData: text,
          mergeWithExisting,
        })
      ).unwrap();

      dispatch(
        showSuccessNotification({
          title: 'Импорт завершен успешно',
          message: `Импортировано ${result.importResult.imported} записей`,
        })
      );

      handleClose();
    } catch (error) {
      dispatch(
        showErrorNotification({
          title: 'Ошибка импорта',
          message:
            error instanceof Error ? error.message : 'Неизвестная ошибка',
        })
      );
    } finally {
      setIsImporting(false);
    }
  };

  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ImportIcon />
          <Typography variant="h6" component="div">
            Импорт медицинских данных
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Выбор файла */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Выберите файл для импорта
            </Typography>

            <Paper
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: selectedFile ? 'primary.main' : 'grey.300',
                bgcolor: selectedFile ? 'primary.50' : 'grey.50',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />

              {selectedFile ? (
                <Box>
                  <Typography variant="h6" color="primary">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {getFileSize(selectedFile.size)} • JSON файл
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Перетащите файл сюда или нажмите для выбора
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Поддерживаются только JSON файлы (до 10MB)
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Прогресс валидации */}
          {isValidating && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Проверка файла...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {/* Результаты валидации */}
          {validationResult && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Результаты проверки
              </Typography>

              {/* Статус валидации */}
              <Alert
                severity={validationResult.isValid ? 'success' : 'error'}
                icon={
                  validationResult.isValid ? <SuccessIcon /> : <WarningIcon />
                }
                sx={{ mb: 2 }}
              >
                {validationResult.isValid
                  ? 'Файл готов к импорту'
                  : 'Файл содержит ошибки'}
              </Alert>

              {/* Ошибки */}
              {validationResult.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Найдены ошибки:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {validationResult.errors.slice(0, 5).map((error, index) => (
                      <Typography key={index} component="li" variant="body2">
                        {error}
                      </Typography>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        ... и еще {validationResult.errors.length - 5} ошибок
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              {/* Предупреждения */}
              {validationResult.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Предупреждения:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {validationResult.warnings
                      .slice(0, 3)
                      .map((warning, index) => (
                        <Typography key={index} component="li" variant="body2">
                          {warning}
                        </Typography>
                      ))}
                    {validationResult.warnings.length > 3 && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        ... и еще {validationResult.warnings.length - 3}{' '}
                        предупреждений
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              {/* Статистика */}
              {validationResult.stats && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Статистика файла
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Всего записей:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {validationResult.stats.totalRecords}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Валидных:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: 'success.main' }}
                      >
                        {validationResult.stats.validRecords}
                      </Typography>
                    </Box>
                    {validationResult.stats.invalidRecords > 0 && (
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          С ошибками:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: 'error.main' }}
                        >
                          {validationResult.stats.invalidRecords}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Категорий:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {validationResult.stats.categories.length}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Временной диапазон */}
                  {validationResult.stats.dateRange.start &&
                    validationResult.stats.dateRange.end && (
                      <Box mb={2}>
                        <Typography variant="caption" color="textSecondary">
                          Период данных:
                        </Typography>
                        <Typography variant="body2">
                          {new Date(
                            validationResult.stats.dateRange.start
                          ).toLocaleDateString('ru-RU')}{' '}
                          —{' '}
                          {new Date(
                            validationResult.stats.dateRange.end
                          ).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Box>
                    )}

                  {/* Категории */}
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                      sx={{ mb: 1 }}
                    >
                      Обнаруженные категории:
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {validationResult.stats.categories
                        .slice(0, 5)
                        .map((categoryId) => (
                          <Chip
                            key={categoryId}
                            label={categoryId}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      {validationResult.stats.categories.length > 5 && (
                        <Chip
                          label={`+${validationResult.stats.categories.length - 5} еще`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {/* Настройки импорта */}
          {validationResult?.isValid && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Настройки импорта
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={mergeWithExisting}
                      onChange={(e) => setMergeWithExisting(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        Объединить с существующими данными
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {mergeWithExisting
                          ? 'Новые данные будут добавлены к существующим'
                          : 'Существующие пользовательские данные будут заменены'}
                      </Typography>
                    </Box>
                  }
                />

                {!mergeWithExisting && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Внимание!</strong> При отключении этой опции все
                      ваши текущие пользовательские данные будут удалены и
                      заменены данными из файла. Исторические данные останутся
                      без изменений.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </>
          )}

          {/* Прогресс импорта */}
          {isImporting && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Импорт данных...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          startIcon={<CloseIcon />}
          disabled={isImporting}
        >
          Отмена
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          startIcon={<ImportIcon />}
          disabled={
            !selectedFile ||
            !validationResult?.isValid ||
            isValidating ||
            isImporting ||
            (validationResult?.stats?.validRecords || 0) === 0
          }
          sx={{ ml: 1 }}
        >
          {isImporting
            ? 'Импорт...'
            : `Импортировать (${validationResult?.stats?.validRecords || 0})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
