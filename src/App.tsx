import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { AuthGuard } from './components/guards/AuthGuard';
import Login from './pages/Auth/Login';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeeAudit from './pages/Employees/EmployeeAudit';
import RestaurantList from './pages/Restaurants/RestaurantList';
import RestaurantForm from './pages/Restaurants/RestaurantForm';
import RestaurantQR from './pages/Restaurants/RestaurantQR';
import RestaurantAudit from './pages/Restaurants/RestaurantAudit';
import DictionariesPage from './pages/Dictionaries/DictionariesPage';
import StatisticsPage from './pages/Statistics/StatisticsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/employees" replace />} />
          
          {/* Employees */}
          <Route
            path="/employees"
            element={
              <AuthGuard>
                <EmployeeList />
              </AuthGuard>
            }
          />
          <Route
            path="/employees/new"
            element={
              <AuthGuard>
                <EmployeeForm />
              </AuthGuard>
            }
          />
          <Route
            path="/employees/:id/edit"
            element={
              <AuthGuard>
                <EmployeeForm />
              </AuthGuard>
            }
          />
          <Route
            path="/employees/:id/audit"
            element={
              <AuthGuard>
                <EmployeeAudit />
              </AuthGuard>
            }
          />

          {/* Restaurants */}
          <Route
            path="/restaurants"
            element={
              <AuthGuard>
                <RestaurantList />
              </AuthGuard>
            }
          />
          <Route
            path="/restaurants/new"
            element={
              <AuthGuard>
                <RestaurantForm />
              </AuthGuard>
            }
          />
          <Route
            path="/restaurants/:id/edit"
            element={
              <AuthGuard>
                <RestaurantForm />
              </AuthGuard>
            }
          />
          <Route
            path="/restaurants/:id/qr"
            element={
              <AuthGuard>
                <RestaurantQR />
              </AuthGuard>
            }
          />
          <Route
            path="/restaurants/:id/audit"
            element={
              <AuthGuard>
                <RestaurantAudit />
              </AuthGuard>
            }
          />

          {/* Dictionaries */}
          <Route
            path="/dictionaries"
            element={
              <AuthGuard>
                <DictionariesPage />
              </AuthGuard>
            }
          />

          {/* Statistics */}
          <Route
            path="/statistics"
            element={
              <AuthGuard>
                <StatisticsPage />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
