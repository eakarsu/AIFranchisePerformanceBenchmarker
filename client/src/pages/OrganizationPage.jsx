import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, getById, create, update, remove } from '../services/api';
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
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: '1px solid #f1f5f9',
};

const INDUSTRIES = [
  'Healthcare', 'Dental', 'Finance', 'Real Estate', 'Legal',
  'Insurance', 'Retail', 'Restaurant', 'Automotive', 'Education',
  'Technology', 'Manufacturing', 'Hospitality', 'Construction',
  'Agriculture', 'Other',
];

const PLAN_COLORS = {
  free: { bg: '#f1f5f9', color: '#64748b' },
  starter: { bg: '#dbeafe', color: '#2563eb' },
  pro: { bg: '#ede9fe', color: '#7c3aed' },
  enterprise: { bg: '#fef3c7', color: '#d97706' },
};

const STAT_ITEMS = [
  { key: 'voiceAgents', label: 'Voice Agents', icon: '🎙️', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { key: 'chatAgents', label: 'Chat Agents', icon: '💬', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  { key: 'emailAgents', label: 'Email Agents', icon: '📧', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
  { key: 'contacts', label: 'Contacts', icon: '👥', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  { key: 'conversations', label: 'Conversations', icon: '💭', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { key: 'integrations', label: 'Integrations', icon: '🔌', gradient: 'linear-gradient(135deg, #ef4444, #f43f5e)' },
];

const OrganizationPage = () => {
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', industry: '' });
  const [createForm, setCreateForm] = useState({ name: '', slug: '', industry: '' });
  const [newMember, setNewMember] = useState({ email: '', role: 'member' });

  useEffect(() => {
    fetchOrg();
  }, []);

  const fetchOrg = async () => {
    try {
      const { data } = await getAll('organizations');
      const orgs = Array.isArray(data) ? data : [];
      if (orgs.length > 0) {
        const id = orgs[0]._id || orgs[0].id;
        const { data: orgData } = await getById('organizations', id);
        setOrg(orgData);
        setEditForm({ name: orgData.name || '', industry: orgData.industry || '' });
        fetchMembers(id);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to fetch organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (orgId) => {
    try {
      const { data } = await api.get(`/organizations/${orgId}/members`);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const results = {};
      for (const item of STAT_ITEMS) {
        try {
          const { data } = await getAll(item.key);
          results[item.key] = Array.isArray(data) ? data.length : 0;
        } catch {
          results[item.key] = 0;
        }
      }
      setStats(results);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateOrg = async () => {
    if (!createForm.name.trim()) return;
    try {
      const { data } = await create('organizations', createForm);
      setOrg(data);
      setEditForm({ name: data.name || '', industry: data.industry || '' });
      fetchStats();
    } catch (err) {
      console.error('Failed to create organization:', err);
      alert('Failed to create organization.');
    }
  };

  const handleUpdateOrg = async () => {
    try {
      await update('organizations', org._id || org.id, editForm);
      setOrg((prev) => ({ ...prev, ...editForm }));
      setEditing(false);
    } catch (err) {
      console.error('Failed to update organization:', err);
      alert('Failed to update organization.');
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email.trim()) return;
    const orgId = org._id || org.id;
    try {
      const { data } = await api.post(`/organizations/${orgId}/members`, newMember);
      setMembers((prev) => [...prev, data]);
      setNewMember({ email: '', role: 'member' });
    } catch (err) {
      console.error('Failed to add member:', err);
      alert('Failed to add member.');
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name || member.email}?`)) return;
    const orgId = org._id || org.id;
    const userId = member._id || member.id;
    try {
      await api.delete(`/organizations/${orgId}/members`, { data: { userId } });
      setMembers((prev) => prev.filter((m) => (m._id || m.id) !== userId));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return (email || '?')[0].toUpperCase();
  };

  const getRoleBadge = (role) => {
    const styles = {
      owner: { bg: '#fef3c7', color: '#d97706' },
      admin: { bg: '#dbeafe', color: '#2563eb' },
      member: { bg: '#f1f5f9', color: '#64748b' },
    };
    const s = styles[role] || styles.member;
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}
      >
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading organization...</div>
    );
  }

  // No org: show create form
  if (!org) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Create Organization</h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
            Set up your organization to start collaborating with your team.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Organization Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              style={inputStyle}
              placeholder="Acme Corp"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={createForm.slug}
              onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
              style={inputStyle}
              placeholder="acme-corp"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Industry</label>
            <select
              value={createForm.industry}
              onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select Industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateOrg}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  const planStyle = PLAN_COLORS[(org.plan || 'free').toLowerCase()] || PLAN_COLORS.free;

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Organization</h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
          Manage your organization details, team members, and usage.
        </p>
      </div>

      {/* Details Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={sectionTitle}>Organization Details</div>
          <button
            onClick={() => (editing ? handleUpdateOrg() : setEditing(true))}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: editing ? 'none' : '1px solid #e2e8f0',
              background: editing ? '#6366f1' : '#fff',
              color: editing ? '#fff' : '#6366f1',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Organization Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Industry</label>
              <select
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Name</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{org.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Slug</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{org.slug || '---'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Plan</div>
              <span
                style={{
                  background: planStyle.bg,
                  color: planStyle.color,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {org.plan || 'Free'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Industry</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{org.industry || '---'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Created</div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '---'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Stats Grid */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ ...sectionTitle, padding: '20px 28px 12px', margin: 0 }}>Usage</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {STAT_ITEMS.map((item, i) => (
            <div
              key={item.key}
              style={{
                padding: 24,
                textAlign: 'center',
                borderRight: (i + 1) % 3 !== 0 ? '1px solid #f1f5f9' : 'none',
                borderTop: i >= 3 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: item.gradient,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  marginBottom: 10,
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stats[item.key] ?? 0}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Team Members ({members.length})</div>

        {members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 14 }}>
            No team members yet. Add your first member below.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {members.map((member) => (
              <div
                key={member._id || member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {getInitials(member.name, member.email)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                      {member.name || member.email}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{member.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {getRoleBadge(member.role || 'member')}
                  {(member.role || 'member') !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: '1px solid #fecaca',
                        background: '#fff',
                        color: '#ef4444',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Member Form */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#334155', marginBottom: 12 }}>Add Member</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                style={inputStyle}
                placeholder="colleague@company.com"
              />
            </div>
            <div style={{ width: 140 }}>
              <label style={labelStyle}>Role</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <button
              onClick={handleAddMember}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: '#6366f1',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                height: 42,
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
