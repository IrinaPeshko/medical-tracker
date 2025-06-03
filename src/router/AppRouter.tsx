import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useRouteError,
} from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

import { Dashboard, CategoryView } from '../pages';
import { LoadingSpinner, ErrorAlert } from '../components/ui';
import { AddResultForm } from '../components/forms';
import { NotificationContainer } from '../components/notifications';

const Layout: React.FC = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Медицинский трекер
          </Typography>
        </Toolbar>
      </AppBar>
      <Outlet />

      <AddResultForm />
      <NotificationContainer />
    </>
  );
};

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  console.error('Router error:', error);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ErrorAlert
        error="Страница не найдена"
        title="Ошибка 404"
        severity="warning"
      />
    </Container>
  );
};

const PageLoader: React.FC = () => {
  return <LoadingSpinner fullScreen message="Загрузка страницы..." />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'category/:categoryId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CategoryView />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return (
    <Suspense
      fallback={
        <LoadingSpinner fullScreen message="Инициализация роутера..." />
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
};
