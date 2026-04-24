import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INDUSTRIES = [
  {
    id: 'dentistry',
    name: 'Dentistry',
    emoji: '🦷',
    description:
      'Streamline patient communications, automate appointment reminders, and enhance practice management with AI-powered voice and chat agents tailored for dental offices.',
    features: [
      'Automated appointment reminders via SMS and voice',
      'AI receptionist for call handling',
      'Patient follow-up sequences',
      'Insurance verification chatbot',
      'Review collection automation',
    ],
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    emoji: '🍽️',
    description:
      'Boost reservations, manage online orders, and gather customer feedback effortlessly using AI agents designed for the food service industry.',
    features: [
      'Reservation management via voice AI',
      'Order confirmation SMS workflows',
      'Customer feedback sentiment analysis',
      'Loyalty program automation',
      'Peak hour staffing alerts',
    ],
  },
  {
    id: 'health-clinics',
    name: 'Health Clinics',
    emoji: '🏥',
    description:
      'Improve patient experience with intelligent scheduling, automated follow-ups, and HIPAA-aware communication workflows for clinics of all sizes.',
    features: [
      'Patient intake automation',
      'Prescription refill reminders',
      'Telehealth appointment scheduling',
      'Post-visit follow-up sequences',
      'Waitlist management AI',
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    emoji: '🏠',
    description:
      'Capture and nurture leads automatically, schedule showings, and keep buyers informed with AI-driven communication across every channel.',
    features: [
      'Lead qualification chatbot',
      'Automated listing alerts',
      'Open house follow-up sequences',
      'Virtual tour scheduling',
      'Market report email drafts',
    ],
  },
  {
    id: 'car-dealerships',
    name: 'Car Dealerships',
    emoji: '🚗',
    description:
      'Accelerate sales cycles with AI that handles inquiries, schedules test drives, and follows up with personalized offers for every prospect.',
    features: [
      'Test drive scheduling automation',
      'Vehicle inquiry voice agent',
      'Trade-in value estimator chat',
      'Service appointment reminders',
      'Personalized offer campaigns',
    ],
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    emoji: '🏨',
    description:
      'Deliver exceptional guest experiences from booking to checkout with AI concierge services, automated communications, and review management.',
    features: [
      'AI concierge chatbot',
      'Pre-arrival communication flow',
      'Room service voice ordering',
      'Guest satisfaction surveys',
      'Review response automation',
    ],
  },
  {
    id: 'debt-collection',
    name: 'Debt Collection',
    emoji: '💳',
    description:
      'Improve recovery rates while maintaining compliance through AI-powered payment reminders, negotiation workflows, and debtor communication management.',
    features: [
      'Automated payment reminder sequences',
      'AI settlement negotiation drafts',
      'Compliance-aware communication',
      'Payment plan setup chatbot',
      'Account status voice updates',
    ],
  },
  {
    id: 'insurance',
    name: 'Insurance',
    emoji: '🛡️',
    description:
      'Simplify policy management, accelerate claims processing, and provide instant support with AI agents built for the insurance industry.',
    features: [
      'Policy renewal reminder workflows',
      'Claims status update chatbot',
      'Quote generation automation',
      'Document collection sequences',
      'Risk assessment AI analysis',
    ],
  },
  {
    id: 'legal',
    name: 'Legal / Law Firms',
    emoji: '⚖️',
    description:
      'Streamline client intake, automate case updates, and manage communications efficiently with AI tools purpose-built for law firms.',
    features: [
      'Client intake screening chatbot',
      'Case status update automation',
      'Document request sequences',
      'Consultation scheduling voice agent',
      'Billing reminder workflows',
    ],
  },
  {
    id: 'home-services',
    name: 'Home Services',
    emoji: '🔧',
    description:
      'Schedule jobs, dispatch technicians, and follow up with customers seamlessly using AI workflows designed for plumbing, HVAC, electrical, and more.',
    features: [
      'Job request intake voice agent',
      'Technician dispatch automation',
      'Service quote generation',
      'Post-job review collection',
      'Maintenance reminder sequences',
    ],
  },
  {
    id: 'pharmacy',
    name: 'Healthcare / Pharmacy',
    emoji: '💊',
    description:
      'Automate prescription notifications, manage refill requests, and provide medication information through AI-powered communication channels.',
    features: [
      'Prescription ready notifications',
      'Refill reminder automation',
      'Medication interaction chatbot',
      'Insurance prior-auth workflows',
      'Delivery scheduling SMS agent',
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness / Gym',
    emoji: '💪',
    description:
      'Engage members, reduce churn, and grow your gym or studio with AI that handles class bookings, follow-ups, and personalized outreach.',
    features: [
      'Class booking voice agent',
      'Member check-in automation',
      'Missed session follow-ups',
      'Membership renewal campaigns',
      'Personal training upsell sequences',
    ],
  },
  {
    id: 'education',
    name: 'Education',
    emoji: '📚',
    description:
      'Enhance student engagement, automate enrollment processes, and streamline administrative communications for schools and training centers.',
    features: [
      'Enrollment inquiry chatbot',
      'Class schedule notifications',
      'Assignment reminder sequences',
      'Parent communication automation',
      'Student feedback collection',
    ],
  },
  {
    id: 'pet-care',
    name: 'Pet Care / Veterinary',
    emoji: '🐾',
    description:
      'Keep pet parents happy with automated appointment reminders, vaccination schedules, and personalized care communications for veterinary and grooming businesses.',
    features: [
      'Vaccination reminder workflows',
      'Grooming appointment scheduling',
      'Pet health tips email sequences',
      'Boarding reservation chatbot',
      'Post-visit care instructions',
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting / Tax',
    emoji: '📊',
    description:
      'Automate client communications, streamline document collection during tax season, and manage deadlines with AI workflows for accounting firms.',
    features: [
      'Tax deadline reminder sequences',
      'Document collection automation',
      'Client onboarding chatbot',
      'Invoice follow-up workflows',
      'Quarterly review scheduling',
    ],
  },
  {
    id: 'salon',
    name: 'Salon / Spa',
    emoji: '💇',
    description:
      'Fill your appointment book, reduce no-shows, and delight clients with AI-powered booking, reminders, and personalized marketing for beauty professionals.',
    features: [
      'Appointment booking voice agent',
      'No-show follow-up automation',
      'Rebooking reminder sequences',
      'Product recommendation chatbot',
      'Loyalty rewards notifications',
    ],
  },
  {
    id: 'auto-repair',
    name: 'Auto Repair / Body Shop',
    emoji: '🔩',
    description:
      'Manage service appointments, send repair updates, and build customer loyalty with AI communication tools built for auto repair shops.',
    features: [
      'Service appointment scheduling',
      'Repair status update SMS',
      'Maintenance reminder workflows',
      'Cost estimate chatbot',
      'Customer satisfaction follow-ups',
    ],
  },
];

const styles = {
  container: {
    padding: '32px',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
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
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    cursor: 'default',
  },
  cardHover: {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    borderColor: '#6366f1',
  },
  emoji: {
    fontSize: '48px',
    marginBottom: '16px',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
  emojiHover: {
    transform: 'scale(1.15)',
  },
  cardName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '10px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  featuresTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px 0',
    flex: 1,
  },
  featureItem: {
    fontSize: '13px',
    color: '#475569',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    lineHeight: '1.4',
  },
  checkmark: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
    marginTop: '1px',
  },
  viewBtn: {
    display: 'inline-block',
    textAlign: 'center',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6366f1',
    background: '#f0f4ff',
    border: '1px solid #c7d2fe',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textDecoration: 'none',
    marginTop: 'auto',
  },
};

export default function IndustriesPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Industries</h1>
        <p style={styles.subtitle}>
          Explore AI-powered workflows and communication tools tailored for your
          industry
        </p>
      </div>

      <div style={styles.grid}>
        {INDUSTRIES.map((industry, index) => (
          <div
            key={industry.id}
            style={{
              ...styles.card,
              ...(hoveredCard === index ? styles.cardHover : {}),
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              style={{
                ...styles.emoji,
                ...(hoveredCard === index ? styles.emojiHover : {}),
              }}
            >
              {industry.emoji}
            </div>
            <div style={styles.cardName}>{industry.name}</div>
            <p style={styles.cardDescription}>{industry.description}</p>

            <div style={styles.featuresTitle}>AI Features</div>
            <ul style={styles.featureList}>
              {industry.features.map((feature, fi) => (
                <li key={fi} style={styles.featureItem}>
                  <span style={styles.checkmark}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              style={styles.viewBtn}
              onClick={() =>
                navigate(`/workflows?industry=${industry.id}`)
              }
            >
              View Workflow →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
