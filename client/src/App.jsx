import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppLayout from './components/AppLayout';
import FeaturePage from './pages/FeaturePage';
import AICenter from './pages/AICenter';

const features = [
  { key: 'franchise-units', label: 'Franchise Units', icon: 'building' },
  { key: 'revenue-records', label: 'Revenue Forecasting', icon: 'chart' },
  { key: 'competitors', label: 'Competitor Analysis', icon: 'target' },
  { key: 'market-expansion', label: 'Market Expansion', icon: 'globe' },
  { key: 'staff-members', label: 'Staff Optimization', icon: 'users' },
  { key: 'customer-reviews', label: 'Customer Sentiment', icon: 'star' },
  { key: 'supply-chain', label: 'Supply Chain', icon: 'truck' },
  { key: 'training-programs', label: 'Training Programs', icon: 'book' },
  { key: 'menu-items', label: 'Menu Optimization', icon: 'menu' },
  { key: 'financial-records', label: 'Financial Health', icon: 'dollar' },
  { key: 'marketing-campaigns', label: 'Marketing Campaigns', icon: 'megaphone' },
  { key: 'compliance-records', label: 'Compliance Monitor', icon: 'shield' },
  { key: 'trip-plans', label: 'Trip Planning', icon: 'plane' },
  { key: 'benchmark-reports', label: 'Benchmarking', icon: 'bar-chart' },
  { key: 'franchise-valuations', label: 'Franchise Valuation', icon: 'gem' },
];

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout features={features} />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard features={features} />} />
            {features.map(f => (
              <Route key={f.key} path={f.key} element={<FeaturePage feature={f} />} />
            ))}
            <Route path="ai-center" element={<AICenter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
