import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppLayout from './components/AppLayout';
import FeaturePage from './pages/FeaturePage';
import AICenter from './pages/AICenter';
import AIBenchmarkPage from './pages/AIBenchmarkPage';
import AlertsPage from './pages/AlertsPage';
import GoalsPage from './pages/GoalsPage';
import ExtensionsPage from './pages/ExtensionsPage'; // Apply pass 5
import RoyaltyLeakagePage from './pages/RoyaltyLeakagePage';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticComplianceAuditorReviewingPls from './pages/CfAgenticComplianceAuditorReviewingPls';
import CfDynamicTerritoryOptimizationRecommend from './pages/CfDynamicTerritoryOptimizationRecommend';
import CfRealTimeWebsocketDashboardForCorpor from './pages/CfRealTimeWebsocketDashboardForCorpor';
import CfSupplierBulkBuyAdvisorAggregatingPu from './pages/CfSupplierBulkBuyAdvisorAggregatingPu';
import CfBrandStandardPhotoAuditViaVision from './pages/CfBrandStandardPhotoAuditViaVision';
import CfFranchiseePeerMentoringMarketplaceWi from './pages/CfFranchiseePeerMentoringMarketplaceWi';
import GapNoTerritoryOptimizationAiConsolidati from './pages/GapNoTerritoryOptimizationAiConsolidati';
import GapNoFranchiseeLtvOrChurnPrediction from './pages/GapNoFranchiseeLtvOrChurnPrediction';
import GapNoMarketingSpendOptimizerAcrossUnit from './pages/GapNoMarketingSpendOptimizerAcrossUnit';
import GapNoMultiUnitDemandForecasting from './pages/GapNoMultiUnitDemandForecasting';
import GapNoFranchiseUnitsCrudSurfacedAs from './pages/GapNoFranchiseUnitsCrudSurfacedAs';
import GapNoPaymentbillingIntegration from './pages/GapNoPaymentbillingIntegration';
import GapNoRealTimeWebsocketDashboardUpdates from './pages/GapNoRealTimeWebsocketDashboardUpdates';
import GapNoVendorContractManagement from './pages/GapNoVendorContractManagement';
import GapNoFranchiseeOnboardingWorkflow from './pages/GapNoFranchiseeOnboardingWorkflow';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

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
  { key: 'alert-records', label: 'Alerts', icon: 'shield' },
  { key: 'goals', label: 'OKR Goals', icon: 'target' },
  { key: 'royalty-leakage', label: 'Royalty Leakage', icon: 'dollar' },
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
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout features={features} />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard features={features} />} />
            {features.map(f => (
              <Route key={f.key} path={f.key} element={
                f.key === 'alert-records' ? <AlertsPage /> :
                f.key === 'goals' ? <GoalsPage /> :
                f.key === 'royalty-leakage' ? <RoyaltyLeakagePage /> :
                <FeaturePage feature={f} />
              } />
            ))}
            <Route path="ai-center" element={<AICenter />} />
            <Route path="ai-benchmark" element={<AIBenchmarkPage />} />
            <Route path="extensions" element={<ExtensionsPage />} />{/* Apply pass 5 */}
          </Route>
        
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-compliance-auditor-reviewing-pls" element={<CfAgenticComplianceAuditorReviewingPls />} />
          <Route path="/cf-dynamic-territory-optimization-recommend" element={<CfDynamicTerritoryOptimizationRecommend />} />
          <Route path="/cf-real-time-websocket-dashboard-for-corpor" element={<CfRealTimeWebsocketDashboardForCorpor />} />
          <Route path="/cf-supplier-bulk-buy-advisor-aggregating-pu" element={<CfSupplierBulkBuyAdvisorAggregatingPu />} />
          <Route path="/cf-brand-standard-photo-audit-via-vision" element={<CfBrandStandardPhotoAuditViaVision />} />
          <Route path="/cf-franchisee-peer-mentoring-marketplace-wi" element={<CfFranchiseePeerMentoringMarketplaceWi />} />
          <Route path="/gap-no-territory-optimization-ai-consolidati" element={<GapNoTerritoryOptimizationAiConsolidati />} />
          <Route path="/gap-no-franchisee-ltv-or-churn-prediction" element={<GapNoFranchiseeLtvOrChurnPrediction />} />
          <Route path="/gap-no-marketing-spend-optimizer-across-unit" element={<GapNoMarketingSpendOptimizerAcrossUnit />} />
          <Route path="/gap-no-multi-unit-demand-forecasting" element={<GapNoMultiUnitDemandForecasting />} />
          <Route path="/gap-no-franchise-units-crud-surfaced-as" element={<GapNoFranchiseUnitsCrudSurfacedAs />} />
          <Route path="/gap-no-paymentbilling-integration" element={<GapNoPaymentbillingIntegration />} />
          <Route path="/gap-no-real-time-websocket-dashboard-updates" element={<GapNoRealTimeWebsocketDashboardUpdates />} />
          <Route path="/gap-no-vendor-contract-management" element={<GapNoVendorContractManagement />} />
          <Route path="/gap-no-franchisee-onboarding-workflow" element={<GapNoFranchiseeOnboardingWorkflow />} />
</Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
