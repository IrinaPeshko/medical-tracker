import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              backgroundColor: `${color}20`,
              color: color,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Typography color="textSecondary" variant="body2" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            {description && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
