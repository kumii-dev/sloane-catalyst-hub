import jsPDF from 'jspdf';

export const generateArchitectureDocumentPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPos = margin;

  // Color palette
  const primaryColor = [59, 130, 246]; // Blue
  const accentColor = [16, 185, 129]; // Green
  const darkGray = [55, 65, 81];
  const lightGray = [156, 163, 175];

  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  // Title Page
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('22 On Sloane', pageWidth / 2, 60, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise Architecture Document', pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Comprehensive Platform Architecture & Security Framework', pageWidth / 2, 95, { align: 'center' });

  // Document metadata
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  yPos = 140;
  doc.text('Document Version: 1.0', margin, yPos);
  yPos += 8;
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
  yPos += 8;
  doc.text('Classification: Confidential', margin, yPos);
  yPos += 8;
  doc.text('Prepared for: Microsoft Partnership Review', margin, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('© 2025 22 On Sloane. All rights reserved.', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Executive Summary
  addNewPage();
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPos);
  yPos += 15;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const execSummary = [
    '22 On Sloane is an enterprise-grade digital ecosystem designed to democratize access to business',
    'support services, funding opportunities, and mentorship for Small, Medium, and Micro Enterprises',
    '(SMMEs) and startups across South Africa.',
    '',
    'Built on a modern, cloud-native architecture leveraging React, PostgreSQL, and serverless',
    'technologies, the platform emphasizes security, scalability, and user experience. Our architecture',
    'aligns with ISO 27001 standards and implements comprehensive data protection measures in',
    'compliance with POPIA and GDPR requirements.',
    '',
    'This document provides a comprehensive overview of our architectural approach across business,',
    'data, technology, security, and integration domains, demonstrating our commitment to enterprise-',
    'grade reliability and security.'
  ];

  execSummary.forEach(line => {
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Table of Contents
  addNewPage();
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Table of Contents', margin, yPos);
  yPos += 15;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const toc = [
    '1. Platform Objectives and Vision',
    '2. Core Features and Capabilities',
    '3. Business Architecture',
    '4. Data Architecture',
    '5. Information Architecture',
    '6. Technology Architecture',
    '7. Security Architecture',
    '8. Integration Architecture',
    '9. Scalability and Performance',
    '10. Compliance and Governance'
  ];

  toc.forEach(item => {
    doc.text(item, margin + 5, yPos);
    yPos += 8;
  });

  // Section 1: Platform Objectives
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Platform Objectives and Vision', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const objectives = [
    'Mission Statement:',
    'To empower SMMEs and startups by providing equitable access to critical business resources,',
    'funding opportunities, professional mentorship, and market access through a secure, scalable',
    'digital platform.',
    '',
    'Strategic Objectives:',
    '',
    '• Financial Inclusion: Enable access to credit scoring, financial modeling, and funding',
    '  opportunities for underserved entrepreneurs',
    '',
    '• Knowledge Transfer: Connect emerging businesses with experienced mentors and advisors',
    '  for guided growth and development',
    '',
    '• Market Access: Facilitate connections between startups, service providers, and enterprise',
    '  buyers through a curated marketplace',
    '',
    '• Data-Driven Insights: Leverage AI and analytics to provide personalized recommendations,',
    '  credit assessments, and business intelligence',
    '',
    '• Regulatory Compliance: Ensure full compliance with POPIA, GDPR, and ISO 27001 standards',
    '  while maintaining operational excellence'
  ];

  objectives.forEach(line => {
    checkPageBreak(8);
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 2: Core Features
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Core Features and Capabilities', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const features = [
    '2.1 Multi-Persona User Experience',
    'The platform supports four distinct user personas, each with tailored experiences:',
    '',
    'Startup/SMME Persona:',
    '• Comprehensive onboarding with progressive profiling',
    '• Credit score assessment and financial health monitoring',
    '• Access to funding opportunities with AI-powered matching',
    '• Mentorship booking and session management',
    '• Business document generation and financial modeling tools',
    '',
    'Mentor/Advisor Persona:',
    '• Profile management with expertise categorization',
    '• Availability calendar and booking management',
    '• Video conferencing integration for remote sessions',
    '• Session tracking and review management',
    '• Analytics dashboard for engagement metrics',
    '',
    'Service Provider Persona:',
    '• Service listing creation and management',
    '• Client communication via integrated messaging',
    '• Transaction and subscription tracking',
    '• Performance analytics and reporting',
    '',
    'Funder Persona:',
    '• Funding opportunity creation and management',
    '• Application review and tracking workflows',
    '• Portfolio monitoring and analytics',
    '• Direct engagement with applicants'
  ];

  features.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('2.1') || line.endsWith('Persona:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Continue with more features
  addNewPage();
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const moreFeatures = [
    '2.2 Advanced Feature Set',
    '',
    'Financial Services:',
    '• AI-powered credit assessment using OpenAI integration',
    '• Interactive financial modeling with export capabilities',
    '• Business health scoring and reporting',
    '• Valuation modeling tools',
    '',
    'Marketplace & Discovery:',
    '• Multi-category service listings with search and filters',
    '• AI-powered matching between startups and service providers',
    '• Review and rating system for quality assurance',
    '• Subscription management for recurring services',
    '',
    'Communication & Collaboration:',
    '• Real-time messaging with conversation threading',
    '• Video conferencing via Daily.co integration',
    '• Email notifications via Resend',
    '• File sharing with granular permissions',
    '',
    'Content & Learning:',
    '• Resource library with categorization',
    '• Progress tracking for educational content',
    '• Bookmark functionality',
    '• Document generation (business plans, reports, presentations)',
    '',
    'Administrative Capabilities:',
    '• User management and role assignment',
    '• Platform analytics and monitoring',
    '• Cohort management for group programs',
    '• Audit logging for compliance'
  ];

  moreFeatures.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('2.2') || line.endsWith('Services:') || line.endsWith('Discovery:') || 
        line.endsWith('Collaboration:') || line.endsWith('Learning:') || line.endsWith('Capabilities:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 3: Business Architecture
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Business Architecture', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const businessArch = [
    '3.1 Business Model',
    'The platform operates on a multi-sided marketplace model with the following revenue streams:',
    '',
    '• Subscription fees for premium service provider listings',
    '• Transaction fees on mentorship bookings and service engagements',
    '• Credit-based system for platform features and AI services',
    '• Enterprise partnerships for cohort programs',
    '',
    '3.2 Value Proposition',
    '',
    'For Startups/SMMEs:',
    '• Reduced cost of accessing professional services',
    '• Increased visibility to funding opportunities',
    '• Structured mentorship and guidance',
    '• Tools for financial planning and assessment',
    '',
    'For Service Providers:',
    '• Access to qualified leads and clients',
    '• Streamlined engagement and payment processes',
    '• Visibility and credibility through reviews',
    '',
    'For Funders:',
    '• Pre-assessed applicants with credit scores',
    '• Efficient application processing workflows',
    '• Portfolio tracking and monitoring',
    '',
    '3.3 User Journey Architecture',
    'Each persona follows a structured journey from discovery to engagement:',
    '',
    '• Awareness: Landing pages and marketing materials',
    '• Registration: Streamlined onboarding with progressive profiling',
    '• Activation: Persona-specific dashboard and initial actions',
    '• Engagement: Core feature usage and interactions',
    '• Retention: Ongoing value delivery and notifications',
    '• Growth: Advanced features and expanded capabilities'
  ];

  businessArch.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('3.') || line.endsWith('SMMEs:') || line.endsWith('Providers:') || line.endsWith('Funders:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 4: Data Architecture
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Data Architecture', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const dataArch = [
    '4.1 Database Design',
    'PostgreSQL relational database with the following design principles:',
    '',
    '• Normalization: Third normal form (3NF) for data integrity',
    '• Indexing: Strategic indexes on frequently queried columns and foreign keys',
    '• Partitioning: Time-based partitioning for audit logs and transaction history',
    '• Full-text Search: tsvector indexes for search functionality',
    '',
    '4.2 Core Data Entities',
    '',
    'User & Identity Domain:',
    '• profiles: Extended user information beyond authentication',
    '• user_roles: Role-based access control mapping',
    '• mentors, startup_profiles, funders, service_providers: Persona-specific data',
    '',
    'Marketplace Domain:',
    '• listings: Service and resource catalog',
    '• listing_categories: Hierarchical categorization',
    '• listing_reviews: User feedback and ratings',
    '• user_subscriptions: Subscription management',
    '',
    'Engagement Domain:',
    '• mentoring_sessions: Booking and session data',
    '• mentor_availability: Calendar management',
    '• session_reviews: Feedback collection',
    '• conversations, conversation_messages: Communication threads',
    '',
    'Financial Domain:',
    '• funding_opportunities: Available funding programs',
    '• funding_applications: Application tracking',
    '• credit_assessments: Financial evaluation data',
    '• credits_wallet, credits_transactions: Platform credit system',
    '',
    'Content Domain:',
    '• resources: Educational content',
    '• resource_categories: Content organization',
    '• files, file_shares: Document management',
    '',
    '4.3 Data Quality & Governance',
    '',
    '• Constraints: Foreign keys, check constraints, unique constraints',
    '• Triggers: Automated timestamps, audit logging, data validation',
    '• Functions: Reusable business logic in database layer',
    '• Views: Materialized views for complex reporting'
  ];

  dataArch.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('4.') || line.endsWith('Domain:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 5: Information Architecture
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Information Architecture', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const infoArch = [
    '5.1 Navigation Structure',
    'Persona-driven navigation with context-aware menus:',
    '',
    '• Top Navigation: Global actions, notifications, profile menu',
    '• Sidebar Navigation: Persona-specific features and tools',
    '• Breadcrumbs: Hierarchical location indicators',
    '• Contextual Actions: In-page quick actions',
    '',
    '5.2 Content Organization',
    '',
    'Information Hierarchy:',
    '• Dashboard: High-level metrics and quick actions',
    '• List Views: Paginated/infinite scroll collections',
    '• Detail Views: Comprehensive entity information',
    '• Forms: Structured data input with validation',
    '',
    'Search & Discovery:',
    '• Global search across entities',
    '• Faceted filtering by category, tags, ratings',
    '• AI-powered recommendations',
    '• Recent and saved items',
    '',
    '5.3 User Interface Patterns',
    '',
    '• Design System: Radix UI primitives with custom theme',
    '• Responsive Design: Mobile-first approach',
    '• Accessibility: WCAG 2.1 AA compliance target',
    '• Progressive Disclosure: Show complexity as needed',
    '• Feedback: Toast notifications, loading states, error handling'
  ];

  infoArch.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('5.') || line.endsWith('Hierarchy:') || line.endsWith('Discovery:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 6: Technology Architecture
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Technology Architecture', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const techArch = [
    '6.1 Technology Stack',
    '',
    'Frontend Layer:',
    '• Framework: React 18.3+ with TypeScript for type safety',
    '• Build Tool: Vite for fast development and optimized builds',
    '• Styling: Tailwind CSS with custom design system',
    '• State Management:',
    '  - TanStack Query (React Query) for server state with intelligent caching',
    '  - Jotai for lightweight client state',
    '• Routing: React Router v6 for client-side navigation',
    '• UI Components: Radix UI primitives ensuring accessibility',
    '',
    'Backend Layer:',
    '• Database: PostgreSQL 15+ via Supabase',
    '• Authentication: Supabase Auth with JWT tokens',
    '• File Storage: Supabase Storage with row-level security',
    '• Edge Functions: Deno runtime for serverless compute',
    '• Real-time: Supabase Realtime for live updates',
    '',
    'Third-Party Integrations:',
    '• Video: Daily.co for video conferencing',
    '• Email: Resend for transactional emails',
    '• AI: OpenAI GPT-4 for copilot and credit assessment',
    '• TTS: ElevenLabs for narration generation',
    '• Monitoring: Sentry for error tracking and performance',
    '',
    '6.2 Architectural Patterns',
    '',
    'Frontend Patterns:',
    '• Component-Based Architecture: Reusable, composable components',
    '• Atomic Design: UI primitives → Molecules → Organisms → Templates',
    '• Container/Presenter Pattern: Logic separation from presentation',
    '• Custom Hooks: Reusable business logic',
    '• Code Splitting: Route-based lazy loading',
    '',
    'Backend Patterns:',
    '• Serverless Architecture: Event-driven edge functions',
    '• Database Functions: Business logic close to data',
    '• Triggers: Automated data operations',
    '• Row Level Security: Database-enforced access control'
  ];

  techArch.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('6.') || line.endsWith('Layer:') || line.endsWith('Integrations:') || 
        line.endsWith('Patterns:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Continue Technology Architecture
  addNewPage();
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const techArch2 = [
    '6.3 Deployment Architecture',
    '',
    'Frontend Deployment:',
    '• Hosting: Lovable Platform with CDN',
    '• Build Process: Automated CI/CD on push',
    '• Preview Environments: Per pull request',
    '• Asset Optimization: Code splitting, tree shaking, minification',
    '• PWA Support: Offline capabilities and installability',
    '',
    'Backend Deployment:',
    '• Supabase Managed Infrastructure',
    '• Auto-scaling Edge Functions',
    '• Database Migrations: Version-controlled via Supabase CLI',
    '• Secrets Management: Supabase Vault',
    '',
    '6.4 Development Environment',
    '',
    '• Version Control: Git with feature branching',
    '• Code Quality: ESLint, TypeScript strict mode',
    '• Testing: Vitest for unit tests, Playwright for E2E',
    '• Documentation: Inline JSDoc, Architecture docs',
    '• Performance Testing: k6 load testing scripts'
  ];

  techArch2.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('6.') || line.endsWith('Deployment:') || line.endsWith('Environment:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 7: Security Architecture
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('7. Security Architecture', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const secArch = [
    '7.1 Authentication & Authorization',
    '',
    'Authentication Mechanisms:',
    '• Email/Password with bcrypt hashing',
    '• JWT-based session management',
    '• Automatic token refresh',
    '• Secure session storage in localStorage',
    '• Multi-factor authentication (roadmap)',
    '',
    'Authorization Framework:',
    '• Role-Based Access Control (RBAC)',
    '• Persona-based permissions',
    '• Row Level Security (RLS) policies on all tables',
    '• Function-level security on edge functions',
    '• API key authentication for integrations',
    '',
    '7.2 Data Protection',
    '',
    'Data at Rest:',
    '• PostgreSQL encryption at rest',
    '• Encrypted file storage (Supabase Storage)',
    '• Secure backup encryption',
    '• PDF encryption for sensitive documents',
    '',
    'Data in Transit:',
    '• HTTPS/TLS 1.3 for all communication',
    '• Secure WebSocket connections',
    '• End-to-end encryption for video calls',
    '',
    'Data Privacy:',
    '• POPIA compliance for South African data',
    '• GDPR compliance for international users',
    '• Data minimization principles',
    '• Right to erasure implementation',
    '• Consent management',
    '',
    '7.3 Application Security',
    '',
    'Input Validation:',
    '• Client-side validation with Zod schemas',
    '• Server-side validation in edge functions',
    '• Parameterized queries preventing SQL injection',
    '• XSS prevention through React\'s escaping',
    '',
    'Security Headers:',
    '• Content Security Policy (CSP)',
    '• X-Frame-Options: DENY',
    '• X-Content-Type-Options: nosniff',
    '• Strict-Transport-Security (HSTS)',
    '',
    'Rate Limiting:',
    '• API rate limiting per user',
    '• Edge function throttling',
    '• Authentication attempt limiting'
  ];

  secArch.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('7.') || line.endsWith('Mechanisms:') || line.endsWith('Framework:') || 
        line.endsWith('Rest:') || line.endsWith('Transit:') || line.endsWith('Privacy:') || 
        line.endsWith('Validation:') || line.endsWith('Headers:') || line.endsWith('Limiting:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Continue Security Architecture
  addNewPage();
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const secArch2 = [
    '7.4 Audit & Compliance',
    '',
    'Audit Logging:',
    '• Immutable audit logs in database',
    '• Event tracking: Authentication, data access, admin actions',
    '• Automatic log rotation and archival',
    '• Sensitive data redaction in logs',
    '• Comprehensive audit trail for compliance',
    '',
    'Monitoring & Detection:',
    '• Sentry error tracking (production)',
    '• Real-time security event monitoring',
    '• Anomaly detection for suspicious activities',
    '• Automated alerting for security incidents',
    '',
    'Incident Response:',
    '• Documented incident response procedures',
    '• Incident classification (Critical/High/Medium/Low)',
    '• Breach notification processes',
    '• 72-hour POPIA/GDPR notification compliance',
    '',
    '7.5 Third-Party Security',
    '',
    'Vendor Management:',
    '• Security assessment of all vendors',
    '• Data Processing Agreements (DPAs)',
    '• Regular vendor security reviews',
    '• ISO 27001 certified vendors preferred',
    '',
    'API Security:',
    '• Secure API key storage in Supabase Vault',
    '• Minimal permission scopes',
    '• API key rotation procedures',
    '• Encrypted transmission of sensitive data'
  ];

  secArch2.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('7.') || line.endsWith('Logging:') || line.endsWith('Detection:') || 
        line.endsWith('Response:') || line.endsWith('Management:') || line.endsWith('Security:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 8: Integration Architecture
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('8. Integration Architecture', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const intArch = [
    '8.1 Integration Strategy',
    '',
    'API-First Approach:',
    '• RESTful APIs for core operations',
    '• GraphQL (future consideration)',
    '• Webhook support for event-driven integrations',
    '• Standard HTTP methods and status codes',
    '',
    '8.2 Core Integrations',
    '',
    'OpenAI Integration:',
    '• Purpose: Copilot chat, credit assessment analysis',
    '• Method: REST API via edge functions',
    '• Security: API key in Supabase Vault',
    '• Error Handling: Fallback responses, retry logic',
    '',
    'Daily.co Integration:',
    '• Purpose: Video conferencing for mentorship',
    '• Method: REST API + client SDK',
    '• Features: Room creation, token generation, recording',
    '• Security: Time-limited tokens, room-level permissions',
    '',
    'Resend Integration:',
    '• Purpose: Transactional emails',
    '• Method: REST API via edge functions',
    '• Use Cases: Booking confirmations, review requests, notifications',
    '• Security: API key in Supabase Vault',
    '',
    'ElevenLabs Integration:',
    '• Purpose: Text-to-speech for document narration',
    '• Method: REST API via edge functions',
    '• Security: API key in Supabase Vault',
    '',
    'Sentry Integration:',
    '• Purpose: Error tracking and performance monitoring',
    '• Method: SDK initialization',
    '• Features: Error logging, session replay, performance tracing',
    '• Sampling: 10% performance, 10% replay (100% on error)',
    '',
    '8.3 Data Integration Patterns',
    '',
    'Synchronous Integrations:',
    '• Real-time API calls from edge functions',
    '• Immediate response required',
    '• Examples: Authentication, credit checks',
    '',
    'Asynchronous Integrations:',
    '• Background processing via edge functions',
    '• Queued operations for non-critical tasks',
    '• Examples: Email sending, report generation'
  ];

  intArch.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('8.') || line.endsWith('Approach:') || line.endsWith('Integration:') || 
        line.endsWith('Patterns:') || line.endsWith('Integrations:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 9: Scalability and Performance
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('9. Scalability and Performance', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const scalePerf = [
    '9.1 Current Capacity',
    '',
    '• Target: 100-1,000 concurrent users',
    '• Database: Supabase Pro tier capabilities',
    '• Edge Functions: Auto-scaling with traffic',
    '• Storage: Unlimited with fair use policy',
    '',
    '9.2 Frontend Performance',
    '',
    'Optimization Techniques:',
    '• Code splitting by route (React.lazy)',
    '• Image lazy loading',
    '• Virtual scrolling for large lists',
    '• Memoization of expensive computations',
    '• Debouncing of search inputs',
    '',
    'Caching Strategy:',
    '• React Query cache (stale-while-revalidate)',
    '• Listings: 5-10 minute stale time',
    '• Categories: 30-60 minute stale time',
    '• User profiles: 5 minute stale time',
    '• Static resources: 1 hour stale time',
    '',
    'Progressive Web App:',
    '• Service worker for offline functionality',
    '• Asset caching for repeat visits',
    '• Background sync for offline actions',
    '',
    '9.3 Backend Performance',
    '',
    'Database Optimization:',
    '• Indexes on foreign keys and query filters',
    '• Full-text search indexes (tsvector)',
    '• Materialized views for complex queries',
    '• Connection pooling',
    '• Query optimization with EXPLAIN ANALYZE',
    '',
    'Edge Function Optimization:',
    '• Minimal cold start times with Deno',
    '• Memory allocation tuning',
    '• Request batching where applicable',
    '• Timeout configuration',
    '',
    '9.4 Scaling Strategies',
    '',
    'Horizontal Scaling:',
    '• Edge functions auto-scale with load',
    '• Read replicas for database (future)',
    '• CDN for static assets',
    '',
    'Vertical Scaling:',
    '• Database tier upgrades',
    '• Increased edge function memory',
    '',
    'Data Scaling:',
    '• Table partitioning for large datasets',
    '• Archive strategy for historical data',
    '• Blob storage for files',
    '',
    '9.5 Performance Monitoring',
    '',
    '• Sentry performance tracing',
    '• Database query performance via Supabase Analytics',
    '• Edge function invocation metrics',
    '• Core Web Vitals tracking',
    '• Load testing with k6 (test scripts available)'
  ];

  scalePerf.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('9.') || line.endsWith('Techniques:') || line.endsWith('Strategy:') || 
        line.endsWith('App:') || line.endsWith('Optimization:') || line.endsWith('Strategies:') || 
        line.endsWith('Scaling:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Section 10: Compliance and Governance
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('10. Compliance and Governance', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const compliance = [
    '10.1 Regulatory Compliance',
    '',
    'ISO 27001 Alignment:',
    '• Information security management system framework',
    '• Risk assessment and treatment',
    '• Access control policies',
    '• Incident management procedures',
    '• Business continuity planning',
    '',
    'POPIA Compliance (South Africa):',
    '• Lawful processing of personal information',
    '• Data subject consent management',
    '• Right to access and correction',
    '• Right to erasure (forgotten)',
    '• Cross-border data transfer restrictions',
    '• Data breach notification (72 hours)',
    '',
    'GDPR Compliance (International):',
    '• Legal basis for processing',
    '• Privacy by design and default',
    '• Data minimization',
    '• Retention period management',
    '• Data portability',
    '',
    '10.2 Governance Framework',
    '',
    'Access Control Policy:',
    '• Role-based access control (RBAC)',
    '• Least privilege principle',
    '• Multi-factor authentication (planned)',
    '• Access review procedures',
    '',
    'Data Retention Policy:',
    '• User data: 7 years after account closure',
    '• Financial records: 7 years (legal requirement)',
    '• Audit logs: 3 years',
    '• Session data: 90 days',
    '• Backup retention: 90 days',
    '',
    'Change Management:',
    '• Emergency changes: Immediate with post-implementation review',
    '• Standard changes: Approval → Testing → Staging → Production',
    '• Database migrations: Version controlled',
    '• Rollback procedures documented',
    '',
    'Vendor Management:',
    '• Security assessment requirements',
    '• Data Processing Agreements (DPAs)',
    '• Regular vendor reviews',
    '• Exit strategies defined',
    '',
    'Incident Response:',
    '• Incident classification framework',
    '• Response team and procedures',
    '• Communication templates',
    '• Post-incident review process',
    '',
    '10.3 Business Continuity',
    '',
    'Recovery Objectives:',
    '• Authentication: RTO 1 hour, RPO 5 minutes',
    '• Core platform: RTO 4 hours, RPO 15 minutes',
    '• Reporting: RTO 24 hours, RPO 1 hour',
    '',
    'Backup Strategy:',
    '• Database: Continuous backup with point-in-time recovery',
    '• Files: Replicated storage with versioning',
    '• Configuration: Version controlled in Git',
    '',
    'Disaster Scenarios:',
    '• Database failure: Restore from backup',
    '• Region outage: Multi-region failover (roadmap)',
    '• Data breach: Incident response activation',
    '',
    '10.4 Continuous Improvement',
    '',
    '• Quarterly policy reviews',
    '• Annual security audits',
    '• Regular penetration testing',
    '• User feedback integration',
    '• Technology stack updates',
    '• Performance optimization cycles'
  ];

  compliance.forEach(line => {
    checkPageBreak(8);
    if (line.startsWith('10.') || line.endsWith('Alignment:') || line.endsWith('Africa):') || 
        line.endsWith('International):') || line.endsWith('Framework:') || line.endsWith('Policy:') || 
        line.endsWith('Management:') || line.endsWith('Response:') || line.endsWith('Objectives:') || 
        line.endsWith('Strategy:') || line.endsWith('Scenarios:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Conclusion
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusion', margin + 5, yPos + 8);
  yPos += 20;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const conclusion = [
    'The 22 On Sloane platform represents a comprehensive, enterprise-grade solution designed',
    'with security, scalability, and usability at its core. Our architecture demonstrates:',
    '',
    'Security Excellence:',
    '• Multi-layered security from authentication to data storage',
    '• ISO 27001 alignment with comprehensive governance',
    '• POPIA and GDPR compliance for data protection',
    '• Proactive monitoring and incident response capabilities',
    '',
    'Scalability Foundation:',
    '• Cloud-native architecture built on proven technologies',
    '• Auto-scaling serverless compute with edge functions',
    '• Efficient caching and optimization strategies',
    '• Clear scaling path from prototype to enterprise',
    '',
    'Usability Focus:',
    '• Persona-driven user experience',
    '• Progressive disclosure of complexity',
    '• Accessible, responsive design',
    '• Intuitive navigation and workflows',
    '',
    'Enterprise Readiness:',
    '• Comprehensive audit logging and compliance',
    '• Business continuity and disaster recovery',
    '• Vendor management and third-party security',
    '• Change management and deployment controls',
    '',
    'The platform is built on modern, industry-standard technologies including React, TypeScript,',
    'PostgreSQL, and Supabase, ensuring long-term maintainability and community support.',
    'Our integration with Microsoft ecosystem tools (TypeScript, VS Code, GitHub) demonstrates',
    'alignment with industry best practices.',
    '',
    'We welcome technical scrutiny and stand ready to address any architectural concerns or',
    'questions. Our commitment to transparency, security, and excellence makes us a reliable',
    'partner for enterprise collaboration.'
  ];

  conclusion.forEach(line => {
    checkPageBreak(8);
    if (line.endsWith('Excellence:') || line.endsWith('Foundation:') || 
        line.endsWith('Focus:') || line.endsWith('Readiness:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Contact Information
  addNewPage();
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, pageHeight - 80, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Contact Information', pageWidth / 2, pageHeight - 60, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('22 On Sloane', pageWidth / 2, pageHeight - 48, { align: 'center' });
  doc.text('Enterprise Architecture Team', pageWidth / 2, pageHeight - 40, { align: 'center' });
  doc.text('www.22onsloane.co.za', pageWidth / 2, pageHeight - 32, { align: 'center' });

  // Save the PDF
  doc.save('22-on-sloane-architecture-document.pdf');
};
