import React, { useEffect } from 'react';
import { Snackbar, Alert, AlertTitle, Box } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectNotifications,
  removeNotification,
} from '../../../store/slices/uiSlice';

export const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  // Автоматически скрываем уведомления с autoHide
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoHide && notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  const handleClose = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={
            notification.autoHide ? notification.duration : null
          }
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity={notification.type}
            onClose={() => handleClose(notification.id)}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <AlertTitle>{notification.title}</AlertTitle>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};
