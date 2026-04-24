import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, create, remove } from '../services/api';
import api from '../services/api';

const CONNECTORS = [
  {
    id: 'dentrix',
    name: 'Dentrix',
    provider: 'Henry Schein',
    icon: '🦷',
    industry: 'Dental',
    description: 'Sync patient records, appointments, and billing from Dentrix practice management software.',
    features: ['Patient Sync', 'Appointment Booking', 'Insurance Verification', 'Billing Integration'],
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'practiceId', label: 'Practice ID', type: 'text' },
      { key: 'syncInterval', label: 'Sync Interval (min)', type: 'number' },
    ],
  },
  {
    id: 'open-dental',
    name: 'Open Dental',
    provider: 'Open Dental Software',
    icon: '🏥',
    industry: 'Dental',
    description: 'Connect to Open Dental for seamless patient management and scheduling automation.',
    features: ['Patient Records', 'Scheduling', 'Treatment Plans', 'E-Claims'],
    configFields: [
      { key: 'serverUrl', label: 'Server URL', type: 'text' },
      { key: 'apiToken', label: 'API Token', type: 'text' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    provider: 'Twilio Inc.',
    icon: '📱',
    industry: 'Communications',
    description: 'Enable SMS, voice calls, and WhatsApp messaging through Twilio cloud communications.',
    features: ['SMS Messaging', 'Voice Calls', 'WhatsApp', 'Call Recording'],
    configFields: [
      { key: 'accountSid', label: 'Account SID', type: 'text' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'phoneNumber', label: 'Phone Number', type: 'text' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    provider: 'Stripe Inc.',
    icon: '💳',
    industry: 'Finance',
    description: 'Process payments, manage subscriptions, and handle invoicing with Stripe.',
    features: ['Payment Processing', 'Subscriptions', 'Invoicing', 'Refunds'],
    configFields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    provider: 'Google',
    icon: '📅',
    industry: 'Productivity',
    description: 'Sync appointments and schedules with Google Calendar for automated booking.',
    features: ['Calendar Sync', 'Event Creation', 'Availability Check', 'Reminders'],
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'calendarId', label: 'Calendar ID', type: 'text' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    provider: 'Salesforce Inc.',
    icon: '☁️',
    industry: 'CRM',
    description: 'Integrate with Salesforce CRM for lead management, contact sync, and pipeline tracking.',
    features: ['Lead Management', 'Contact Sync', 'Pipeline Tracking', 'Reporting'],
    configFields: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'text' },
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'username', label: 'Username', type: 'text' },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    provider: 'HubSpot Inc.',
    icon: '🔶',
    industry: 'CRM',
    description: 'Connect HubSpot for marketing automation, CRM, and customer engagement workflows.',
    features: ['CRM Sync', 'Email Marketing', 'Deal Tracking', 'Form Submissions'],
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'portalId', label: 'Portal ID', type: 'text' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    provider: 'Intuit Mailchimp',
    icon: '📧',
    industry: 'Marketing',
    description: 'Automate email campaigns, manage audiences, and track engagement with Mailchimp.',
    features: ['Email Campaigns', 'Audience Sync', 'Automation', 'Analytics'],
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'listId', label: 'Audience List ID', type: 'text' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    provider: 'Zapier Inc.',
    icon: '⚡',
    industry: 'Automation',
    description: 'Connect to 5000+ apps through Zapier webhooks and automated workflows.',
    features: ['Webhook Triggers', 'Multi-step Zaps', 'Data Mapping', 'Error Handling'],
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text' },
      { key: 'apiKey', label: 'API Key', type: 'text' },
    ],
  },
];

const INDUSTRIES = ['All', ...Array.from(new Set(CONNECTORS.map((c) => c.industry)))];

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  transition: 'box-shadow 0.2s',
};

const IntegrationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [configuring, setConfiguring] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnected();
  }, []);

  const fetchConnected = async () => {
    try {
      const { data } = await getAll('integrations');
      setConnected(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectedIds = connected.map((c) => c.connectorId || c.name?.toLowerCase().replace(/\s+/g, '-'));

  const filteredConnectors =
    industryFilter === 'All'
      ? CONNECTORS
      : CONNECTORS.filter((c) => c.industry === industryFilter);

  const handleConfigure = (connector) => {
    if (configuring === connector.id) {
      setConfiguring(null);
      setConfigValues({});
    } else {
      setConfiguring(connector.id);
      const defaults = {};
      connector.configFields.forEach((f) => (defaults[f.key] = ''));
      setConfigValues(defaults);
    }
  };

  const handleSaveConfig = async (connector) => {
    try {
      await create('integrations', {
        connectorId: connector.id,
        name: connector.name,
        provider: connector.provider,
        type: connector.industry,
        config: configValues,
      });
      setConfiguring(null);
      setConfigValues({});
      fetchConnected();
    } catch (err) {
      console.error('Failed to save config:', err);
      alert(`Failed to save configuration for ${connector.name}.`);
    }
  };

  const handleDisconnect = async (integration) => {
    if (!window.confirm(`Disconnect ${integration.name || integration.type}?`)) return;
    try {
      await remove('integrations', integration._id || integration.id);
      fetchConnected();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const tabStyle = (active) => ({
    padding: '10px 24px',
    border: 'none',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#64748b',
    fontWeight: 600,
    fontSize: 14,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Integrations</h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
          Connect your favorite tools and services to supercharge your AI workflows.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 12,
          width: 'fit-content',
        }}
      >
        <button style={tabStyle(activeTab === 'marketplace')} onClick={() => setActiveTab('marketplace')}>
          Marketplace
        </button>
        <button style={tabStyle(activeTab === 'connected')} onClick={() => setActiveTab('connected')}>
          Connected ({connected.length})
        </button>
      </div>

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <>
          {/* Industry Filter */}
          <div style={{ marginBottom: 24 }}>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                fontSize: 14,
                color: '#334155',
                background: '#fff',
                cursor: 'pointer',
                minWidth: 200,
              }}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'All' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>

          {/* Connector Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filteredConnectors.map((connector) => {
              const isConnected = connectedIds.includes(connector.id);
              const isConfiguring = configuring === connector.id;

              return (
                <div key={connector.id} style={{ ...cardStyle, boxShadow: isConfiguring ? '0 4px 24px rgba(99,102,241,0.12)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}
                    >
                      {connector.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{connector.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{connector.provider}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{connector.description}</p>

                  {/* Industry Tag */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#ede9fe',
                        color: '#6366f1',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {connector.industry}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {connector.features.map((f) => (
                      <div key={f} style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontSize: 14 }}>&#10003;</span>
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Configure / Connected Button */}
                  <button
                    onClick={() => !isConnected && handleConfigure(connector)}
                    style={{
                      marginTop: 'auto',
                      padding: '10px 0',
                      borderRadius: 10,
                      border: isConnected ? '1px solid #10b981' : '1px solid #6366f1',
                      background: isConnected ? '#ecfdf5' : isConfiguring ? '#6366f1' : '#fff',
                      color: isConnected ? '#10b981' : isConfiguring ? '#fff' : '#6366f1',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: isConnected ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isConnected ? 'Connected' : isConfiguring ? 'Close' : 'Configure'}
                  </button>

                  {/* Inline Config Form */}
                  {isConfiguring && (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: 12,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        borderTop: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Configuration</div>
                      {connector.configFields.map((field) => (
                        <div key={field.key}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                            {field.label}
                          </label>
                          <input
                            type={field.type || 'text'}
                            value={configValues[field.key] || ''}
                            onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              fontSize: 13,
                              boxSizing: 'border-box',
                            }}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => handleSaveConfig(connector)}
                        style={{
                          padding: '10px 0',
                          borderRadius: 10,
                          border: 'none',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        Save Configuration
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Connected Tab */}
      {activeTab === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Loading connected integrations...</div>
          ) : connected.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div>
              <div style={{ fontWeight: 600, color: '#334155', fontSize: 16 }}>No Connected Integrations</div>
              <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                Head to the Marketplace tab to connect your first integration.
              </div>
            </div>
          ) : (
            connected.map((integration) => (
              <div
                key={integration._id || integration.id}
                style={{
                  ...cardStyle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {(integration.name || integration.type || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>
                      {integration.name || integration.type}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {integration.type && <span>Type: {integration.type} &middot; </span>}
                      {integration.provider && <span>Provider: {integration.provider} &middot; </span>}
                      Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(integration)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: '1px solid #fecaca',
                    background: '#fff',
                    color: '#ef4444',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Disconnect
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
