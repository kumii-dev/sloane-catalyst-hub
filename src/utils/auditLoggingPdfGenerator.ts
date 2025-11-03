import jsPDF from 'jspdf';

export const generateAuditLoggingPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;
  let pageNumber = 0;

  // Typography constants
  const TYPO = {
    FONT: 'helvetica',
    BODY: 11,
    H1: 16,
    H2: 14,
    H3: 12,
    TABLE: 10,
  };

  const LINE_HEIGHT_FACTOR = 1.15;

  // Kumii brand colors (forest green)
  const primaryColor = { r: 34, g: 107, b: 80 }; // #226B50
  const accentColor = { r: 76, g: 175, b: 80 }; // Green accent

  /**
   * Sanitize text to replace problematic characters
   */
  const sanitizeText = (text: string): string => {
    return text
      .replace(/['']/g, "'")  // Smart quotes to regular quotes
      .replace(/[""]/g, '"')
      .replace(/–/g, '-')     // En dash to hyphen
      .replace(/—/g, '--')    // Em dash to double hyphen
      .replace(/→/g, '->')    // Arrow to ASCII arrow
      .replace(/•/g, '*')     // Bullet to asterisk (we'll use graphical bullets)
      .replace(/✓/g, '[x]')   // Checkmark to [x]
      .replace(/☐/g, '[ ]');  // Checkbox to [ ]
  };

  const addPageNumber = () => {
    pageNumber++;
    doc.setFontSize(9);
    doc.setFont(TYPO.FONT, 'normal');
    doc.setTextColor(128, 128, 128);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin - 15) {
      addPageNumber();
      doc.addPage();
      yPos = margin;
    }
  };

  /**
   * Add text with consistent typography
   */
  const addText = (text: string, fontSize: number = TYPO.BODY, isBold: boolean = false, color: { r: number, g: number, b: number } = { r: 0, g: 0, b: 0 }) => {
    const sanitized = sanitizeText(text);
    checkPageBreak(20);
    
    doc.setFontSize(fontSize);
    doc.setFont(TYPO.FONT, isBold ? 'bold' : 'normal');
    doc.setTextColor(color.r, color.g, color.b);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    
    const lines = doc.splitTextToSize(sanitized, maxWidth);
    lines.forEach((line: string) => {
      checkPageBreak(fontSize * 0.5);
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });
    
    yPos += 2;
  };

  /**
   * Add bullet point with graphical circle bullet
   */
  const addBullet = (text: string, indent: number = 0) => {
    const sanitized = sanitizeText(text);
    const bulletX = margin + indent;
    const textX = bulletX + 5;
    const availableWidth = maxWidth - indent - 5;
    
    checkPageBreak(15);
    
    // Draw circular bullet
    doc.setFillColor(34, 107, 80);
    doc.circle(bulletX + 1, yPos - 1.5, 0.8, 'F');
    
    doc.setFontSize(TYPO.BODY);
    doc.setFont(TYPO.FONT, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    
    const lines = doc.splitTextToSize(sanitized, availableWidth);
    lines.forEach((line: string, index: number) => {
      if (index > 0) checkPageBreak(6);
      doc.text(line, textX, yPos);
      yPos += 6;
    });
    
    yPos += 1;
  };

  /**
   * Add section heading
   */
  const addHeading = (text: string, level: 1 | 2 | 3 = 1) => {
    const fontSize = level === 1 ? TYPO.H1 : level === 2 ? TYPO.H2 : TYPO.H3;
    const spacing = level === 1 ? 8 : level === 2 ? 6 : 4;
    
    checkPageBreak(fontSize + spacing);
    yPos += spacing;
    
    doc.setFontSize(fontSize);
    doc.setFont(TYPO.FONT, 'bold');
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    
    const sanitized = sanitizeText(text);
    doc.text(sanitized, margin, yPos);
    yPos += fontSize * 0.6;
    
    // Underline for H1 and H2
    if (level <= 2) {
      doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setLineWidth(level === 1 ? 0.5 : 0.3);
      doc.line(margin, yPos, margin + maxWidth, yPos);
      yPos += 4;
    } else {
      yPos += 3;
    }
  };

  /**
   * Add table with consistent formatting
   */
  const addTableHeader = (headers: string[]) => {
    checkPageBreak(20);
    
    const colWidth = maxWidth / headers.length;
    
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(margin, yPos - 4, maxWidth, 8, 'F');
    
    doc.setFontSize(TYPO.TABLE);
    doc.setFont(TYPO.FONT, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    
    headers.forEach((header, i) => {
      const sanitized = sanitizeText(header);
      doc.text(sanitized, margin + (i * colWidth) + 2, yPos);
    });
    
    yPos += 6;
    
    // Add empty bordered spacer row
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(margin, yPos - 4, maxWidth, 0);
    yPos += 2;
  };

  const addTableRow = (values: string[], isAlternate: boolean = false) => {
    checkPageBreak(20);
    
    const colWidth = maxWidth / values.length;
    
    if (isAlternate) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos - 4, maxWidth, 8, 'F');
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    values.forEach((_, i) => {
      if (i > 0) {
        doc.line(margin + (i * colWidth), yPos - 4, margin + (i * colWidth), yPos + 4);
      }
    });
    
    doc.setFontSize(TYPO.TABLE);
    doc.setFont(TYPO.FONT, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    
    values.forEach((value, i) => {
      const sanitized = sanitizeText(value);
      const cellText = doc.splitTextToSize(sanitized, colWidth - 4);
      doc.text(cellText, margin + (i * colWidth) + 2, yPos);
    });
    
    yPos += 8;
  };

  // ===== COVER PAGE =====
  yPos = pageHeight / 3;
  
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, yPos - 30, pageWidth, 60, 'F');
  
  doc.setFontSize(24);
  doc.setFont(TYPO.FONT, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(0);
  doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
  doc.text('Comprehensive Audit &', pageWidth / 2, yPos, { align: 'center' });
  doc.text('Logging Strategy', pageWidth / 2, yPos + 12, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont(TYPO.FONT, 'normal');
  doc.text('22 On Sloane Platform', pageWidth / 2, yPos + 25, { align: 'center' });
  
  yPos = pageHeight - 60;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Version 1.0', pageWidth / 2, yPos, { align: 'center' });
  doc.text(new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, yPos + 6, { align: 'center' });
  
  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== TABLE OF CONTENTS =====
  addHeading('Table of Contents', 1);
  yPos += 4;
  
  const tocItems = [
    { title: '1. Overview and Principles', page: '3' },
    { title: '2. Logging Architecture', page: '4' },
    { title: '3. Event Categories', page: '5' },
    { title: '4. Implementation Details', page: '7' },
    { title: '5. Log Monitoring and Alerting', page: '10' },
    { title: '6. Compliance Reporting', page: '12' },
    { title: '7. Best Practices', page: '14' },
    { title: '8. Implementation Roadmap', page: '15' },
  ];
  
  doc.setFontSize(TYPO.BODY);
  doc.setFont(TYPO.FONT, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setCharSpace(0);
  doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
  
  tocItems.forEach(item => {
    checkPageBreak(10);
    doc.text(item.title, margin + 5, yPos);
    doc.text(item.page, pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 8;
  });

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 1. OVERVIEW AND PRINCIPLES =====
  addHeading('1. Overview and Principles', 1);
  
  addText(
    'The 22 On Sloane Platform implements a comprehensive audit and logging strategy to ensure security, compliance, and operational excellence. This document outlines our approach to logging, monitoring, and auditing across all platform components.',
    TYPO.BODY
  );

  yPos += 3;
  addHeading('1.1 Purpose', 2);
  
  addBullet('Security monitoring and incident detection');
  addBullet('Compliance with regulatory requirements (POPIA, ISO 27001)');
  addBullet('Troubleshooting and debugging support');
  addBullet('Performance optimization and capacity planning');
  addBullet('User behavior analytics and fraud detection');

  yPos += 3;
  addHeading('1.2 Logging Principles', 2);
  
  addBullet('Completeness: Log all security-relevant events');
  addBullet('Integrity: Logs are immutable and tamper-proof');
  addBullet('Confidentiality: Sensitive data is sanitized before logging');
  addBullet('Retention: Logs retained per compliance requirements');
  addBullet('Performance: Logging does not impact user experience');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 2. LOGGING ARCHITECTURE =====
  addHeading('2. Logging Architecture', 1);
  
  addText(
    'Our logging architecture consists of multiple layers, each serving specific purposes and storing data in appropriate systems.',
    TYPO.BODY
  );

  yPos += 3;
  addHeading('2.1 Log Sources', 2);
  
  addBullet('Frontend: React application with Sentry integration');
  addBullet('Edge Functions: Deno runtime with structured logging');
  addBullet('Database: PostgreSQL with audit triggers');
  addBullet('Authentication: Supabase Auth with event logging');

  yPos += 3;
  addHeading('2.2 Storage Locations', 2);
  
  addText('Sentry', TYPO.BODY, true);
  addBullet('Purpose: Application errors and performance monitoring');
  addBullet('Retention: 90 days for errors, 30 days for performance');
  addBullet('Access: Development team and operations');

  yPos += 2;
  addText('Supabase Analytics', TYPO.BODY, true);
  addBullet('Purpose: Database logs, auth logs, edge function logs');
  addBullet('Retention: 7 days for free tier, 90 days for paid');
  addBullet('Access: Database administrators and developers');

  yPos += 2;
  addText('audit_logs Table', TYPO.BODY, true);
  addBullet('Purpose: Business-critical audit events');
  addBullet('Retention: 7 years per compliance requirements');
  addBullet('Access: Administrators and compliance officers only');

  yPos += 2;
  addText('security_events Table', TYPO.BODY, true);
  addBullet('Purpose: Security incidents and suspicious activities');
  addBullet('Retention: 7 years per compliance requirements');
  addBullet('Access: Security team and administrators only');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 3. EVENT CATEGORIES =====
  addHeading('3. Event Categories', 1);
  
  addText(
    'Events are categorized by type for efficient monitoring, analysis, and compliance reporting.',
    TYPO.BODY
  );

  yPos += 3;
  addHeading('3.1 Authentication Events', 2);
  
  addTableHeader(['Event', 'Log Level', 'Retention', 'Fields Captured']);
  addTableRow(['User Login', 'INFO', '7 years', 'User ID, IP, timestamp, success/failure'], false);
  addTableRow(['User Logout', 'INFO', '7 years', 'User ID, session duration'], true);
  addTableRow(['User Signup', 'INFO', '7 years', 'User ID, email, registration method'], false);
  addTableRow(['Password Reset', 'WARN', '7 years', 'User ID, IP, timestamp'], true);
  addTableRow(['Failed Login', 'WARN', '7 years', 'Email/username, IP, reason'], false);
  addTableRow(['MFA Enabled', 'INFO', '7 years', 'User ID, method (SMS/App)'], true);

  yPos += 3;
  addHeading('3.2 Authorization Events', 2);
  
  addTableHeader(['Event', 'Log Level', 'Retention', 'Fields Captured']);
  addTableRow(['Role Assigned', 'INFO', '7 years', 'User ID, role, admin ID'], false);
  addTableRow(['Role Revoked', 'WARN', '7 years', 'User ID, role, admin ID, reason'], true);
  addTableRow(['Permission Denied', 'WARN', '90 days', 'User ID, resource, action attempted'], false);
  addTableRow(['RLS Policy Violation', 'ERROR', '7 years', 'User ID, table, query, stack trace'], true);

  yPos += 3;
  addHeading('3.3 Data Access Events', 2);
  
  addTableHeader(['Event', 'Log Level', 'Retention', 'Fields Captured']);
  addTableRow(['Credit Assessment Viewed', 'INFO', '7 years', 'User ID, assessment ID, viewer role'], false);
  addTableRow(['File Downloaded', 'INFO', '7 years', 'User ID, file ID, file type'], true);
  addTableRow(['File Uploaded', 'INFO', '7 years', 'User ID, file ID, size, type'], false);
  addTableRow(['Data Export', 'WARN', '7 years', 'User ID, data type, record count'], true);
  addTableRow(['Bulk Data Access', 'WARN', '7 years', 'User ID, table, record count'], false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addHeading('3.4 Financial Events', 2);
  
  addTableHeader(['Event', 'Log Level', 'Retention', 'Fields Captured']);
  addTableRow(['Payment Initiated', 'INFO', '7 years', 'User ID, amount, method, reference'], false);
  addTableRow(['Payment Completed', 'INFO', '7 years', 'Transaction ID, status, amount'], true);
  addTableRow(['Payment Failed', 'ERROR', '7 years', 'Transaction ID, error code, reason'], false);
  addTableRow(['Credit Deducted', 'INFO', '7 years', 'User ID, amount, reason, balance'], true);
  addTableRow(['Credit Added', 'INFO', '7 years', 'User ID, amount, source, balance'], false);
  addTableRow(['Refund Processed', 'INFO', '7 years', 'Transaction ID, amount, reason'], true);

  yPos += 3;
  addHeading('3.5 Security Events', 2);
  
  addTableHeader(['Event', 'Log Level', 'Retention', 'Fields Captured']);
  addTableRow(['Brute Force Detected', 'ERROR', '7 years', 'IP address, target email, attempts'], false);
  addTableRow(['Suspicious Activity', 'ERROR', '7 years', 'User ID, activity type, risk score'], true);
  addTableRow(['Account Locked', 'WARN', '7 years', 'User ID, reason, lock duration'], false);
  addTableRow(['API Rate Limit Hit', 'WARN', '90 days', 'User ID/IP, endpoint, request count'], true);
  addTableRow(['Unauthorized Access', 'ERROR', '7 years', 'User ID, resource, IP, user agent'], false);

  yPos += 3;
  addHeading('3.6 System Events', 2);
  
  addTableHeader(['Event', 'Log Level', 'Retention', 'Fields Captured']);
  addTableRow(['Edge Function Error', 'ERROR', '90 days', 'Function name, error, stack trace'], false);
  addTableRow(['Database Error', 'ERROR', '90 days', 'Query, error message, affected table'], true);
  addTableRow(['Performance Degradation', 'WARN', '30 days', 'Endpoint, response time, threshold'], false);
  addTableRow(['Backup Completed', 'INFO', '30 days', 'Backup type, size, duration'], true);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4. IMPLEMENTATION DETAILS =====
  addHeading('4. Implementation Details', 1);
  
  addHeading('4.1 Frontend Logging', 2);
  
  addText('Frontend logging uses two primary mechanisms:', TYPO.BODY);
  yPos += 2;
  
  addText('Sentry Integration', TYPO.BODY, true);
  addBullet('Automatic error capture with source maps');
  addBullet('Performance monitoring with Core Web Vitals');
  addBullet('User context (ID, email, role) attached to events');
  addBullet('Breadcrumb tracking for event reconstruction');

  yPos += 2;
  addText('Custom Audit Logger (auditLogger.ts)', TYPO.BODY, true);
  addBullet('Business event logging to audit_logs table');
  addBullet('Automatic PII sanitization');
  addBullet('User context from Supabase Auth');
  addBullet('Disabled in development to avoid noise');

  yPos += 3;
  addHeading('4.2 Edge Functions Logging', 2);
  
  addText('Edge functions use structured logging with the following format:', TYPO.BODY);
  yPos += 2;

  addText('Example log entry:', TYPO.BODY, true);
  doc.setFontSize(9);
  doc.setFont(TYPO.FONT, 'normal');
  doc.setTextColor(60, 60, 60);
  addText('{ level: "INFO", timestamp: "2024-01-15T10:30:00Z", function: "calculate-score", user_id: "uuid", action: "score_calculated", details: { score: 750 } }', 9);
  doc.setFontSize(TYPO.BODY);
  doc.setTextColor(0, 0, 0);

  yPos += 2;
  addBullet('All edge functions log entry, exit, errors, and key operations');
  addBullet('Logs accessible via Supabase Analytics dashboard');
  addBullet('Structured format enables efficient querying and alerting');

  yPos += 3;
  addHeading('4.3 Database Logging', 2);
  
  addText('Database logging occurs at multiple levels:', TYPO.BODY);
  yPos += 2;

  addText('Automatic Audit Triggers', TYPO.BODY, true);
  addBullet('created_at and updated_at timestamps on all tables');
  addBullet('Soft delete tracking with deleted_at timestamps');
  addBullet('Trigger functions for sensitive table modifications');

  yPos += 2;
  addText('Manual Audit Logging', TYPO.BODY, true);
  addBullet('High-value operations log to audit_logs table');
  addBullet('RLS policies prevent unauthorized log access');
  addBullet('Immutable logs (INSERT only, no UPDATE/DELETE)');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addHeading('4.4 Authentication Logging', 2);
  
  addText('Supabase Auth provides built-in logging for authentication events. We augment this with custom audit logs for compliance.', TYPO.BODY);
  yPos += 2;

  addBullet('All auth events logged to Supabase Analytics');
  addBullet('Critical events (login, logout, password changes) also logged to audit_logs');
  addBullet('Failed authentication attempts tracked for security monitoring');
  addBullet('Session lifecycle events captured for compliance');

  yPos += 3;
  addHeading('4.5 Accessing Logs', 2);
  
  addText('Sentry Dashboard', TYPO.BODY, true);
  addBullet('Access: https://sentry.io/organizations/kumii/');
  addBullet('View errors, performance, releases, and alerts');
  addBullet('Filter by environment, release, user, tag');

  yPos += 2;
  addText('Supabase Analytics', TYPO.BODY, true);
  addBullet('Access: Supabase Dashboard > Logs & Analytics');
  addBullet('Query database logs, auth logs, edge function logs');
  addBullet('Filter by timestamp, level, function, user');

  yPos += 2;
  addText('Direct Database Queries', TYPO.BODY, true);
  addBullet('Query audit_logs and security_events tables directly');
  addBullet('Requires appropriate database permissions');
  addBullet('Use for compliance reporting and investigations');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 5. LOG MONITORING AND ALERTING =====
  addHeading('5. Log Monitoring and Alerting', 1);
  
  addText(
    'Proactive monitoring ensures rapid detection and response to security incidents, performance issues, and system failures.',
    TYPO.BODY
  );

  yPos += 3;
  addHeading('5.1 Sentry Alerts', 2);
  
  addText('Critical Priority (Immediate Notification)', TYPO.BODY, true);
  addBullet('RLS policy violations');
  addBullet('Unauthorized access attempts');
  addBullet('Payment processing failures');
  addBullet('Data breach indicators');

  yPos += 2;
  addText('High Priority (15-minute delay)', TYPO.BODY, true);
  addBullet('Repeated authentication failures');
  addBullet('Edge function errors (>5 in 5 minutes)');
  addBullet('Database connection failures');
  addBullet('Critical business logic errors');

  yPos += 2;
  addText('Medium Priority (1-hour delay)', TYPO.BODY, true);
  addBullet('Performance degradation (>500ms p95)');
  addBullet('Elevated error rates (>1% of requests)');
  addBullet('Suspicious user behavior patterns');

  yPos += 3;
  addHeading('5.2 Database Monitoring Queries', 2);
  
  addText('Scheduled queries run periodically to detect anomalies:', TYPO.BODY);
  yPos += 2;

  addText('Failed Login Attempts (Check every 5 minutes)', TYPO.BODY, true);
  doc.setFontSize(9);
  doc.setFont(TYPO.FONT, 'normal');
  doc.setTextColor(60, 60, 60);
  addText('Alert if >5 failures for same email or >10 from same IP in 5-minute window', 9);
  doc.setFontSize(TYPO.BODY);
  doc.setTextColor(0, 0, 0);

  yPos += 2;
  addText('Bulk Data Access (Check hourly)', TYPO.BODY, true);
  doc.setFontSize(9);
  doc.setFont(TYPO.FONT, 'normal');
  doc.setTextColor(60, 60, 60);
  addText('Alert if single user accesses >100 records in 1 hour', 9);
  doc.setFontSize(TYPO.BODY);
  doc.setTextColor(0, 0, 0);

  yPos += 2;
  addText('Privilege Escalation (Real-time)', TYPO.BODY, true);
  doc.setFontSize(9);
  doc.setFont(TYPO.FONT, 'normal');
  doc.setTextColor(60, 60, 60);
  addText('Alert immediately on role changes, especially to admin', 9);
  doc.setFontSize(TYPO.BODY);
  doc.setTextColor(0, 0, 0);

  yPos += 3;
  addHeading('5.3 Automated Responses', 2);
  
  addBullet('Rate limiting: Automatically throttle after excessive requests');
  addBullet('Account locking: Lock accounts after repeated failed logins');
  addBullet('IP blocking: Temporarily block IPs exhibiting malicious patterns');
  addBullet('Alert escalation: Escalate to security team if automated response fails');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 6. COMPLIANCE REPORTING =====
  addHeading('6. Compliance Reporting', 1);
  
  addText(
    'Comprehensive reporting capabilities support regulatory compliance and internal audits.',
    TYPO.BODY
  );

  yPos += 3;
  addHeading('6.1 Monthly Security Report', 2);
  
  addBullet('Total authentication events (success and failures)');
  addBullet('Security incidents detected and resolved');
  addBullet('Unauthorized access attempts');
  addBullet('Account lockouts and unlocks');
  addBullet('Role and permission changes');
  addBullet('Data export activities');

  yPos += 3;
  addHeading('6.2 User Activity Report', 2);
  
  addBullet('Active users by role and time period');
  addBullet('Most accessed resources and features');
  addBullet('Average session duration');
  addBullet('Login patterns (time of day, geographic distribution)');
  addBullet('Feature adoption metrics');

  yPos += 3;
  addHeading('6.3 Privileged Access Report', 2);
  
  addBullet('All administrator actions');
  addBullet('Database queries executed by privileged users');
  addBullet('Configuration changes');
  addBullet('User account modifications');
  addBullet('Access to sensitive data (credit assessments, financial data)');

  yPos += 3;
  addHeading('6.4 Compliance Checklist', 2);
  
  addText('ISO 27001 Requirements', TYPO.BODY, true);
  addBullet('Logging enabled for all security-relevant events');
  addBullet('Log integrity protected through RLS and immutability');
  addBullet('Regular log review procedures documented');
  addBullet('Incident response procedures tested quarterly');
  addBullet('Access to logs restricted to authorized personnel');

  yPos += 2;
  addText('POPIA Requirements', TYPO.BODY, true);
  addBullet('Personal data access logged and auditable');
  addBullet('Data subject access requests tracked');
  addBullet('Consent management changes logged');
  addBullet('Data deletion requests recorded');
  addBullet('Cross-border data transfers logged');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 7. BEST PRACTICES =====
  addHeading('7. Best Practices', 1);
  
  addHeading('7.1 What to Log', 2);
  
  addBullet('Authentication events (login, logout, password changes)');
  addBullet('Authorization failures and privilege changes');
  addBullet('Data access, especially sensitive information');
  addBullet('Configuration changes');
  addBullet('Financial transactions');
  addBullet('Security events and anomalies');
  addBullet('System errors and exceptions');

  yPos += 3;
  addHeading('7.2 What NOT to Log', 2);
  
  addBullet('Passwords or password hashes');
  addBullet('API keys or secrets');
  addBullet('Credit card numbers (except last 4 digits)');
  addBullet('ID numbers or SSNs');
  addBullet('Full personal health information');
  addBullet('Excessive diagnostic information in production');

  yPos += 3;
  addHeading('7.3 Log Sanitization', 2);
  
  addText('The auditLogger.ts utility automatically sanitizes sensitive data:', TYPO.BODY);
  yPos += 2;

  addBullet('Password fields replaced with [REDACTED]');
  addBullet('Token fields replaced with [REDACTED]');
  addBullet('Recursive sanitization of nested objects');
  addBullet('Configurable sensitive field list');

  yPos += 3;
  addHeading('7.4 Performance Considerations', 2);
  
  addBullet('Logging is asynchronous to avoid blocking operations');
  addBullet('Development logging disabled to reduce database load');
  addBullet('Batch writes for high-volume events where appropriate');
  addBullet('Log retention policies prevent database bloat');
  addBullet('Indexes on timestamp and user_id for efficient queries');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 8. IMPLEMENTATION ROADMAP =====
  addHeading('8. Implementation Roadmap', 1);
  
  addHeading('Phase 1: Foundation (Complete)', 2);
  addBullet('Sentry integration for frontend monitoring');
  addBullet('Basic audit_logs table structure');
  addBullet('Authentication event logging');
  addBullet('Edge function structured logging');

  yPos += 3;
  addHeading('Phase 2: Compliance (Complete)', 2);
  addBullet('security_events table for security incidents');
  addBullet('Comprehensive PII sanitization');
  addBullet('Data access logging (file downloads, exports)');
  addBullet('Financial transaction logging');
  addBullet('7-year retention policies implemented');

  yPos += 3;
  addHeading('Phase 3: Automation (In Progress)', 2);
  addBullet('Automated alerting for critical security events');
  addBullet('Scheduled monitoring queries');
  addBullet('Automated responses (rate limiting, account locking)');
  addBullet('Compliance report generation');

  yPos += 3;
  addHeading('Phase 4: Advanced Analytics (Planned)', 2);
  addBullet('Machine learning for anomaly detection');
  addBullet('User behavior analytics (UBA)');
  addBullet('Predictive threat detection');
  addBullet('Advanced visualization dashboards');
  addBullet('Real-time security operations center (SOC) integration');

  yPos += 3;
  addHeading('8.1 Maintenance Schedule', 2);
  
  addTableHeader(['Task', 'Frequency', 'Owner']);
  addTableRow(['Review Sentry alerts', 'Daily', 'Development Team'], false);
  addTableRow(['Analyze security events', 'Weekly', 'Security Team'], true);
  addTableRow(['Generate compliance reports', 'Monthly', 'Compliance Officer'], false);
  addTableRow(['Test incident response', 'Quarterly', 'Security Team'], true);
  addTableRow(['Audit log retention', 'Annually', 'Database Administrator'], false);
  addTableRow(['Review and update policies', 'Annually', 'Compliance Officer'], true);

  yPos += 5;
  addHeading('8.2 Log Archival', 2);
  
  addText('Logs exceeding retention periods are archived for regulatory compliance:', TYPO.BODY);
  yPos += 2;

  addBullet('Archive format: Encrypted database dumps');
  addBullet('Storage location: Secure offline storage');
  addBullet('Access: Compliance officer approval required');
  addBullet('Restoration: Available within 48 hours if needed');

  // Final page
  addPageNumber();
  doc.addPage();
  yPos = margin;

  addHeading('Document Control', 1);
  
  addTableHeader(['Field', 'Value']);
  addTableRow(['Document Title', 'Comprehensive Audit & Logging Strategy'], false);
  addTableRow(['Version', '1.0'], true);
  addTableRow(['Date', new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })], false);
  addTableRow(['Owner', 'Security and Compliance Team'], true);
  addTableRow(['Classification', 'Internal'], false);
  addTableRow(['Next Review', 'Annual'], true);

  yPos += 5;
  addHeading('Approval', 2);
  yPos += 5;
  
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 70, yPos);
  yPos += 5;
  doc.setFontSize(10);
  doc.setFont(TYPO.FONT, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Chief Information Security Officer', margin, yPos);

  yPos += 10;
  doc.line(margin, yPos, margin + 70, yPos);
  yPos += 5;
  doc.text('Date', margin, yPos);

  addPageNumber();

  // Save the PDF
  doc.save('22OnSloane_Audit_Logging_Strategy.pdf');
};
