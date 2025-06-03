import { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  loadAnalysisResults,
  selectAnalysisStats,
  selectAnalysisLoading,
  selectAnalysisError,
  selectIsInitialized,
} from './store/slices/analysisSlice';

function App() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAnalysisStats);
  const loading = useAppSelector(selectAnalysisLoading);
  const error = useAppSelector(selectAnalysisError);
  const isInitialized = useAppSelector(selectIsInitialized);

  // Загружаем данные при первом рендере
  useEffect(() => {
    if (!isInitialized) {
      dispatch(loadAnalysisResults());
    }
  }, [dispatch, isInitialized]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Медицинский трекер
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading && (
          <Box display="flex" justifyContent="center" mb={2}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            🏥 Добро пожаловать!
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Приложение для отслеживания медицинских анализов
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              ✅ Redux Store подключен и работает
            </Typography>
            <Typography variant="body1">✅ Material-UI настроен</Typography>
            <Typography variant="body1">
              ✅ Данные загружены: {stats.totalResults} результатов анализов
            </Typography>
            <Typography variant="body1">
              ✅ Отклонений от нормы: {stats.abnormalCount}
            </Typography>
            {stats.lastAnalysisDate && (
              <Typography variant="body1">
                ✅ Последний анализ: {stats.lastAnalysisDate}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => dispatch(loadAnalysisResults())}
              disabled={loading}
            >
              Перезагрузить данные
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default App;
