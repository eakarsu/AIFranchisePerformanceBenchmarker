import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../services/api';
import api from '../services/api';

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
  transition: 'border-color 0.2s',
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: '1px solid #f1f5f9',
};

const WhiteLabelPage = () => {
  const navigate = useNavigate();
  const [orgId, setOrgId] = useState(null);
  const [noOrg, setNoOrg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    brandName: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4F46E5',
    accentColor: '#7C3AED',
    customDomain: '',
    loginMessage: '',
    emailFrom: '',
    supportEmail: '',
    footerText: '',
  });

  useEffect(() => {
    fetchOrgAndBranding();
  }, []);

  const fetchOrgAndBranding = async () => {
    try {
      const { data } = await getAll('organizations');
      const orgs = Array.isArray(data) ? data : [];
      if (orgs.length === 0) {
        setNoOrg(true);
        return;
      }
      const id = orgs[0]._id || orgs[0].id;
      setOrgId(id);
      try {
        const brandingRes = await api.get(`/organizations/${id}/branding`);
        if (brandingRes.data) {
          setForm((prev) => ({ ...prev, ...brandingRes.data }));
        }
      } catch (err) {
        console.error('Failed to fetch branding:', err);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      setNoOrg(true);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      await api.put(`/organizations/${orgId}/branding`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save branding:', err);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldGroup = (label, key, opts = {}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={opts.type || 'text'}
        value={form[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={opts.placeholder || ''}
        style={inputStyle}
      />
    </div>
  );

  const colorField = (label, key) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={form[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          style={{
            width: 48,
            height: 40,
            padding: 2,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            background: '#fff',
          }}
        />
        <input
          type="text"
          value={form[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          style={{ ...inputStyle, width: 140 }}
          placeholder="#000000"
        />
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: form[key],
            border: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
          title="Live preview"
        />
      </div>
    </div>
  );

  if (noOrg) {
    return (
      <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>White Label</h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
            Customize the branding and appearance of your AI platform.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
            <p style={{ fontSize: 16, marginBottom: 16 }}>No organization found. Please create an organization first.</p>
            <button
              onClick={() => navigate('/organization')}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: '#6366f1',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Go to Organization
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>White Label</h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
          Customize the branding and appearance of your AI platform.
        </p>
      </div>

      {/* Live Preview Banner */}
      <div
        style={{
          ...cardStyle,
          background: `linear-gradient(135deg, ${form.primaryColor}, ${form.accentColor})`,
          color: '#fff',
          textAlign: 'center',
          padding: 32,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Live Preview</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{form.brandName || 'Your Brand Name'}</div>
        <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>
          {form.customDomain || 'app.yourdomain.com'}
        </div>
      </div>

      {/* Brand Identity */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Brand Identity</div>
        {fieldGroup('Brand Name', 'brandName', { placeholder: 'My AI Platform' })}
        {fieldGroup('Logo URL', 'logoUrl', { placeholder: 'https://example.com/logo.png' })}
        {fieldGroup('Favicon URL', 'faviconUrl', { placeholder: 'https://example.com/favicon.ico' })}
      </div>

      {/* Colors */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Colors</div>
        {colorField('Primary Color', 'primaryColor')}
        {colorField('Accent Color', 'accentColor')}
      </div>

      {/* Custom Domain */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Custom Domain</div>
        {fieldGroup('Domain', 'customDomain', { placeholder: 'app.yourdomain.com' })}
        {fieldGroup('Login Page Message', 'loginMessage', { placeholder: 'Welcome to your AI platform' })}
      </div>

      {/* Email Branding */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Email Branding</div>
        {fieldGroup('From Email', 'emailFrom', { type: 'email', placeholder: 'noreply@yourdomain.com' })}
        {fieldGroup('Support Email', 'supportEmail', { type: 'email', placeholder: 'support@yourdomain.com' })}
        {fieldGroup('Footer Text', 'footerText', { placeholder: '(c) 2026 Your Company. All rights reserved.' })}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 12,
          border: 'none',
          background: saved ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        {saving ? 'Saving...' : saved ? 'Saved successfully!' : 'Save Configuration'}
      </button>
    </div>
  );
};

export default WhiteLabelPage;
