import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';

const featureDescriptions = {
  'franchise-units': 'Monitor and score individual franchise unit performance',
  'revenue-records': 'AI-powered revenue predictions and trend analysis',
  'competitors': 'Deep analysis of competitive landscape and threats',
  'market-expansion': 'Identify optimal locations for franchise growth',
  'staff-members': 'Optimize staffing levels and workforce efficiency',
  'customer-reviews': 'AI sentiment analysis of customer feedback',
  'supply-chain': 'Optimize supply chain operations and costs',
  'training-programs': 'AI-recommended training for staff development',
  'menu-items': 'Optimize product mix for maximum profitability',
  'financial-records': 'Comprehensive AI financial health auditing',
  'marketing-campaigns': 'AI-generated marketing campaign strategies',
  'compliance-records': 'Automated compliance monitoring and alerts',
  'trip-plans': 'AI day-by-day trip planning with detailed budgets',
  'benchmark-reports': 'Compare performance against industry benchmarks',
  'franchise-valuations': 'AI-estimated franchise unit valuations',
};

const featureIcons = {
  'franchise-units': '🏢',
  'revenue-records': '💰',
  'competitors': '⚔️',
  'market-expansion': '🗺️',
  'staff-members': '👥',
  'customer-reviews': '⭐',
  'supply-chain': '🔗',
  'training-programs': '🎓',
  'menu-items': '🍽️',
  'financial-records': '📊',
  'marketing-campaigns': '📣',
  'compliance-records': '✅',
  'trip-plans': '✈️',
  'benchmark-reports': '📈',
  'franchise-valuations': '💎',
};

const featureGradients = [
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
  'linear-gradient(135deg, #ef4444, #f43f5e)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #84cc16, #10b981)',
  'linear-gradient(135deg, #e879f9, #8b5cf6)',
  'linear-gradient(135deg, #f97316, #ef4444)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
  'linear-gradient(135deg, #6366f1, #ec4899)',
  'linear-gradient(135deg, #22c55e, #84cc16)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f43f5e, #f59e0b)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
];

const Dashboard = ({ features }) => {
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalRevenue: 0,
    totalStaff: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const statCards = [
    {
      label: 'Total Units',
      value: stats.totalUnits,
      icon: '🏢',
      accent: '#3b82f6',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      accent: '#10b981',
    },
    {
      label: 'Total Staff',
      value: stats.totalStaff,
      icon: '👥',
      accent: '#f59e0b',
    },
    {
      label: 'Avg Rating',
      value: Number(stats.avgRating)?.toFixed(1) || '0.0',
      icon: '⭐',
      accent: '#8b5cf6',
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>AI-Powered Franchise Intelligence</p>
      </div>

      <div className="card-grid stats-grid">
        {statCards.map((card) => (
          <div
            className="stat-card"
            key={card.label}
            style={{ borderTop: `4px solid ${card.accent}` }}
          >
            <div className="stat-card-icon">{card.icon}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">
              {loading ? '...' : card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card-grid">
        {features &&
          features.map((feature, index) => (
            <div
              className="feature-card"
              key={feature.key}
              style={{
                borderTop: `4px solid transparent`,
                borderImage: `${featureGradients[index % featureGradients.length]} 1`,
              }}
              onClick={() => navigate(`/${feature.key}`)}
            >
              <div className="feature-card-icon">
                {featureIcons[feature.key] || '📋'}
              </div>
              <div className="feature-card-title">{feature.label}</div>
              <div className="feature-card-description">
                {featureDescriptions[feature.key] || 'Manage and analyze data'}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
