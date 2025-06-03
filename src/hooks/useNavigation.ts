import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import {
  setSelectedCategory,
  clearSelectedCategory,
} from '../store/slices/uiSlice';
import type { CategoryType } from '../types/analysis';

/**
 * Кастомный хук для навигации по приложению
 */
export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useAppDispatch();

  /**
   * Переход на главную страницу
   */
  const goToDashboard = () => {
    dispatch(clearSelectedCategory());
    navigate('/');
  };

  /**
   * Переход к странице категории
   */
  const goToCategory = (categoryId: CategoryType) => {
    dispatch(setSelectedCategory(categoryId));
    navigate(`/category/${categoryId}`);
  };

  /**
   * Переход назад
   */
  const goBack = () => {
    navigate(-1);
  };

  /**
   * Переход вперед
   */
  const goForward = () => {
    navigate(1);
  };

  /**
   * Проверка, находимся ли мы на главной странице
   */
  const isOnDashboard = location.pathname === '/';

  /**
   * Проверка, находимся ли мы на странице категории
   */
  const isOnCategory = location.pathname.startsWith('/category/');

  /**
   * Получение текущего categoryId из URL
   */
  const currentCategoryId = params.categoryId as CategoryType | undefined;

  /**
   * Получение текущего пути
   */
  const currentPath = location.pathname;

  return {
    // Навигация
    goToDashboard,
    goToCategory,
    goBack,
    goForward,

    // Состояние
    isOnDashboard,
    isOnCategory,
    currentCategoryId,
    currentPath,

    // Прямой доступ к хукам React Router
    navigate,
    location,
    params,
  };
};
