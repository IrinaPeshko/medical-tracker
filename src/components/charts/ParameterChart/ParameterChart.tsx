import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from 'recharts';

import type { Parameter, ChartDataPoint } from '../../../types';
import { AnalysisUtils } from '../../../utils';
import type { CustomTooltipProps } from '../../../types/ui';

interface ParameterChartProps {
  parameter: Parameter;
  data: ChartDataPoint[];
  height?: number;
  showControls?: boolean;
  showTrend?: boolean;
}

type ChartType = 'line' | 'area' | 'bar';
type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const ParameterChart: React.FC<ParameterChartProps> = ({
  parameter,
  data,
  height = 300,
  showControls = true,
  showTrend = true,
}) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Фильтрация данных по временному диапазону
  const getFilteredData = () => {
    if (timeRange === 'ALL' || data.length === 0) return data;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter((point) => new Date(point.fullDate) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  // Анализ тренда
  const getTrendAnalysis = () => {
    if (filteredData.length < 2) return null;

    const recent = filteredData.slice(-3); // Последние 3 точки
    if (recent.length < 2) return null;

    const values = recent.map((p) => p.value);
    const avgChange =
      (values[values.length - 1] - values[0]) / (values.length - 1);
    const percentChange = Math.abs(avgChange / values[0]) * 100;

    if (percentChange < 2) return { trend: 'stable', change: percentChange };
    return {
      trend: avgChange > 0 ? 'up' : 'down',
      change: percentChange,
    };
  };

  const trendAnalysis = getTrendAnalysis();

  const getTrendIcon = () => {
    if (!trendAnalysis) return <TrendingFlatIcon fontSize="small" />;

    switch (trendAnalysis.trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" color="error" />;
      default:
        return <TrendingFlatIcon fontSize="small" color="action" />;
    }
  };

  const getTrendText = () => {
    if (!trendAnalysis) return 'Недостаточно данных';

    const changeText = `${trendAnalysis.change.toFixed(1)}%`;
    switch (trendAnalysis.trend) {
      case 'up':
        return `Рост ${changeText}`;
      case 'down':
        return `Снижение ${changeText}`;
      default:
        return `Стабильно (±${changeText})`;
    }
  };

  // Обработчики событий
  const handleChartTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: ChartType | null
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleTimeRangeChange = (
    _: React.MouseEvent<HTMLElement>,
    newRange: TimeRange | null
  ) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const exportChart = () => {
    // TODO: Реализовать экспорт графика
    console.log('Export chart');
    handleMenuClose();
  };

  // Кастомный Tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const status = AnalysisUtils.checkNormal(
        data.value,
        parameter.id,
        'female'
      );

      return (
        <Card sx={{ p: 1, minWidth: 200 }}>
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="body2">
            Значение: {AnalysisUtils.formatValue(data.value, parameter.unit)}
          </Typography>
          <Chip
            size="small"
            label={AnalysisUtils.getStatusText(status)}
            color={
              status === 'normal'
                ? 'success'
                : status === 'high'
                  ? 'error'
                  : 'warning'
            }
            sx={{ mt: 0.5 }}
          />
        </Card>
      );
    }
    return null;
  };

  // Рендер графика в зависимости от типа
  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    const chartColor =
      parameter.normalRange.min !== undefined &&
      parameter.normalRange.max !== undefined
        ? '#1976d2'
        : '#2e7d32';

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />

            {/* Референсные линии */}
            {parameter.normalRange.min && (
              <ReferenceLine
                y={parameter.normalRange.min}
                stroke="#4caf50"
                strokeDasharray="5 5"
                label="Мин"
              />
            )}
            {parameter.normalRange.max && (
              <ReferenceLine
                y={parameter.normalRange.max}
                stroke="#4caf50"
                strokeDasharray="5 5"
                label="Макс"
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              fill={`${chartColor}30`}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />

            {parameter.normalRange.min && (
              <ReferenceLine
                y={parameter.normalRange.min}
                stroke="#4caf50"
                strokeDasharray="5 5"
              />
            )}
            {parameter.normalRange.max && (
              <ReferenceLine
                y={parameter.normalRange.max}
                stroke="#4caf50"
                strokeDasharray="5 5"
              />
            )}

            <Bar dataKey="value" fill={chartColor} />
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />

            {parameter.normalRange.min && (
              <ReferenceLine
                y={parameter.normalRange.min}
                stroke="#4caf50"
                strokeDasharray="5 5"
                label="Мин"
              />
            )}
            {parameter.normalRange.max && (
              <ReferenceLine
                y={parameter.normalRange.max}
                stroke="#4caf50"
                strokeDasharray="5 5"
                label="Макс"
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={3}
              dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Нет данных для отображения
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {timeRange !== 'ALL'
              ? 'Попробуйте расширить временной диапазон'
              : 'Добавьте результаты анализов'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Заголовок с трендом */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography variant="h6" component="div">
              {parameter.name}
            </Typography>
            {showTrend && trendAnalysis && (
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                {getTrendIcon()}
                <Typography variant="body2" color="textSecondary">
                  {getTrendText()}
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="textSecondary">
              {filteredData.length} точек
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Элементы управления */}
        {showControls && (
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="line">Линия</ToggleButton>
              <ToggleButton value="area">Область</ToggleButton>
              <ToggleButton value="bar">Столбцы</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
            >
              <ToggleButton value="1M">1М</ToggleButton>
              <ToggleButton value="3M">3М</ToggleButton>
              <ToggleButton value="6M">6М</ToggleButton>
              <ToggleButton value="1Y">1Г</ToggleButton>
              <ToggleButton value="ALL">Все</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* График */}
        <Box sx={{ height, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>

        {/* Дополнительная информация */}
        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="caption" color="textSecondary">
            {AnalysisUtils.getNormalRangeText(parameter.id, 'female')}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Период: {timeRange === 'ALL' ? 'Все время' : timeRange}
          </Typography>
        </Box>
      </CardContent>

      {/* Меню действий */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={exportChart}>Экспортировать график</MenuItem>
        <MenuItem onClick={handleMenuClose}>Настройки отображения</MenuItem>
      </Menu>
    </Card>
  );
};
