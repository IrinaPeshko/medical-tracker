import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addAnalysisResult,
  selectAnalysisLoading,
  selectAnalysisError,
} from '../../../store/slices/analysisSlice';
import {
  selectIsAddFormOpen,
  closeAddForm,
  showSuccessNotification,
  showErrorNotification,
} from '../../../store/slices/uiSlice';
import { CATEGORIES, PARAMETERS } from '../../../config';
import { ValidationUtils, AnalysisUtils } from '../../../utils';
import type { CategoryType } from '../../../types';

// Устанавливаем русскую локаль для dayjs
dayjs.locale('ru');

interface FormData {
  parameterId: string;
  value: string;
  date: Dayjs | null;
  notes: string;
}

interface FormErrors {
  parameterId?: string;
  value?: string;
  date?: string;
  notes?: string;
}

export const AddResultForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsAddFormOpen);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);

  const [formData, setFormData] = useState<FormData>({
    parameterId: '',
    value: '',
    date: dayjs(),
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>(
    ''
  );

  // Фильтруем параметры по выбранной категории
  const availableParameters = selectedCategory
    ? PARAMETERS.filter((p) => p.category === selectedCategory)
    : PARAMETERS;

  const selectedParameter = PARAMETERS.find(
    (p) => p.id === formData.parameterId
  );

  // Сброс формы при открытии
  useEffect(() => {
    if (isOpen) {
      setFormData({
        parameterId: '',
        value: '',
        date: dayjs(),
        notes: '',
      });
      setErrors({});
      setSelectedCategory('');
    }
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeAddForm());
  };

  const handleCategoryChange = (categoryId: CategoryType | '') => {
    setSelectedCategory(categoryId);
    setFormData((prev) => ({ ...prev, parameterId: '' }));
    setErrors((prev) => ({ ...prev, parameterId: undefined }));
  };

  const handleParameterChange = (parameterId: string) => {
    setFormData((prev) => ({ ...prev, parameterId }));
    setErrors((prev) => ({ ...prev, parameterId: undefined }));
  };

  const handleValueChange = (value: string) => {
    setFormData((prev) => ({ ...prev, value }));
    setErrors((prev) => ({ ...prev, value: undefined }));
  };

  const handleDateChange = (value: Dayjs | null) => {
    setFormData((prev) => ({ ...prev, date: value }));
    setErrors((prev) => ({ ...prev, date: undefined }));
  };

  const handleNotesChange = (notes: string) => {
    setFormData((prev) => ({ ...prev, notes }));
    setErrors((prev) => ({ ...prev, notes: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Валидация параметра
    if (!formData.parameterId) {
      newErrors.parameterId = 'Выберите показатель';
    }

    // Валидация значения
    if (!formData.value.trim()) {
      newErrors.value = 'Введите значение';
    } else if (formData.parameterId) {
      const valueValidation = ValidationUtils.validateAnalysisValue(
        formData.parameterId,
        formData.value
      );
      if (!valueValidation.isValid) {
        newErrors.value = valueValidation.error;
      }
    }

    // Валидация даты
    if (!formData.date || !formData.date.isValid()) {
      newErrors.date = 'Выберите корректную дату';
    } else {
      const dateValidation = ValidationUtils.validateDate(
        formData.date.format('YYYY-MM-DD')
      );
      if (!dateValidation.isValid) {
        newErrors.date = dateValidation.error;
      }
    }

    // Валидация заметок
    if (formData.notes) {
      const notesValidation = ValidationUtils.validateNotes(formData.notes);
      if (!notesValidation.isValid) {
        newErrors.notes = notesValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const parameter = PARAMETERS.find((p) => p.id === formData.parameterId);
    if (!parameter) {
      dispatch(
        showErrorNotification({
          title: 'Ошибка',
          message: 'Параметр не найден',
        })
      );
      return;
    }

    try {
      const resultData = {
        categoryId: parameter.category,
        parameterId: formData.parameterId,
        value: parameter.isNumeric
          ? parseFloat(formData.value)
          : formData.value,
        unit: parameter.unit,
        date: formData.date!.format('YYYY-MM-DD'),
        notes: formData.notes || undefined,
      };

      await dispatch(addAnalysisResult(resultData)).unwrap();

      dispatch(
        showSuccessNotification({
          title: 'Результат добавлен',
          message: `Результат анализа "${parameter.name}" успешно сохранен`,
        })
      );

      handleClose();
    } catch (error) {
      dispatch(
        showErrorNotification({
          title: 'Ошибка при сохранении',
          message:
            error instanceof Error ? error.message : 'Неизвестная ошибка',
        })
      );
    }
  };

  const getValueStatus = () => {
    if (!selectedParameter || !formData.value || errors.value) {
      return null;
    }

    const status = AnalysisUtils.checkNormal(
      selectedParameter.isNumeric ? parseFloat(formData.value) : formData.value,
      formData.parameterId,
      'female'
    );

    return status;
  };

  const valueStatus = getValueStatus();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
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
          <Typography variant="h6" component="div">
            Добавить результат анализа
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Выбор категории */}
            <FormControl fullWidth error={!!errors.parameterId}>
              <InputLabel>Категория анализа</InputLabel>
              <Select
                value={selectedCategory}
                label="Категория анализа"
                onChange={(e) =>
                  handleCategoryChange(e.target.value as CategoryType)
                }
              >
                <MenuItem value="">
                  <em>Выберите категорию</em>
                </MenuItem>
                {CATEGORIES.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Выбор параметра */}
            <FormControl fullWidth error={!!errors.parameterId}>
              <InputLabel>Показатель</InputLabel>
              <Select
                value={formData.parameterId}
                label="Показатель"
                onChange={(e) => handleParameterChange(e.target.value)}
                disabled={!selectedCategory}
              >
                <MenuItem value="">
                  <em>Выберите показатель</em>
                </MenuItem>
                {availableParameters.map((param) => (
                  <MenuItem key={param.id} value={param.id}>
                    <Box>
                      <Typography variant="body2">{param.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {AnalysisUtils.getNormalRangeText(param.id, 'female')}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.parameterId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.parameterId}
                </Typography>
              )}
            </FormControl>

            {/* Информация о выбранном параметре */}
            {selectedParameter && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedParameter.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Норма:{' '}
                  {AnalysisUtils.getNormalRangeText(
                    selectedParameter.id,
                    'female'
                  )}
                </Typography>
                {selectedParameter.description && (
                  <Typography variant="caption" color="textSecondary">
                    {selectedParameter.description}
                  </Typography>
                )}
              </Box>
            )}

            {/* Значение */}
            <Box>
              <TextField
                fullWidth
                label="Значение"
                value={formData.value}
                onChange={(e) => handleValueChange(e.target.value)}
                error={!!errors.value}
                helperText={errors.value}
                disabled={!selectedParameter}
                type={selectedParameter?.isNumeric ? 'number' : 'text'}
                inputProps={{
                  step: selectedParameter?.isNumeric ? 'any' : undefined,
                }}
                InputProps={{
                  endAdornment: selectedParameter?.unit && (
                    <Typography variant="body2" color="textSecondary">
                      {selectedParameter.unit}
                    </Typography>
                  ),
                }}
              />

              {/* Индикатор статуса значения */}
              {valueStatus && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={AnalysisUtils.getStatusText(valueStatus)}
                    color={
                      valueStatus === 'normal'
                        ? 'success'
                        : valueStatus === 'high'
                          ? 'error'
                          : 'warning'
                    }
                  />
                </Box>
              )}
            </Box>

            {/* Дата */}
            <DatePicker
              label="Дата анализа"
              value={formData.date}
              onChange={handleDateChange}
              format="DD.MM.YYYY"
              maxDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date,
                },
              }}
            />

            {/* Заметки */}
            <TextField
              fullWidth
              label="Заметки (необязательно)"
              value={formData.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              error={!!errors.notes}
              helperText={errors.notes}
              multiline
              rows={3}
              placeholder="Дополнительная информация о результате анализа..."
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            startIcon={<CloseIcon />}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={
              loading ||
              !formData.parameterId ||
              !formData.value ||
              !formData.date
            }
            sx={{ ml: 1 }}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
