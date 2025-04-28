import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import CompaniesPage from './pages/CompaniesPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import IndicatorsPage from './pages/IndicatorsPage';
import LancamentosPage from './pages/LancamentosPage';
import DreConfigPage from './pages/DreConfigPage';
import DrePage from './pages/DrePage';
import DashboardPage from './pages/DashboardPage';
import ConfigDashboardPage from './pages/ConfigDashboardPage';
import VendasPage from './pages/VendasPage';
import ConfigVendasPage from './pages/ConfigVendasPage';
import AnalysePage from './pages/AnalysePage';
import ConfigAnalysePage from './pages/ConfigAnalysePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="indicators" element={<IndicatorsPage />} />
            <Route path="lancamentos" element={<LancamentosPage />} />
            <Route path="dreconfig" element={<DreConfigPage />} />
            <Route path="dre" element={<DrePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="configdashboard" element={<ConfigDashboardPage />} />
            <Route path="vendas" element={<VendasPage />} />
            <Route path="configvendas" element={<ConfigVendasPage />} />
            <Route path="analysis" element={<AnalysePage />} />
            <Route path="configanalysis" element={<ConfigAnalysePage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;