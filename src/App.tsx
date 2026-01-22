import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, Box, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import './i18n/config';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const EmployeesListPage = lazy(() => import('./pages/employees/EmployeesListPage').then(m => ({ default: m.EmployeesListPage })));
const EmployeeFormPage = lazy(() => import('./pages/employees/EmployeeFormPage').then(m => ({ default: m.EmployeeFormPage })));
const RestaurantsListPage = lazy(() => import('./pages/restaurants/RestaurantsListPage').then(m => ({ default: m.RestaurantsListPage })));
const RestaurantFormPage = lazy(() => import('./pages/restaurants/RestaurantFormPage').then(m => ({ default: m.RestaurantFormPage })));
const RestaurantQRPage = lazy(() => import('./pages/restaurants/RestaurantQRPage').then(m => ({ default: m.RestaurantQRPage })));
const DictionariesPage = lazy(() => import('./pages/dictionaries/DictionariesPage').then(m => ({ default: m.DictionariesPage })));
const StatisticsPage = lazy(() => import('./pages/statistics/StatisticsPage').then(m => ({ default: m.StatisticsPage })));

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/restaurants" replace />} />
                  
                  {/* Restaurants */}
                  <Route path="restaurants" element={<RestaurantsListPage />} />
                  <Route path="restaurants/new" element={<RestaurantFormPage />} />
                  <Route path="restaurants/:id/edit" element={<RestaurantFormPage />} />
                  <Route path="restaurants/:id/qr" element={<RestaurantQRPage />} />

                  {/* Employees */}
                  <Route path="employees" element={<EmployeesListPage />} />
                  <Route path="employees/new" element={<EmployeeFormPage />} />
                  <Route path="employees/:id/edit" element={<EmployeeFormPage />} />

                  {/* Dictionaries */}
                  <Route path="dictionaries/:dictKey" element={<DictionariesPage />} />

                  {/* Statistics */}
                  <Route path="statistics/:section" element={<StatisticsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
