import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorAlertProps {
  error: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  severity?: 'error' | 'warning' | 'info';
  variant?: 'filled' | 'outlined' | 'standard';
  sx?: SxProps<Theme>;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title = 'Произошла ошибка',
  onRetry,
  retryText = 'Повторить',
  severity = 'error',
  variant = 'standard',
  sx,
}) => {
  return (
    <Alert
      severity={severity}
      variant={variant}
      sx={{
        mb: 2,
        '& .MuiAlert-message': {
          width: '100%',
        },
        ...sx,
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box flex={1}>{error}</Box>

        {onRetry && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ ml: 2, flexShrink: 0 }}
          >
            {retryText}
          </Button>
        )}
      </Box>
    </Alert>
  );
};
