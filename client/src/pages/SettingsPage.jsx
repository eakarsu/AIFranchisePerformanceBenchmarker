import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 28,
  marginBottom: 24,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
  display: 'block',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  fontSize: 14,
  color: '#1e293b',
  boxSizing: 'border-box',
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: '1px solid #f1f5f9',
};

const NOTIFICATION_PREFS = [
  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email alerts for important events' },
  { key: 'smsAlerts', label: 'SMS Alerts', description: 'Get text message alerts for critical updates' },
  { key: 'campaignUpdates', label: 'Campaign Updates', description: 'Notifications when campaigns complete or need attention' },
  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive a weekly summary of your AI performance' },
  { key: 'newContactAlerts', label: 'New Contact Alerts', description: 'Get notified when new contacts are added' },
  { key: 'aiInsights', label: 'AI Insights', description: 'Receive AI-generated insights and recommendations' },
];

const ToggleSwitch = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      width: 48,
      height: 26,
      borderRadius: 13,
      background: checked ? '#6366f1' : '#cbd5e1',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: checked ? 25 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}
    />
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsAlerts: false,
    campaignUpdates: true,
    weeklyReports: true,
    newContactAlerts: false,
    aiInsights: true,
  });

  const handleSaveApiKey = () => {
    setSavingKey(true);
    setTimeout(() => {
      setSavingKey(false);
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    }, 800);
  };

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Settings</h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
          Manage your profile, API keys, and notification preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b' }}>Admin User</div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 2 }}>admin@luranai.com</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input type="text" value="Admin User" readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value="admin@luranai.com" readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          Contact support to update your profile information.
        </div>
      </div>

      {/* API Configuration */}
      <div style={cardStyle}>
        <div style={sectionTitle}>API Configuration</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>OpenRouter API Key</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setKeySaved(false); }}
                style={inputStyle}
                placeholder="sk-or-v1-..."
              />
            </div>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                height: 42,
              }}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
            Your API key is used to authenticate requests to AI models via OpenRouter.
          </div>
        </div>
        <button
          onClick={handleSaveApiKey}
          disabled={savingKey || !apiKey.trim()}
          style={{
            padding: '10px 28px',
            borderRadius: 10,
            border: 'none',
            background: keySaved ? '#10b981' : '#6366f1',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: savingKey || !apiKey.trim() ? 'not-allowed' : 'pointer',
            opacity: savingKey || !apiKey.trim() ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {savingKey ? 'Saving...' : keySaved ? 'Saved successfully!' : 'Save'}
        </button>
      </div>

      {/* Notification Preferences */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Notification Preferences</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {NOTIFICATION_PREFS.map((pref, i) => (
            <div
              key={pref.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: i < NOTIFICATION_PREFS.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{pref.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{pref.description}</div>
              </div>
              <ToggleSwitch
                checked={notifications[pref.key]}
                onChange={() => handleToggle(pref.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          ...cardStyle,
          border: '1px solid #fecaca',
          background: '#fff',
        }}
      >
        <div style={{ ...sectionTitle, color: '#ef4444', borderBottomColor: '#fee2e2' }}>Danger Zone</div>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16, marginTop: 0 }}>
          Once you delete your account, there is no going back. All your data, agents, and conversations will be permanently removed.
        </p>
        <button
          disabled
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#ef4444',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'not-allowed',
            opacity: 0.6,
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
