import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Collapse,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

import type { Parameter } from '../../../types';

interface CategoryFiltersProps {
  parameters: Parameter[];
  onFiltersChange: (filters: CategoryFilters) => void;
  initialFilters?: CategoryFilters;
}

export interface CategoryFilters {
  dateRange: {
    start: Dayjs | null;
    end: Dayjs | null;
  };
  selectedParameters: string[];
  onlyAbnormal: boolean;
  sortBy: 'date' | 'parameter' | 'value';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

const defaultFilters: CategoryFilters = {
  dateRange: {
    start: null,
    end: null,
  },
  selectedParameters: [],
  onlyAbnormal: false,
  sortBy: 'date',
  sortOrder: 'desc',
  searchQuery: '',
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  parameters,
  onFiltersChange,
  initialFilters = defaultFilters,
}) => {
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<CategoryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.selectedParameters.length > 0 ||
      filters.onlyAbnormal ||
      filters.searchQuery.length > 0 ||
      filters.sortBy !== 'date' ||
      filters.sortOrder !== 'desc'
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.selectedParameters.length > 0) count++;
    if (filters.onlyAbnormal) count++;
    if (filters.searchQuery.length > 0) count++;
    if (filters.sortBy !== 'date' || filters.sortOrder !== 'desc') count++;
    return count;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {/* Заголовок фильтров */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterIcon color="action" />
          <Typography variant="h6">Фильтры и сортировка</Typography>
          {hasActiveFilters() && (
            <Chip
              size="small"
              label={getActiveFiltersCount()}
              color="primary"
            />
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {hasActiveFilters() && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Очистить
            </Button>
          )}
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Быстрые фильтры */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.onlyAbnormal}
              onChange={(e) =>
                updateFilters({ onlyAbnormal: e.target.checked })
              }
            />
          }
          label="Только отклонения"
        />

        <TextField
          size="small"
          placeholder="Поиск по параметрам..."
          value={filters.searchQuery}
          onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_') as [
                CategoryFilters['sortBy'],
                CategoryFilters['sortOrder'],
              ];
              updateFilters({ sortBy, sortOrder });
            }}
            label="Сортировка"
          >
            <MenuItem value="date_desc">Дата (новые)</MenuItem>
            <MenuItem value="date_asc">Дата (старые)</MenuItem>
            <MenuItem value="parameter_asc">Параметр (А-Я)</MenuItem>
            <MenuItem value="parameter_desc">Параметр (Я-А)</MenuItem>
            <MenuItem value="value_desc">Значение (убыв.)</MenuItem>
            <MenuItem value="value_asc">Значение (возр.)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Расширенные фильтры */}
      <Collapse in={isExpanded}>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          pt={2}
          borderTop="1px solid #e0e0e0"
        >
          {/* Временной диапазон */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Период анализов
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <DatePicker
                label="Начальная дата"
                value={filters.dateRange.start}
                onChange={(date) =>
                  updateFilters({
                    dateRange: { ...filters.dateRange, start: date },
                  })
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="Конечная дата"
                value={filters.dateRange.end}
                onChange={(date) =>
                  updateFilters({
                    dateRange: { ...filters.dateRange, end: date },
                  })
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </Box>

          {/* Выбор параметров */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Показывать параметры
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Выберите параметры</InputLabel>
              <Select
                multiple
                value={filters.selectedParameters}
                onChange={(e) =>
                  updateFilters({
                    selectedParameters:
                      typeof e.target.value === 'string'
                        ? [e.target.value]
                        : e.target.value,
                  })
                }
                label="Выберите параметры"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const param = parameters.find((p) => p.id === value);
                      return (
                        <Chip
                          key={value}
                          label={param?.name || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {parameters.map((parameter) => (
                  <MenuItem key={parameter.id} value={parameter.id}>
                    {parameter.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Быстрые временные фильтры */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Быстрый выбор периода
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {[
                { label: 'Последний месяц', days: 30 },
                { label: 'Последние 3 месяца', days: 90 },
                { label: 'Последние 6 месяцев', days: 180 },
                { label: 'Последний год', days: 365 },
              ].map((preset) => (
                <Chip
                  key={preset.label}
                  label={preset.label}
                  variant="outlined"
                  clickable
                  onClick={() => {
                    const end = dayjs();
                    const start = end.subtract(preset.days, 'day');
                    updateFilters({
                      dateRange: { start, end },
                    });
                  }}
                />
              ))}
              <Chip
                label="Все время"
                variant="outlined"
                clickable
                onClick={() =>
                  updateFilters({
                    dateRange: { start: null, end: null },
                  })
                }
              />
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};
