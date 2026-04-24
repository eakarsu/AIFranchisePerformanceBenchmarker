import { useState, useEffect, useMemo } from 'react';
import { getAll, getById, create, update, remove, aiAnalyze, aiAnalyzeAll } from '../services/api';
import ReactMarkdown from 'react-markdown';

// ---------------------------------------------------------------------------
// AI Analysis Renderer – turns JSON + markdown into professional output
// ---------------------------------------------------------------------------

function parseAiContent(raw) {
  if (!raw) return { json: null, markdown: '' };
  const trimmed = raw.trim();

  // Try parsing the whole thing as JSON
  try {
    const parsed = JSON.parse(trimmed);
    return { json: parsed, markdown: '' };
  } catch { /* not pure JSON */ }

  // Try extracting a JSON block from markdown code fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1]);
      const rest = trimmed.replace(fenceMatch[0], '').trim();
      return { json: parsed, markdown: rest };
    } catch { /* bad JSON inside fence */ }
  }

  // Try finding a top-level { ... } or [ ... ]
  const braceStart = trimmed.indexOf('{');
  const bracketStart = trimmed.indexOf('[');
  const start = braceStart === -1 ? bracketStart : bracketStart === -1 ? braceStart : Math.min(braceStart, bracketStart);
  if (start !== -1) {
    const candidate = trimmed.slice(start);
    try {
      const parsed = JSON.parse(candidate);
      const before = trimmed.slice(0, start).trim();
      return { json: parsed, markdown: before };
    } catch { /* not valid */ }
  }

  return { json: null, markdown: trimmed };
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

function PriorityBadge({ priority }) {
  const colors = {
    CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    HIGH: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
    MEDIUM: { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
    LOW: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };
  const p = (priority || '').toUpperCase();
  const style = colors[p] || { bg: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem',
      fontWeight: 700, letterSpacing: '0.05em', background: style.bg, color: style.color,
      border: `1px solid ${style.border}`, textTransform: 'uppercase',
    }}>{p}</span>
  );
}

function MetricCard({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
      padding: '16px 20px', flex: '1 1 140px', minWidth: 140, borderTop: `3px solid ${accent || '#3b82f6'}`,
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {formatLabel(label)}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {typeof value === 'number' ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2)) : String(value)}
      </div>
    </div>
  );
}

function renderJsonProfessionally(data, depth = 0) {
  if (data === null || data === undefined) return null;
  if (typeof data === 'string') return <p style={{ margin: '4px 0', lineHeight: 1.6, color: 'var(--text-primary)' }}>{data}</p>;
  if (typeof data === 'number' || typeof data === 'boolean')
    return <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{String(data)}</span>;

  if (Array.isArray(data)) {
    // Array of simple strings → bullet list
    if (data.every(item => typeof item === 'string')) {
      return (
        <ul style={{ margin: '8px 0', paddingLeft: 20, listStyle: 'disc' }}>
          {data.map((item, i) => (
            <li key={i} style={{ marginBottom: 6, lineHeight: 1.5, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item}</li>
          ))}
        </ul>
      );
    }
    // Array of objects → cards
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item, i) => (
          <div key={i} style={{
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)', padding: '16px 20px',
            borderLeft: item.priority ? '4px solid' : 'none',
            borderLeftColor: item.priority === 'CRITICAL' ? '#dc2626' : item.priority === 'HIGH' ? '#ea580c' : '#3b82f6',
          }}>
            {typeof item === 'object' && item !== null ? (
              <div>
                {item.priority && <div style={{ marginBottom: 8 }}><PriorityBadge priority={item.priority} /></div>}
                {(item.action || item.theme || item.title || item.name) && (
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                    {item.action || item.theme || item.title || item.name}
                  </div>
                )}
                {Object.entries(item)
                  .filter(([k]) => !['priority', 'action', 'theme', 'title', 'name'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 4, fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: 6 }}>{formatLabel(k)}:</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {Array.isArray(v) ? v.join(', ') : typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : renderJsonProfessionally(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  // Object
  if (typeof data === 'object') {
    // Check if it looks like a metrics/summary object (all values are simple)
    const entries = Object.entries(data);
    const allSimple = entries.every(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');
    const accentColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

    if (allSimple && entries.length <= 8 && depth > 0) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '8px 0' }}>
          {entries.map(([k, v], i) => (
            <MetricCard key={k} label={k} value={v} accent={accentColors[i % accentColors.length]} />
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: depth === 0 ? 24 : 16 }}>
        {entries.map(([key, value]) => (
          <div key={key}>
            <h3 style={{
              fontSize: depth === 0 ? '1.1rem' : '0.95rem', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 12,
              paddingBottom: depth === 0 ? 8 : 0,
              borderBottom: depth === 0 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              {formatLabel(key)}
            </h3>
            {renderJsonProfessionally(value, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(data)}</span>;
}

function AiResultRenderer({ content }) {
  const { json, markdown } = useMemo(() => parseAiContent(content), [content]);

  return (
    <div className="ai-result-rendered">
      {markdown && (
        <div style={{ marginBottom: json ? 24 : 0 }}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
      {json && renderJsonProfessionally(json)}
    </div>
  );
}

const fieldConfig = {
  'franchise-units': [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'owner', label: 'Owner', type: 'text' },
    { key: 'openDate', label: 'Open Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'pending'] },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', type: 'number' },
    { key: 'employeeCount', label: 'Employee Count', type: 'number' },
    { key: 'customerRating', label: 'Customer Rating', type: 'number' },
    { key: 'performanceScore', label: 'Performance Score', type: 'number' },
    { key: 'sqFootage', label: 'Sq Footage', type: 'number' },
    { key: 'franchiseType', label: 'Franchise Type', type: 'text' },
  ],
  'revenue-records': [
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'month', label: 'Month', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'revenue', label: 'Revenue', type: 'number' },
    { key: 'expenses', label: 'Expenses', type: 'number' },
    { key: 'profit', label: 'Profit', type: 'number' },
    { key: 'customerCount', label: 'Customer Count', type: 'number' },
    { key: 'averageTicket', label: 'Average Ticket', type: 'number' },
    { key: 'category', label: 'Category', type: 'text' },
  ],
  'competitors': [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'marketShare', label: 'Market Share', type: 'number' },
    { key: 'strengths', label: 'Strengths', type: 'textarea' },
    { key: 'weaknesses', label: 'Weaknesses', type: 'textarea' },
    { key: 'priceRange', label: 'Price Range', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'estimatedRevenue', label: 'Estimated Revenue', type: 'number' },
    { key: 'threatLevel', label: 'Threat Level', type: 'select', options: ['low', 'medium', 'high'] },
  ],
  'market-expansion': [
    { key: 'targetCity', label: 'Target City', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'population', label: 'Population', type: 'number' },
    { key: 'medianIncome', label: 'Median Income', type: 'number' },
    { key: 'competitorCount', label: 'Competitor Count', type: 'number' },
    { key: 'demandScore', label: 'Demand Score', type: 'number' },
    { key: 'investmentRequired', label: 'Investment Required', type: 'number' },
    { key: 'projectedROI', label: 'Projected ROI', type: 'number' },
    { key: 'riskLevel', label: 'Risk Level', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'status', label: 'Status', type: 'select', options: ['researching', 'approved', 'in_progress', 'completed'] },
  ],
  'staff-members': [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'department', label: 'Department', type: 'text' },
    { key: 'salary', label: 'Salary', type: 'number' },
    { key: 'hireDate', label: 'Hire Date', type: 'date' },
    { key: 'performanceRating', label: 'Performance Rating', type: 'number' },
    { key: 'hoursPerWeek', label: 'Hours Per Week', type: 'number' },
    { key: 'certifications', label: 'Certifications', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'on_leave', 'terminated'] },
  ],
  'customer-reviews': [
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'customerName', label: 'Customer Name', type: 'text' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'reviewText', label: 'Review Text', type: 'textarea' },
    { key: 'sentiment', label: 'Sentiment', type: 'select', options: ['positive', 'neutral', 'negative'] },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'source', label: 'Source', type: 'text' },
    { key: 'reviewDate', label: 'Review Date', type: 'date' },
    { key: 'responseStatus', label: 'Response Status', type: 'select', options: ['pending', 'responded', 'escalated'] },
  ],
  'supply-chain': [
    { key: 'itemName', label: 'Item Name', type: 'text' },
    { key: 'supplier', label: 'Supplier', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'unitCost', label: 'Unit Cost', type: 'number' },
    { key: 'monthlyUsage', label: 'Monthly Usage', type: 'number' },
    { key: 'leadTimeDays', label: 'Lead Time (Days)', type: 'number' },
    { key: 'stockLevel', label: 'Stock Level', type: 'number' },
    { key: 'reorderPoint', label: 'Reorder Point', type: 'number' },
    { key: 'qualityScore', label: 'Quality Score', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['in_stock', 'low_stock', 'out_of_stock', 'on_order'] },
  ],
  'training-programs': [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'department', label: 'Department', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'skillLevel', label: 'Skill Level', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    { key: 'completionRate', label: 'Completion Rate', type: 'number' },
    { key: 'effectiveness', label: 'Effectiveness', type: 'number' },
    { key: 'cost', label: 'Cost', type: 'number' },
    { key: 'enrolledCount', label: 'Enrolled Count', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'] },
  ],
  'menu-items': [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'cost', label: 'Cost', type: 'number' },
    { key: 'profitMargin', label: 'Profit Margin', type: 'number' },
    { key: 'popularity', label: 'Popularity', type: 'number' },
    { key: 'calories', label: 'Calories', type: 'number' },
    { key: 'isActive', label: 'Is Active', type: 'select', options: ['true', 'false'] },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'monthlySales', label: 'Monthly Sales', type: 'number' },
  ],
  'financial-records': [
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'period', label: 'Period', type: 'text' },
    { key: 'totalRevenue', label: 'Total Revenue', type: 'number' },
    { key: 'totalExpenses', label: 'Total Expenses', type: 'number' },
    { key: 'netIncome', label: 'Net Income', type: 'number' },
    { key: 'cashFlow', label: 'Cash Flow', type: 'number' },
    { key: 'debtRatio', label: 'Debt Ratio', type: 'number' },
    { key: 'currentRatio', label: 'Current Ratio', type: 'number' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'marketing-campaigns': [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'channel', label: 'Channel', type: 'text' },
    { key: 'budget', label: 'Budget', type: 'number' },
    { key: 'spent', label: 'Spent', type: 'number' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'conversions', label: 'Conversions', type: 'number' },
    { key: 'roi', label: 'ROI', type: 'number' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['planned', 'active', 'paused', 'completed'] },
    { key: 'targetAudience', label: 'Target Audience', type: 'text' },
  ],
  'compliance-records': [
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'requirement', label: 'Requirement', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['compliant', 'non_compliant', 'pending_review', 'in_progress'] },
    { key: 'lastAuditDate', label: 'Last Audit Date', type: 'date' },
    { key: 'nextAuditDate', label: 'Next Audit Date', type: 'date' },
    { key: 'severity', label: 'Severity', type: 'select', options: ['critical', 'major', 'minor'] },
    { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'assignedTo', label: 'Assigned To', type: 'text' },
  ],
  'trip-plans': [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'destination', label: 'Destination', type: 'text' },
    { key: 'purpose', label: 'Purpose', type: 'text' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'totalBudget', label: 'Total Budget', type: 'number' },
    { key: 'estimatedCost', label: 'Estimated Cost', type: 'number' },
    { key: 'franchiseUnitsToVisit', label: 'Franchise Units to Visit', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'approved', 'in_progress', 'completed'] },
    { key: 'travelerName', label: 'Traveler Name', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  'benchmark-reports': [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'reportType', label: 'Report Type', type: 'text' },
    { key: 'period', label: 'Period', type: 'text' },
    { key: 'overallScore', label: 'Overall Score', type: 'number' },
    { key: 'industryAvg', label: 'Industry Avg', type: 'number' },
    { key: 'ranking', label: 'Ranking', type: 'number' },
    { key: 'totalUnitsCompared', label: 'Total Units Compared', type: 'number' },
    { key: 'keyFindings', label: 'Key Findings', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
  ],
  'franchise-valuations': [
    { key: 'franchiseUnitId', label: 'Franchise Unit ID', type: 'number' },
    { key: 'valuationDate', label: 'Valuation Date', type: 'date' },
    { key: 'estimatedValue', label: 'Estimated Value', type: 'number' },
    { key: 'methodology', label: 'Methodology', type: 'text' },
    { key: 'revenueMultiple', label: 'Revenue Multiple', type: 'number' },
    { key: 'assetValue', label: 'Asset Value', type: 'number' },
    { key: 'goodwillValue', label: 'Goodwill Value', type: 'number' },
    { key: 'marketCondition', label: 'Market Condition', type: 'select', options: ['buyers', 'sellers', 'balanced'] },
    { key: 'confidence', label: 'Confidence', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

function getDisplayColumns(featureKey) {
  const fields = fieldConfig[featureKey] || [];
  return fields.slice(0, 5);
}

function formatCellValue(value, fieldType) {
  if (value === null || value === undefined || value === '') return '—';
  if (fieldType === 'number') {
    const num = Number(value);
    return isNaN(num) ? String(value) : num.toLocaleString();
  }
  if (fieldType === 'date') {
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';
  const str = String(value);
  return str.length > 30 ? str.substring(0, 30) + '...' : str;
}

function formatDetailValue(value, fieldType) {
  if (value === null || value === undefined || value === '') return '—';
  if (fieldType === 'number') {
    const num = Number(value);
    return isNaN(num) ? String(value) : num.toLocaleString();
  }
  if (fieldType === 'date') {
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export default function FeaturePage({ feature }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fields = fieldConfig[feature.key] || [];
  const displayColumns = getDisplayColumns(feature.key);

  useEffect(() => {
    fetchItems();
    setSelectedItem(null);
    setShowDetail(false);
    setSearchTerm('');
  }, [feature.key]);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data } = await getAll(feature.key);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function initFormData() {
    const data = {};
    fields.forEach((f) => {
      data[f.key] = '';
    });
    return data;
  }

  function handleAddNew() {
    setFormData(initFormData());
    setIsEditing(false);
    setShowModal(true);
  }

  function handleEdit() {
    if (!selectedItem) return;
    const data = {};
    fields.forEach((f) => {
      data[f.key] = selectedItem[f.key] !== undefined && selectedItem[f.key] !== null
        ? String(selectedItem[f.key])
        : '';
    });
    setFormData(data);
    setIsEditing(true);
    setShowModal(true);
  }

  async function handleDelete() {
    if (!selectedItem) return;
    const confirmed = window.confirm(`Are you sure you want to delete this ${feature.label}?`);
    if (!confirmed) return;
    try {
      await remove(feature.key, selectedItem.id || selectedItem._id);
      setShowDetail(false);
      setSelectedItem(null);
      await fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  }

  async function handleSave() {
    try {
      const payload = { ...formData };
      fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key] !== '') {
          payload[f.key] = Number(payload[f.key]);
        }
      });
      if (isEditing && selectedItem) {
        await update(feature.key, selectedItem.id || selectedItem._id, payload);
      } else {
        await create(feature.key, payload);
      }
      setShowModal(false);
      await fetchItems();
      if (isEditing && selectedItem) {
        try {
          const { data: updated } = await getById(feature.key, selectedItem.id || selectedItem._id);
          setSelectedItem(updated);
        } catch {
          setShowDetail(false);
          setSelectedItem(null);
        }
      }
    } catch (err) {
      console.error('Error saving item:', err);
    }
  }

  async function handleAiAnalyze() {
    if (!selectedItem) return;
    setAiLoading(true);
    setShowAiResult(true);
    setAiResult('');
    try {
      const { data: result } = await aiAnalyze(feature.key, selectedItem.id || selectedItem._id);
      const analysis = result.analysis || result.result || result;
      setAiResult(typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2));
    } catch (err) {
      console.error('Error in AI analysis:', err);
      setAiResult('Error performing AI analysis. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAiAnalyzeAll() {
    setAiLoading(true);
    setShowAiResult(true);
    setAiResult('');
    try {
      const { data: result } = await aiAnalyzeAll(feature.key);
      const analysis = result.analysis || result.result || result;
      setAiResult(typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2));
    } catch (err) {
      console.error('Error in AI analysis:', err);
      setAiResult('Error performing AI analysis. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  function handleRowClick(item) {
    setSelectedItem(item);
    setShowDetail(true);
  }

  function handleFormChange(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
    );
  });

  return (
    <div className="feature-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <h1>
            {feature.icon && <span className="feature-icon">{feature.icon}</span>}
            {feature.label}
          </h1>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={handleAddNew}>
              + Add New
            </button>
            <button className="btn btn-ai" onClick={handleAiAnalyzeAll}>
              AI Analyze All
            </button>
          </div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Search ${feature.label}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content">
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p>Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p>No {feature.label.toLowerCase()} found.{searchTerm ? ' Try a different search.' : ' Click "Add New" to create one.'}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {displayColumns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id || item._id || idx}
                    onClick={() => handleRowClick(item)}
                    className={selectedItem && (selectedItem.id || selectedItem._id) === (item.id || item._id) ? 'row-selected' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    {displayColumns.map((col) => (
                      <td key={col.key}>{formatCellValue(item[col.key], col.type)}</td>
                    ))}
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal (centered) */}
      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={() => { setShowDetail(false); setSelectedItem(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h2>{feature.label} Details</h2>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetail(false);
                  setSelectedItem(null);
                }}
              >
                X
              </button>
            </div>
            <div className="modal-body">
              {fields.map((f) => (
                <div className="detail-field" key={f.key}>
                  <div className="detail-field-label">{f.label}</div>
                  <div className="detail-field-value">
                    {f.type === 'select' && selectedItem[f.key] ? (
                      <span className="badge">{selectedItem[f.key]}</span>
                    ) : (
                      formatDetailValue(selectedItem[f.key], f.type)
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleEdit}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn btn-ai" onClick={handleAiAnalyze}>
                AI Analyze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditing ? `Edit ${feature.label}` : `Add New ${feature.label}`}</h2>
            <div className="modal-body">
              {fields.map((f) => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      className="form-select"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleFormChange(f.key, e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {(f.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      className="form-textarea"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleFormChange(f.key, e.target.value)}
                      rows={3}
                    />
                  ) : f.type === 'date' ? (
                    <input
                      className="form-input"
                      type="date"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleFormChange(f.key, e.target.value)}
                    />
                  ) : f.type === 'number' ? (
                    <input
                      className="form-input"
                      type="number"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleFormChange(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      className="form-input"
                      type="text"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleFormChange(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Result Display */}
      {showAiResult && (
        <div className="modal-overlay" onClick={() => !aiLoading && setShowAiResult(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h2>AI Analysis</h2>
              {!aiLoading && (
                <button className="btn btn-secondary" onClick={() => setShowAiResult(false)}>
                  X
                </button>
              )}
            </div>
            <div className="modal-body">
              {aiLoading ? (
                <div className="ai-loading">
                  <span>Analyzing</span>
                  <span className="dot-animation">...</span>
                </div>
              ) : (
                <div className="ai-output">
                  <AiResultRenderer content={aiResult} />
                </div>
              )}
            </div>
            {!aiLoading && (
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowAiResult(false)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
