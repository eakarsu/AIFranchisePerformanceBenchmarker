import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, create, update, remove } from '../services/api';
import api from '../services/api';

const triggerLabels = {
  schedule: 'Scheduled',
  webhook: 'Webhook',
  manual: 'Manual',
  event: 'Event-Based',
  form: 'Form Submission',
  api: 'API Call',
};

const industryEmojis = {
  Dentistry: '🦷',
  Restaurants: '🍽️',
  'Health Clinics': '🏥',
  'Real Estate': '🏠',
  'Car Dealerships': '🚗',
  Hospitality: '🏨',
  Insurance: '🛡️',
  Legal: '⚖️',
  'Home Services': '🔧',
  'Debt Collection': '💳',
  Pharmacy: '💊',
  Fitness: '💪',
  Education: '📚',
  'Pet Care': '🐾',
  Accounting: '📊',
  Salon: '💇',
  'Auto Repair': '🔩',
};

const STATUS_COLORS = {
  active: { bg: '#ecfdf5', color: '#059669', label: 'Active' },
  paused: { bg: '#fef9c3', color: '#ca8a04', label: 'Paused' },
  draft: { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
  error: { bg: '#fef2f2', color: '#dc2626', label: 'Error' },
};

function StatusBadge({ status }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

const styles = {
  container: {
    padding: '32px',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0,
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0',
  },
  workflowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    marginBottom: '48px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  cardEmoji: {
    fontSize: '28px',
  },
  cardName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  cardIndustry: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
  },
  cardTrigger: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  stepsCount: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  cardDate: {
    fontSize: '12px',
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    transition: 'all 0.15s',
  },
  editBtn: {
    background: '#f0f4ff',
    color: '#6366f1',
    border: '1px solid #c7d2fe',
  },
  pauseBtn: {
    background: '#fffbeb',
    color: '#d97706',
    border: '1px solid #fde68a',
  },
  deleteBtn: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
  },
  filterPill: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    transition: 'all 0.15s',
  },
  filterPillActive: {
    background: '#6366f1',
    color: '#ffffff',
    border: '1px solid #6366f1',
  },
  industrySection: {
    marginBottom: '20px',
  },
  industrySectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.15s',
  },
  industrySectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  chevron: {
    fontSize: '14px',
    color: '#94a3b8',
    transition: 'transform 0.2s',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    paddingLeft: '12px',
    marginBottom: '8px',
  },
  templateCard: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '20px',
  },
  templateHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  templateName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
  },
  templateBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    background: '#f1f5f9',
    color: '#64748b',
  },
  deployedBadge: {
    background: '#ecfdf5',
    color: '#059669',
  },
  templateDescription: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  stepsPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  stepChip: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    background: '#f1f5f9',
    color: '#475569',
  },
  templateMeta: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '16px',
  },
  deployBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  blankBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    transition: 'all 0.15s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    marginBottom: '48px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#64748b',
  },
};

export default function WorkflowsPage() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedIndustries, setExpandedIndustries] = useState({});
  const [deploying, setDeploying] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wfRes, tplRes] = await Promise.all([
        getAll('workflows'),
        api.get('/workflows/templates').catch(() => ({ data: [] })),
      ]);
      setWorkflows(wfRes.data || []);
      setTemplates(tplRes.data || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group templates by industry
  const templatesByIndustry = templates.reduce((acc, tpl) => {
    const industry = tpl.industry || 'General';
    if (!acc[industry]) acc[industry] = [];
    acc[industry].push(tpl);
    return acc;
  }, {});

  // If no templates from API, use built-in defaults
  const FALLBACK_TEMPLATES = {
    Dentistry: [
      {
        name: 'Patient Appointment Reminder',
        description: 'Automated reminders for upcoming dental appointments via SMS and email.',
        nodes: ['Trigger: 24h before', 'Send SMS', 'Wait 2h', 'Send Email', 'Update CRM'],
        connections: 4,
      },
      {
        name: 'New Patient Onboarding',
        description: 'Welcome sequence for new dental patients with forms and scheduling.',
        nodes: ['Form Submitted', 'Create Contact', 'Send Welcome Email', 'Schedule Call', 'Assign Agent'],
        connections: 4,
      },
    ],
    Restaurants: [
      {
        name: 'Reservation Confirmation',
        description: 'Confirm reservations and send reminders to diners.',
        nodes: ['Booking Received', 'Verify Availability', 'Send Confirmation SMS', 'Add to Calendar'],
        connections: 3,
      },
      {
        name: 'Feedback Collection',
        description: 'Post-visit surveys with sentiment analysis and escalation.',
        nodes: ['Visit Completed', 'Wait 1h', 'Send Survey SMS', 'Analyze Sentiment', 'Flag Negative'],
        connections: 4,
      },
    ],
    'Health Clinics': [
      {
        name: 'Appointment Follow-Up',
        description: 'Post-visit follow-up and next appointment scheduling.',
        nodes: ['Visit Ended', 'Wait 24h', 'Send Follow-Up Email', 'Schedule Next Visit', 'Update Record'],
        connections: 4,
      },
      {
        name: 'Prescription Reminder',
        description: 'Refill reminders with pharmacy notification workflow.',
        nodes: ['Refill Date Check', 'Send SMS Reminder', 'Wait Response', 'Notify Pharmacy', 'Confirm Pickup'],
        connections: 4,
      },
    ],
    'Real Estate': [
      {
        name: 'Lead Nurture Sequence',
        description: 'Qualify leads and send targeted property listings.',
        nodes: ['Lead Captured', 'AI Qualify', 'Send Listings Email', 'Schedule Showing', 'Follow Up Call'],
        connections: 4,
      },
      {
        name: 'Open House Follow-Up',
        description: 'Post open house engagement and agent assignment.',
        nodes: ['Attendee Check-In', 'Send Thank You', 'AI Score Interest', 'Assign Agent', 'Schedule Tour'],
        connections: 4,
      },
    ],
    'Car Dealerships': [
      {
        name: 'Test Drive Follow-Up',
        description: 'Personalized follow-up after test drives with AI offers.',
        nodes: ['Test Drive Completed', 'Send Thank You SMS', 'Wait 1 Day', 'AI Personalized Offer', 'Sales Call'],
        connections: 4,
      },
      {
        name: 'Service Reminder',
        description: 'Mileage-based service appointment reminders.',
        nodes: ['Mileage Trigger', 'Send Service SMS', 'Book Appointment', 'Confirm Date', 'Send Reminder'],
        connections: 4,
      },
    ],
    Hospitality: [
      {
        name: 'Guest Check-In Flow',
        description: 'Pre-arrival to welcome message automation for guests.',
        nodes: ['Booking Confirmed', 'Pre-Arrival Email', 'Check-In SMS', 'Room Ready Alert', 'Welcome Message'],
        connections: 4,
      },
      {
        name: 'Review Request',
        description: 'Post-checkout review collection and response.',
        nodes: ['Checkout Detected', 'Wait 4h', 'Send Review SMS', 'Monitor Response', 'Thank Guest'],
        connections: 4,
      },
    ],
    'Debt Collection': [
      {
        name: 'Payment Reminder Sequence',
        description: 'Multi-channel payment reminders with escalation.',
        nodes: ['Due Date Approaching', 'Send Reminder SMS', 'Wait 3 Days', 'Send Email', 'Escalate'],
        connections: 4,
      },
      {
        name: 'Settlement Negotiation',
        description: 'AI-drafted settlement offers with tracking.',
        nodes: ['Account Flagged', 'AI Draft Offer', 'Send Settlement Letter', 'Track Response', 'Update Account'],
        connections: 4,
      },
    ],
    Insurance: [
      {
        name: 'Policy Renewal Reminder',
        description: 'Multi-step renewal reminders before policy expiry.',
        nodes: ['30 Days Before Expiry', 'Send Email', 'Wait 7 Days', 'Send SMS', 'Agent Call'],
        connections: 4,
      },
      {
        name: 'Claims Processing',
        description: 'AI-assisted claims review and customer notification.',
        nodes: ['Claim Filed', 'AI Document Review', 'Request Info', 'Process Claim', 'Notify Customer'],
        connections: 4,
      },
    ],
    Legal: [
      {
        name: 'Client Intake',
        description: 'AI pre-screening and consultation scheduling for new clients.',
        nodes: ['Inquiry Received', 'AI Pre-Screen', 'Schedule Consultation', 'Send Intake Forms', 'Confirm Appointment'],
        connections: 4,
      },
      {
        name: 'Case Status Update',
        description: 'Automated case status notifications to clients.',
        nodes: ['Status Changed', 'Draft Update', 'Send Client Email', 'Log Communication', 'Set Next Action'],
        connections: 4,
      },
    ],
    'Home Services': [
      {
        name: 'Job Scheduling',
        description: 'Quote-to-dispatch automation for service requests.',
        nodes: ['Request Received', 'Check Availability', 'Send Quote', 'Confirm Booking', 'Dispatch Technician'],
        connections: 4,
      },
      {
        name: 'Post-Service Review',
        description: 'Invoice and review collection after job completion.',
        nodes: ['Job Completed', 'Send Invoice', 'Wait 2h', 'Request Review', 'Follow Up'],
        connections: 4,
      },
    ],
  };

  const industryTemplates =
    Object.keys(templatesByIndustry).length > 0
      ? templatesByIndustry
      : FALLBACK_TEMPLATES;

  const allIndustryNames = Object.keys(industryTemplates);
  const industries = ['All', ...allIndustryNames];

  const filteredIndustries =
    activeFilter === 'All' ? allIndustryNames : [activeFilter];

  // Check if a template is already deployed
  const isTemplateDeployed = (industry, templateName) => {
    return workflows.some(
      (wf) => wf.name === templateName && wf.industry === industry
    );
  };

  const toggleIndustry = useCallback((industry) => {
    setExpandedIndustries((prev) => ({
      ...prev,
      [industry]: !prev[industry],
    }));
  }, []);

  const handleCreateFromTemplate = useCallback(
    async (industry, template) => {
      const key = `${industry}-${template.name}`;
      setDeploying(key);
      try {
        const steps = (template.nodes || template.steps || []).map((s, i) => ({
          order: i + 1,
          name: typeof s === 'string' ? s : s.name || s.label || `Step ${i + 1}`,
        }));
        await create('workflows', {
          name: template.name,
          industry,
          description: template.description || '',
          steps,
          status: 'active',
          trigger: 'event',
        });
        await fetchData();
      } catch (err) {
        console.error('Failed to deploy workflow:', err);
      } finally {
        setDeploying(null);
      }
    },
    []
  );

  const handleCreateBlank = useCallback(async () => {
    try {
      await create('workflows', {
        name: 'New Workflow',
        industry: 'General',
        steps: [],
        status: 'draft',
        trigger: 'manual',
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to create blank workflow:', err);
    }
  }, []);

  const handleToggleStatus = useCallback(async (workflow) => {
    try {
      const newStatus = workflow.status === 'paused' ? 'active' : 'paused';
      await update('workflows', workflow._id || workflow.id, {
        status: newStatus,
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to update workflow:', err);
    }
  }, []);

  const handleDelete = useCallback(async (workflow) => {
    if (!window.confirm(`Delete workflow "${workflow.name}"?`)) return;
    try {
      await remove('workflows', workflow._id || workflow.id);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Workflows</h1>
        <p style={styles.subtitle}>
          Manage deployed automations and explore industry templates
        </p>
      </div>

      {/* Deployed Workflows */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
          Deployed Workflows
        </h2>
        <button style={styles.blankBtn} onClick={handleCreateBlank}>
          + New Blank Workflow
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyText}>Loading workflows...</div>
        </div>
      ) : workflows.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>⚡</div>
          <div style={styles.emptyText}>
            No workflows deployed yet. Browse the templates below to get
            started.
          </div>
        </div>
      ) : (
        <div style={styles.workflowGrid}>
          {workflows.map((wf) => {
            const emoji = industryEmojis[wf.industry] || '📋';
            const stepCount = Array.isArray(wf.steps) ? wf.steps.length : 0;
            const trigger = triggerLabels[wf.trigger] || wf.trigger || 'Manual';

            return (
              <div key={wf._id || wf.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardEmoji}>{emoji}</span>
                  <span style={styles.cardName}>{wf.name}</span>
                  <StatusBadge status={wf.status} />
                </div>
                <div style={styles.cardIndustry}>
                  {wf.industry || 'General'}
                </div>
                <div style={styles.cardTrigger}>
                  Trigger: {trigger}
                </div>
                <div style={styles.stepsCount}>
                  {stepCount} step{stepCount !== 1 ? 's' : ''}
                </div>
                <div style={styles.cardDate}>
                  {wf.createdAt
                    ? formatDate(wf.createdAt)
                    : wf.updatedAt
                    ? formatDate(wf.updatedAt)
                    : ''}
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={{ ...styles.actionBtn, ...styles.editBtn }}
                    onClick={() =>
                      navigate(`/workflows/${wf._id || wf.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.pauseBtn }}
                    onClick={() => handleToggleStatus(wf)}
                  >
                    {wf.status === 'paused' ? 'Activate' : 'Pause'}
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                    onClick={() => handleDelete(wf)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Industry Workflows */}
      <h2 style={styles.sectionTitle}>Industry Workflows</h2>

      <div style={styles.filterContainer}>
        {industries.map((ind) => (
          <button
            key={ind}
            style={{
              ...styles.filterPill,
              ...(activeFilter === ind ? styles.filterPillActive : {}),
            }}
            onClick={() => setActiveFilter(ind)}
          >
            {ind !== 'All' && industryEmojis[ind]
              ? `${industryEmojis[ind]} `
              : ''}
            {ind}
          </button>
        ))}
      </div>

      {filteredIndustries.map((industry) => {
        const tpls = industryTemplates[industry];
        if (!tpls) return null;
        const isExpanded = expandedIndustries[industry];

        return (
          <div key={industry} style={styles.industrySection}>
            <div
              style={styles.industrySectionHeader}
              onClick={() => toggleIndustry(industry)}
            >
              <span style={{ fontSize: '20px' }}>
                {industryEmojis[industry] || '📋'}
              </span>
              <span style={styles.industrySectionTitle}>{industry}</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {tpls.length} template{tpls.length !== 1 ? 's' : ''}
              </span>
              <span
                style={{
                  ...styles.chevron,
                  transform: isExpanded
                    ? 'rotate(90deg)'
                    : 'rotate(0deg)',
                }}
              >
                ▶
              </span>
            </div>

            {isExpanded && (
              <div style={styles.templateGrid}>
                {tpls.map((tpl, idx) => {
                  const deployKey = `${industry}-${tpl.name}`;
                  const deployed = isTemplateDeployed(industry, tpl.name);
                  const nodeLabels = tpl.nodes || tpl.steps || [];
                  const displayNodes = nodeLabels.slice(0, 6);
                  const stepsTotal = nodeLabels.length;
                  const connectionsTotal =
                    tpl.connections != null
                      ? tpl.connections
                      : stepsTotal > 0
                      ? stepsTotal - 1
                      : 0;

                  return (
                    <div key={idx} style={styles.templateCard}>
                      <div style={styles.templateHeader}>
                        <span style={styles.templateName}>{tpl.name}</span>
                        <span
                          style={{
                            ...styles.templateBadge,
                            ...(deployed ? styles.deployedBadge : {}),
                          }}
                        >
                          {deployed ? 'Deployed' : 'Template'}
                        </span>
                      </div>

                      {tpl.description && (
                        <div style={styles.templateDescription}>
                          {tpl.description}
                        </div>
                      )}

                      <div style={styles.stepsPreview}>
                        {displayNodes.map((step, si) => {
                          const label =
                            typeof step === 'string'
                              ? step
                              : step.name || step.label || `Step ${si + 1}`;
                          return (
                            <span key={si} style={styles.stepChip}>
                              {si + 1}. {label}
                            </span>
                          );
                        })}
                        {nodeLabels.length > 6 && (
                          <span
                            style={{
                              ...styles.stepChip,
                              fontStyle: 'italic',
                            }}
                          >
                            +{nodeLabels.length - 6} more
                          </span>
                        )}
                      </div>

                      <div style={styles.templateMeta}>
                        {stepsTotal} step{stepsTotal !== 1 ? 's' : ''} ·{' '}
                        {connectionsTotal} connection
                        {connectionsTotal !== 1 ? 's' : ''}
                      </div>

                      {deployed ? (
                        <button
                          style={{
                            ...styles.actionBtn,
                            ...styles.editBtn,
                          }}
                          onClick={() => {
                            const match = workflows.find(
                              (wf) =>
                                wf.name === tpl.name &&
                                wf.industry === industry
                            );
                            if (match) {
                              navigate(
                                `/workflows/${match._id || match.id}`
                              );
                            }
                          }}
                        >
                          Edit →
                        </button>
                      ) : (
                        <button
                          style={{
                            ...styles.deployBtn,
                            ...(deploying === deployKey
                              ? {
                                  opacity: 0.6,
                                  cursor: 'not-allowed',
                                }
                              : {}),
                          }}
                          onClick={() =>
                            handleCreateFromTemplate(industry, tpl)
                          }
                          disabled={deploying === deployKey}
                        >
                          {deploying === deployKey
                            ? 'Deploying...'
                            : 'Deploy →'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
