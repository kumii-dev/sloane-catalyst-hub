import jsPDF from 'jspdf';

export const generateGovernancePDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add new page if needed
  const checkAddPage = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      checkAddPage();
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });
    yPos += 3;
  };

  // Helper for section headers
  const addSectionHeader = (text: string, level: number = 1) => {
    checkAddPage(20);
    yPos += 5;
    const fontSize = level === 1 ? 16 : level === 2 ? 14 : 12;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34); // Green color for headers
    doc.text(text, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += fontSize * 0.7;
    
    // Add underline for main sections
    if (level === 1) {
      doc.setDrawColor(34, 139, 34);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
    }
  };

  // Cover Page
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 27001 Governance Framework', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('22 On Sloane Platform', pageWidth / 2, 45, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos = 80;

  addText('Document Version: 1.0', 10, true);
  addText('Last Updated: 2025-11-03', 10);
  addText('Classification: Confidential', 10);
  yPos += 10;

  // Table of Contents
  doc.addPage();
  yPos = margin;
  addSectionHeader('Table of Contents', 1);
  
  const tocItems = [
    '1. Access Control Policy',
    '2. Data Retention & Disposal Policy',
    '3. Vendor Management Policy',
    '4. Incident Response Policy',
    '5. Change Management Policy',
    '6. Business Continuity Policy',
    '7. Privacy & Data Protection Policy',
    '8. Monitoring & Review',
    '9. Roles & Responsibilities',
    '10. Document Control'
  ];
  
  tocItems.forEach(item => {
    addText(item, 11);
  });

  // Section 1: Access Control Policy
  doc.addPage();
  yPos = margin;
  addSectionHeader('1. Access Control Policy', 1);
  
  addSectionHeader('1.1 Purpose', 2);
  addText('Ensure authorized access to platform resources while preventing unauthorized access.');
  
  addSectionHeader('1.2 Scope', 2);
  addText('All users, systems, applications, and data within the 22 On Sloane ecosystem.');
  
  addSectionHeader('1.3 Policy Statements', 2);
  
  addText('User Access Management:', 11, true);
  addText('• Role-Based Access Control (RBAC): All access rights assigned via user_roles table');
  addText('• Principle of Least Privilege: Users granted minimum permissions necessary');
  addText('• Access Review: Quarterly review of all privileged accounts');
  addText('• Termination Process: Immediate revocation upon role change or account deactivation');
  
  yPos += 5;
  addText('Authentication Requirements:', 11, true);
  addText('• Multi-Factor Authentication (MFA): Required for all admin accounts');
  addText('• Password Policy: Minimum 12 characters with complexity requirements');
  addText('• Session Management: Automatic timeout after 30 minutes of inactivity');
  addText('• JWT tokens with 1-hour expiration, refresh tokens valid for 7 days');
  
  yPos += 5;
  addText('Database Access:', 11, true);
  addText('• Row-Level Security (RLS): Enabled on all tables');
  addText('• Security Definer Functions: Used to prevent RLS recursion');
  addText('• Audit Trail: All database changes logged');
  
  addSectionHeader('1.4 Compliance Mapping', 2);
  addText('• ISO 27001: A.9 (Access Control)');
  addText('• POPIA: Section 19 (Security Safeguards)');
  addText('• GDPR: Article 32 (Security of Processing)');

  // Section 2: Data Retention & Disposal
  doc.addPage();
  yPos = margin;
  addSectionHeader('2. Data Retention & Disposal Policy', 1);
  
  addSectionHeader('2.1 Purpose', 2);
  addText('Define lifecycle management for all data types to ensure compliance and optimize storage.');
  
  addSectionHeader('2.2 Retention Schedule', 2);
  addText('User Profiles: Active + 2 years after account closure → Soft delete, then hard delete', 10, true);
  addText('Credit Assessments: 7 years (financial records) → Encrypted archival', 10, true);
  addText('Mentorship Sessions: 3 years after completion → Archival to cold storage', 10, true);
  addText('Messages/Conversations: Active + 1 year → Cascading deletion', 10, true);
  addText('Audit Logs: 7 years (compliance requirement) → Write-once storage', 10, true);
  addText('Financial Transactions: 7 years (tax/audit) → Encrypted archival', 10, true);
  addText('Assessment Documents: 5 years → Encrypted storage bucket', 10, true);
  addText('Analytics Data: 2 years → Aggregated anonymously after 90 days', 10, true);
  
  addSectionHeader('2.3 Data Classification', 2);
  addText('Critical Data (Tier 1):', 11, true);
  addText('PII, financial data, authentication credentials, credit assessments');
  addText('Encryption: AES-256 at rest, TLS 1.3 in transit | Backup: Daily, encrypted, geo-redundant');
  
  yPos += 3;
  addText('Sensitive Data (Tier 2):', 11, true);
  addText('Business documents, mentorship notes, user communications');
  addText('Encryption: At rest and in transit | Backup: Daily, encrypted');
  
  yPos += 3;
  addText('Public Data (Tier 3):', 11, true);
  addText('Service listings, public profiles (with consent)');
  addText('Encryption: In transit only | Backup: Daily');
  
  addSectionHeader('2.4 Right to Erasure (GDPR Article 17)', 2);
  addText('• Request Process: Via support ticket or email');
  addText('• Response Time: 30 days maximum');
  addText('• Scope: All personal data except legal/regulatory retention');
  
  addSectionHeader('2.5 Compliance Mapping', 2);
  addText('• ISO 27001: A.11.2.7 (Disposal of Media)');
  addText('• POPIA: Section 14 (Data Retention)');
  addText('• GDPR: Article 17 (Right to Erasure)');

  // Section 3: Vendor Management
  doc.addPage();
  yPos = margin;
  addSectionHeader('3. Vendor Management Policy', 1);
  
  addSectionHeader('3.1 Purpose', 2);
  addText('Manage third-party vendor risks and ensure compliance with data protection requirements.');
  
  addSectionHeader('3.2 Vendor Categories', 2);
  addText('Critical Vendors (Tier 1): Supabase, Daily.co, Sentry', 10, true);
  addText('Important Vendors (Tier 2): OpenAI, ElevenLabs, Resend', 10, true);
  addText('Standard Vendors (Tier 3): Lovable Platform, npm packages', 10, true);
  
  addSectionHeader('3.3 Vendor Assessment Requirements', 2);
  addText('Pre-Onboarding Checklist:', 11, true);
  addText('✓ SOC 2 Type II certification review');
  addText('✓ ISO 27001 certification verification');
  addText('✓ Data Processing Agreement (DPA) signed');
  addText('✓ Security questionnaire completed');
  addText('✓ Sub-processor disclosure obtained');
  addText('✓ Data location confirmation');
  addText('✓ Incident response procedures documented');
  addText('✓ Business continuity plan reviewed');
  
  addSectionHeader('3.4 Data Processing Agreements (DPA)', 2);
  addText('All Tier 1 and Tier 2 vendors must have signed DPAs covering:');
  addText('• Purpose limitation and data minimization');
  addText('• Security measures (encryption, access control)');
  addText('• Sub-processor management');
  addText('• Data subject rights support');
  addText('• Cross-border transfer mechanisms');
  addText('• Breach notification (within 24 hours)');
  
  addSectionHeader('3.5 Compliance Mapping', 2);
  addText('• ISO 27001: A.15 (Supplier Relationships)');
  addText('• POPIA: Section 20 (Processing by Operator)');
  addText('• GDPR: Article 28 (Processor)');

  // Section 4: Incident Response
  doc.addPage();
  yPos = margin;
  addSectionHeader('4. Incident Response Policy', 1);
  
  addSectionHeader('4.1 Incident Classification', 2);
  addText('Critical: Data breach, system-wide outage, ransomware → Response: <15 min', 10, true);
  addText('High: Service degradation, unauthorized access attempt → Response: <1 hour', 10, true);
  addText('Medium: Performance issues, failed backups → Response: <4 hours', 10, true);
  addText('Low: Minor bugs, user complaints → Response: <24 hours', 10, true);
  
  addSectionHeader('4.2 Incident Response Team (IRT)', 2);
  addText('• Incident Commander: CTO');
  addText('• Security Lead: CISO');
  addText('• Technical Lead: Lead Developer');
  addText('• Communications Lead: COO');
  addText('• Legal Counsel: External/Internal Legal');
  
  addSectionHeader('4.3 Response Phases', 2);
  addText('Phase 1: Detection & Analysis (0-1 hour)', 11, true);
  addText('Initial triage, severity classification, IRT activation for High/Critical');
  
  yPos += 3;
  addText('Phase 2: Containment (1-4 hours)', 11, true);
  addText('Isolate affected systems, preserve evidence, implement temporary mitigations');
  
  yPos += 3;
  addText('Phase 3: Eradication (4-24 hours)', 11, true);
  addText('Root cause analysis, remove threat/vulnerability, patch systems');
  
  yPos += 3;
  addText('Phase 4: Recovery (24-72 hours)', 11, true);
  addText('Restore normal operations, monitor for recurrence, validate system integrity');
  
  yPos += 3;
  addText('Phase 5: Post-Incident Review (Within 7 days)', 11, true);
  addText('Lessons learned meeting, update runbooks, implement preventive controls');
  
  addSectionHeader('4.4 Breach Notification Requirements', 2);
  addText('• POPIA: 72 hours to Information Regulator');
  addText('• GDPR: 72 hours to supervisory authority (if EU users affected)');
  addText('• Users: Without undue delay if high risk to rights and freedoms');
  
  addSectionHeader('4.5 Compliance Mapping', 2);
  addText('• ISO 27001: A.16 (Information Security Incident Management)');
  addText('• POPIA: Section 22 (Security Compromises)');
  addText('• GDPR: Articles 33-34 (Breach Notification)');

  // Section 5: Change Management
  doc.addPage();
  yPos = margin;
  addSectionHeader('5. Change Management Policy', 1);
  
  addSectionHeader('5.1 Purpose', 2);
  addText('Ensure all changes to production systems are controlled, tested, and documented.');
  
  addSectionHeader('5.2 Change Categories', 2);
  addText('Emergency: Security patch, critical bug → Approval: CTO post-implementation', 10, true);
  addText('Standard: Feature updates, migrations → Approval: Tech Lead, Full test suite', 10, true);
  addText('Minor: UI tweaks, copy changes → Approval: Peer review, Unit tests', 10, true);
  
  addSectionHeader('5.3 Change Process', 2);
  addText('Development → Staging → Production:', 11, true);
  addText('1. Development: Feature branch with comprehensive testing');
  addText('2. Staging: Full integration testing with production-like data');
  addText('3. Production: Phased rollout with monitoring');
  
  addSectionHeader('5.4 Database Migrations', 2);
  addText('• All migrations stored in supabase/migrations/');
  addText('• Backward compatible for zero-downtime deployments');
  addText('• Tested on staging environment first');
  addText('• Rollback script prepared');
  addText('• Executed during low-traffic windows');
  
  addSectionHeader('5.5 Rollback Procedures', 2);
  addText('• Code: Git revert + redeployment (<15 minutes)');
  addText('• Database: Migration rollback scripts (<30 minutes)');
  addText('• Edge Functions: Previous version redeployment (<5 minutes)');
  
  addSectionHeader('5.6 Compliance Mapping', 2);
  addText('• ISO 27001: A.12.1.2 (Change Management)');
  addText('• ISO 27001: A.14.2 (Security in Development)');

  // Section 6: Business Continuity
  doc.addPage();
  yPos = margin;
  addSectionHeader('6. Business Continuity Policy', 1);
  
  addSectionHeader('6.1 Critical Business Functions', 2);
  addText('Function                  | RTO    | RPO      | Priority', 10, true);
  addText('─────────────────────────────────────────────────────');
  addText('User Authentication       | 1 hour | 0 (live) | P0');
  addText('Mentorship Sessions       | 4 hours| 15 min   | P1');
  addText('Credit Assessments        | 8 hours| 1 hour   | P1');
  addText('Marketplace Listings      | 24 hrs | 4 hours  | P2');
  addText('Messaging                 | 4 hours| 15 min   | P1');
  addText('File Storage              | 24 hrs | 1 hour   | P2');
  
  addSectionHeader('6.2 Infrastructure Resilience', 2);
  addText('• Database: Supabase multi-region replication');
  addText('• Edge Functions: Auto-scaling, multiple availability zones');
  addText('• Storage: Geo-redundant (3 copies minimum)');
  addText('• CDN: Global distribution via Supabase CDN');
  addText('• Monitoring: Sentry + Supabase Analytics (99.9% uptime)');
  
  addSectionHeader('6.3 Backup Strategy', 2);
  addText('Database Backups:', 11, true);
  addText('• Continuous Point-in-Time Recovery (PITR)');
  addText('• Daily full backups (retained 30 days)');
  addText('• Weekly backups (retained 90 days)');
  addText('• Monthly backups (retained 1 year)');
  
  yPos += 3;
  addText('Storage Buckets:', 11, true);
  addText('• Cross-region replication');
  addText('• Versioning enabled');
  
  addSectionHeader('6.4 Testing Schedule', 2);
  addText('• Backup Restoration: Monthly');
  addText('• Failover Procedures: Quarterly');
  addText('• Full DR Simulation: Annually');
  addText('• Tabletop Exercises: Bi-annually');
  
  addSectionHeader('6.5 Compliance Mapping', 2);
  addText('• ISO 27001: A.17 (Business Continuity)');
  addText('• ISO 22301 (Business Continuity Management)');

  // Section 7: Privacy & Data Protection
  doc.addPage();
  yPos = margin;
  addSectionHeader('7. Privacy & Data Protection Policy', 1);
  
  addSectionHeader('7.1 Legal Basis for Processing (GDPR)', 2);
  addText('• Consent: Marketing communications, optional profile fields');
  addText('• Contract: Service delivery, mentorship sessions');
  addText('• Legal Obligation: Tax records, audit logs');
  addText('• Legitimate Interest: Fraud prevention, analytics (anonymized)');
  
  addSectionHeader('7.2 Data Subject Rights', 2);
  addText('Right              | Process                    | Response Time', 10, true);
  addText('────────────────────────────────────────────────────────────');
  addText('Access             | Email request → data export| 30 days');
  addText('Rectification      | Self-service in settings   | Immediate');
  addText('Erasure            | Support ticket             | 30 days');
  addText('Portability        | Data export in JSON        | 30 days');
  addText('Objection          | Opt-out mechanisms         | Immediate');
  addText('Restriction        | Temporary suspension       | 24 hours');
  
  addSectionHeader('7.3 Cross-Border Transfers', 2);
  addText('• Primary Region: EU (via Supabase EU region)');
  addText('• Sub-processors: US-based (OpenAI, ElevenLabs, Sentry)');
  addText('• Mechanism: Standard Contractual Clauses (SCCs)');
  addText('• Data Localization: South African user data stored in EU');
  
  addSectionHeader('7.4 Privacy by Design', 2);
  addText('• Data Minimization: Only collect necessary fields');
  addText('• Anonymization: Analytics data anonymized after 90 days');
  addText('• Encryption: End-to-end for sensitive communications');
  addText('• Default Settings: Privacy-protective defaults (opt-in for marketing)');
  
  addSectionHeader('7.5 Compliance Mapping', 2);
  addText('• POPIA (Protection of Personal Information Act - South Africa)');
  addText('• GDPR (General Data Protection Regulation - EU)');
  addText('• ISO 27701 (Privacy Information Management)');

  // Section 8: Monitoring & Review
  doc.addPage();
  yPos = margin;
  addSectionHeader('8. Monitoring & Review', 1);
  
  addSectionHeader('8.1 Policy Review Cycle', 2);
  addText('• Quarterly: Access control reviews, vendor assessments');
  addText('• Bi-annually: Incident response drills, policy updates');
  addText('• Annually: Full governance framework audit, DR testing');
  
  addSectionHeader('8.2 Key Performance Indicators (KPIs)', 2);
  addText('• Mean Time to Detect (MTTD): <15 minutes');
  addText('• Mean Time to Respond (MTTR): <1 hour for critical');
  addText('• Backup Success Rate: >99.5%');
  addText('• RLS Policy Coverage: 100% of tables');
  addText('• Vulnerability Patch Time: <48 hours for critical');
  addText('• Security Training Completion: 100% of staff annually');
  
  addSectionHeader('8.3 Audit Trail', 2);
  addText('All policy violations and exceptions logged with:');
  addText('• Timestamp');
  addText('• User/system involved');
  addText('• Policy violated');
  addText('• Justification (for approved exceptions)');
  addText('• Approver');
  
  addSectionHeader('8.4 Continuous Improvement', 2);
  addText('• Post-incident reviews feed into policy updates');
  addText('• Quarterly risk assessments inform priority changes');
  addText('• Industry best practices monitored and adopted');
  addText('• Regulatory changes incorporated within 90 days');

  // Section 9: Roles & Responsibilities
  doc.addPage();
  yPos = margin;
  addSectionHeader('9. Roles & Responsibilities', 1);
  
  addText('CEO:', 11, true);
  addText('Ultimate accountability, resource allocation');
  yPos += 3;
  
  addText('CISO:', 11, true);
  addText('Policy ownership, compliance oversight, risk management');
  yPos += 3;
  
  addText('CTO:', 11, true);
  addText('Technical implementation, architecture decisions');
  yPos += 3;
  
  addText('Data Protection Officer:', 11, true);
  addText('GDPR/POPIA compliance, data subject requests');
  yPos += 3;
  
  addText('DevOps Lead:', 11, true);
  addText('Infrastructure security, monitoring, DR testing');
  yPos += 3;
  
  addText('Legal Counsel:', 11, true);
  addText('Contract review, regulatory interpretation');
  yPos += 3;
  
  addText('All Staff:', 11, true);
  addText('Policy adherence, incident reporting, security awareness');

  // Section 10: Document Control
  doc.addPage();
  yPos = margin;
  addSectionHeader('10. Document Control', 1);
  
  addText('Approved By: CEO', 10, true);
  addText('Effective Date: 2025-11-03');
  addText('Next Review: 2026-02-03');
  yPos += 10;
  
  addSectionHeader('10.1 Version History', 2);
  addText('Version | Date       | Changes                      | Author', 10, true);
  addText('───────────────────────────────────────────────────────────');
  addText('1.0     | 2025-11-03 | Initial governance framework | CISO');
  yPos += 10;
  
  addSectionHeader('10.2 Distribution', 2);
  addText('• Executive Team');
  addText('• All Development Staff');
  addText('• Board of Directors');
  addText('• External Auditors (upon request)');
  yPos += 10;
  
  addSectionHeader('10.3 Classification', 2);
  addText('This document is confidential and proprietary to 22 On Sloane.');
  addText('Unauthorized distribution is prohibited.');

  // Final page - Summary
  doc.addPage();
  yPos = margin;
  addSectionHeader('Summary', 1);
  
  addText('This ISO 27001 Governance Framework establishes comprehensive policies for:');
  yPos += 5;
  
  addText('✓ Access Control and Authentication', 11, true);
  addText('✓ Data Retention and Privacy Protection', 11, true);
  addText('✓ Vendor Risk Management', 11, true);
  addText('✓ Incident Response and Recovery', 11, true);
  addText('✓ Change Management and Testing', 11, true);
  addText('✓ Business Continuity Planning', 11, true);
  addText('✓ POPIA and GDPR Compliance', 11, true);
  addText('✓ Continuous Monitoring and Improvement', 11, true);
  
  yPos += 10;
  addText('For questions or clarifications, contact:', 11, true);
  addText('CISO: security@22onsloane.com');
  addText('CTO: tech@22onsloane.com');
  
  yPos += 15;
  doc.setTextColor(100, 100, 100);
  addText('Generated: ' + new Date().toLocaleDateString(), 9);
  addText('© 2025 22 On Sloane. All rights reserved.', 9);

  // Save the PDF
  doc.save('22-On-Sloane-ISO-27001-Governance-Framework.pdf');
};
