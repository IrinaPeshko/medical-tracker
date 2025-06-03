import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

import type { CategoryType } from '../../../types/analysis';
import type { Category } from '../../../types/analysis';

interface CategoryCardProps {
  category: Category;
  resultCount: number;
  abnormalCount: number;
  lastResultDate?: string;
  onClick: (categoryId: CategoryType) => void;
  onMenuClick?: (categoryId: CategoryType) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  resultCount,
  abnormalCount,
  lastResultDate,
  onClick,
  onMenuClick,
}) => {
  const handleCardClick = () => {
    onClick(category.id);
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onMenuClick) {
      onMenuClick(category.id);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    // В реальном приложении здесь будет маппинг иконок MUI
    // Пока используем эмодзи из конфигурации
    const iconMap: Record<string, string> = {
      BloodtypeIcon: '🩸',
      ScienceIcon: '🧪',
      CameraAltIcon: '📷',
      BiotechIcon: '🔬',
      MedicationIcon: '💊',
      FavoriteIcon: '💗',
      VisibilityIcon: '👁️',
    };

    return iconMap[iconName] || '📊';
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Заголовок с иконкой и меню */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box
            sx={{
              fontSize: '2rem',
              lineHeight: 1,
            }}
          >
            {getCategoryIcon(category.icon)}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {abnormalCount > 0 && (
              <Chip
                size="small"
                label={`${abnormalCount} отклонений`}
                color="error"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
            {onMenuClick && (
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{ p: 0.5 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Название категории */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {category.name}
        </Typography>

        {/* Описание */}
        {category.description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: 2, fontSize: '0.875rem' }}
          >
            {category.description}
          </Typography>
        )}

        {/* Статистика */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {resultCount} результатов
          </Typography>
          {lastResultDate && (
            <Typography variant="caption" color="textSecondary">
              Последний: {new Date(lastResultDate).toLocaleDateString('ru-RU')}
            </Typography>
          )}
        </Box>

        {/* Дополнительная информация */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            size="small"
            label={category.frequency || 'По показаниям'}
            sx={{
              backgroundColor: `${category.color}20`,
              color: category.color,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          />

          {resultCount > 0 && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{ fontWeight: 500 }}
            >
              Посмотреть →
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
