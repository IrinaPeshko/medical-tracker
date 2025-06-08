import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Typography,
  Popper,
  ClickAwayListener,
  Divider,
  IconButton,
  ListItemButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

import { useAppSelector } from '../../../store/hooks';
import { selectAnalysisResults } from '../../../store/slices/analysisSlice';
import { PARAMETERS, CATEGORIES } from '../../../config';
import { AnalysisUtils } from '../../../utils';
import type { Parameter, AnalysisResult, CategoryType } from '../../../types';

interface SearchResult {
  type: 'parameter' | 'result' | 'category';
  id: string;
  title: string;
  subtitle: string;
  category?: CategoryType;
  status?: 'normal' | 'high' | 'low' | 'attention';
  value?: string;
  date?: string;
  data: Parameter | AnalysisResult | (typeof CATEGORIES)[0];
}

interface GlobalSearchProps {
  onResultClick: (result: SearchResult) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const analysisResults = useAppSelector(selectAnalysisResults);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    const matchedParamIds = new Set<string>();

    // Поиск по параметрам
    PARAMETERS.forEach((param) => {
      if (param.name.toLowerCase().includes(lowerQuery)) {
        // Если найдена запись по имени параметра — запомним её id
        matchedParamIds.add(param.id);

        // Возьмем самый свежий (latest) результат по этому параметру
        const latest = AnalysisUtils.getLatestResult(analysisResults, param.id);
        const status = latest
          ? AnalysisUtils.checkNormal(latest.value, param.id, 'female')
          : undefined;

        searchResults.push({
          type: 'parameter',
          id: param.id,
          title: param.name,
          subtitle: `Категория: ${CATEGORIES.find((c) => c.id === param.category)?.name}`,
          category: param.category,
          status,
          value: latest
            ? AnalysisUtils.formatValue(latest.value, latest.unit)
            : undefined,
          date: latest?.date,
          data: param,
        });
      }
    });

    // Поиск по категориям
    CATEGORIES.forEach((category) => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        const categoryResults = analysisResults.filter(
          (r) => r.categoryId === category.id
        );

        searchResults.push({
          type: 'category',
          id: category.id,
          title: category.name,
          subtitle: `${categoryResults.length} результатов`,
          category: category.id,
          data: category,
        });
      }
    });

    // 3) Блок «Поиск по результатам (заметки)»
    //    Пропустим те результаты, у которых параметр уже найден в matchedParamIds.
    analysisResults
      .filter((result) => {
        // Если параметр уже попал в блок “parameter”, не дублируем его здесь
        if (matchedParamIds.has(result.parameterId)) {
          return false;
        }

        // Иначе проверяем: либо совпадение по notes, либо совпадение по имени параметра
        const param = PARAMETERS.find((p) => p.id === result.parameterId);
        if (!param) return false;

        return (
          result.notes?.toLowerCase().includes(lowerQuery) ||
          param.name.toLowerCase().includes(lowerQuery)
        );
      })
      // Если нужно показывать только один (самый свежий) результат на каждый параметр,
      // то можно дополнительно сгруппировать по parameterId и взять первый (latest) – вот простой способ:
      .reduce<AnalysisResult[]>((acc, cur) => {
        // Проверим, есть ли уже результат по этому parameterId в acc
        const exists = acc.some((r) => r.parameterId === cur.parameterId);
        if (!exists) {
          acc.push(cur);
        }
        return acc;
      }, [])
      // Сортируем те “уникальные” по параметру результаты по дате (чтобы выбирать самый свежий)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // И уже взяв «уникальные» (по одному на параметр), ограничим количество (например, макс. 5)
      .slice(0, 5)
      .forEach((result) => {
        const param = PARAMETERS.find((p) => p.id === result.parameterId)!;
        const status = AnalysisUtils.checkNormal(
          result.value,
          result.parameterId,
          'female'
        );

        searchResults.push({
          type: 'result',
          id: result.id,
          title: param.name,
          subtitle: `${new Date(result.date).toLocaleDateString('ru-RU')}${
            result.notes ? ` • ${result.notes.slice(0, 50)}...` : ''
          }`,
          category: result.categoryId,
          status,
          value: AnalysisUtils.formatValue(result.value, result.unit),
          date: result.date,
          data: result,
        });
      });

    // 4) Сортировка: сначала категории, потом параметры, потом результаты
    searchResults.sort((a, b) => {
      const order = { category: 0, parameter: 1, result: 2 };
      return order[a.type] - order[b.type];
    });

    setResults(searchResults.slice(0, 10)); // Максимум 10 результатов
    setIsOpen(searchResults.length > 0);
  }, [query, analysisResults]);

  const handleInputFocus = (event: React.FocusEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    onResultClick(result);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'category') {
      return <CategoryIcon color="primary" fontSize="small" />;
    }

    if (result.type === 'parameter' || result.type === 'result') {
      switch (result.status) {
        case 'high':
        case 'low':
        case 'attention':
          return <WarningIcon color="error" fontSize="small" />;
        case 'normal':
          return <TrendingUpIcon color="success" fontSize="small" />;
        default:
          return null;
      }
    }
    return null;
  };

  const getResultChip = (result: SearchResult) => {
    if (result.type === 'category') {
      return <Chip label="Категория" size="small" color="primary" />;
    }

    if (result.status) {
      const color = result.status === 'normal' ? 'success' : 'error';
      const label = AnalysisUtils.getStatusText(result.status);
      return <Chip label={label} size="small" color={color} />;
    }

    return null;
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        <TextField
          fullWidth
          placeholder="Поиск по анализам, параметрам, категориям..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClear}
                  size="small"
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
        >
          <Paper elevation={8} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            {results.length > 0 ? (
              <List dense>
                {results.map((result, index) => (
                  <React.Fragment key={`${result.type}-${result.id}`}>
                    <ListItem
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleResultClick(result)}
                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <Box sx={{ mr: 1 }}>{getResultIcon(result)}</Box>

                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {result.title}
                              </Typography>
                              {result.value && (
                                <Typography variant="body2" color="primary">
                                  {result.value}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={result.subtitle}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            color: 'textSecondary',
                          }}
                        />

                        <ListItemSecondaryAction>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {getResultChip(result)}
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    </ListItem>

                    {index < results.length - 1 && <Divider />}
                  </React.Fragment>
                ))}

                {results.length === 10 && (
                  <>
                    <Divider />
                    <Box sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Показаны первые 10 результатов
                      </Typography>
                    </Box>
                  </>
                )}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Ничего не найдено
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};
