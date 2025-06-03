import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
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
} from 'recharts';

import type { Parameter, AnalysisResult } from '../../../types/analysis';
import { AnalysisUtils } from '../../../utils/analysisUtils';

interface ParameterCardProps {
  parameter: Parameter;
  results: AnalysisResult[];
  showChart?: boolean;
  compact?: boolean;
  onResultClick?: (result: AnalysisResult) => void;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  parameter,
  results,
  showChart = true,
  compact = false,
  onResultClick,
}) => {
  const latest = AnalysisUtils.getLatestResult(results, parameter.id);
  const chartData = AnalysisUtils.getChartData(results, parameter.id, 'female');
  const status = latest
    ? AnalysisUtils.checkNormal(latest.value, parameter.id, 'female')
    : null;

  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'high':
        return 'error';
      case 'low':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'normal':
        return 'В норме';
      case 'high':
        return 'Выше нормы';
      case 'low':
        return 'Ниже нормы';
      default:
        return '';
    }
  };

  const getTrendIcon = () => {
    if (chartData.length < 2) return null;

    const recent = chartData.slice(-2);
    const diff = recent[1].value - recent[0].value;

    if (Math.abs(diff) < 0.01) return <TrendingFlatIcon fontSize="small" />;
    return diff > 0 ? (
      <TrendingUpIcon fontSize="small" />
    ) : (
      <TrendingDownIcon fontSize="small" />
    );
  };

  const normalRangeText = AnalysisUtils.getNormalRangeText(
    parameter.id,
    'female'
  );

  const handleCardClick = () => {
    if (latest && onResultClick) {
      onResultClick(latest);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onResultClick && latest ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out',
        '&:hover':
          onResultClick && latest
            ? {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            : {},
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: compact ? 2 : 3 }}>
        {/* Заголовок с основной информацией */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography
                variant={compact ? 'subtitle1' : 'h6'}
                component="div"
                sx={{ fontWeight: 600 }}
              >
                {parameter.name}
              </Typography>
              {getTrendIcon()}
            </Box>

            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block' }}
            >
              {normalRangeText}
            </Typography>
          </Box>

          {/* Последнее значение */}
          {latest && (
            <Box textAlign="right">
              <Typography
                variant={compact ? 'h6' : 'h4'}
                sx={{
                  color:
                    status === 'normal'
                      ? 'success.main'
                      : status === 'high'
                        ? 'error.main'
                        : status === 'low'
                          ? 'warning.main'
                          : 'text.primary',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {AnalysisUtils.formatValue(latest.value, latest.unit)}
              </Typography>

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block' }}
              >
                {new Date(latest.date).toLocaleDateString('ru-RU')}
              </Typography>

              {status !== 'normal' && (
                <Chip
                  size="small"
                  label={getStatusText()}
                  color={getStatusColor() as any}
                  sx={{ mt: 0.5, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Заметки к последнему результату */}
        {latest?.notes && !compact && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontStyle: 'italic' }}
            >
              "{latest.notes}"
            </Typography>
          </>
        )}

        {/* График динамики */}
        {showChart && chartData.length > 1 && !compact && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Динамика
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} tick={{ fill: '#666' }} />
                  <YAxis fontSize={12} tick={{ fill: '#666' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />

                  {/* Референсные линии норм */}
                  {parameter.normalRange.min && (
                    <ReferenceLine
                      y={parameter.normalRange.min}
                      stroke="#4caf50"
                      strokeDasharray="5 5"
                      label={{ value: 'Мин', position: 'insideTopRight' }}
                    />
                  )}
                  {parameter.normalRange.max && (
                    <ReferenceLine
                      y={parameter.normalRange.max}
                      stroke="#4caf50"
                      strokeDasharray="5 5"
                      label={{ value: 'Макс', position: 'insideTopRight' }}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1976d2"
                    strokeWidth={3}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Сообщение об отсутствии данных */}
        {chartData.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Нет данных для отображения
          </Alert>
        )}

        {/* Краткий график для компактного режима */}
        {showChart && chartData.length > 1 && compact && (
          <Box sx={{ mt: 1, height: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1976d2"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
