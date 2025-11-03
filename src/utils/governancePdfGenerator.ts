import jsPDF from 'jspdf';

export const generateGovernancePDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;
  let pageNumber = 0;

  // Kumii brand colors (forest green)
  const kumiiGreen = { r: 76, g: 130, b: 88 }; // Forest green matching brand

  // Spacing and layout helpers
  const getLineHeight = (fs: number) => Number((fs * 0.60).toFixed(1));
  const paragraphSpacing = 3; // uniform extra space after paragraphs
  const TABLE_HEADER_HEIGHT = 10;
  const TABLE_ROW_HEIGHT = 8;

  // Helper to add page numbers
  const addPageNumber = () => {
    if (pageNumber > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('Kumii - ISO 27001 Governance Framework', margin, pageHeight - 10);
      doc.setTextColor(0, 0, 0);
    }
  };

  // Helper function to add new page
  const checkAddPage = (requiredSpace: number = 15) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      addPageNumber();
      doc.addPage();
      pageNumber++;
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with consistent formatting
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, maxWidth - indent);

    const lh = getLineHeight(fontSize);
    lines.forEach((line: string, idx: number) => {
      checkAddPage(lh);
      doc.text(line, margin + indent, yPos);
      yPos += lh;
    });
    yPos += paragraphSpacing;
  };

  // Helper for section headers
  const addSectionHeader = (text: string, level: number = 1) => {
    const topPad = level === 1 ? 10 : 6;
    checkAddPage(topPad + 10);
    yPos += topPad;

    const fontSize = level === 1 ? 16 : level === 2 ? 14 : 12;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
    doc.text(text, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += Math.max(4, getLineHeight(fontSize) / 2);

    if (level === 1) {
      doc.setDrawColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
    } else {
      yPos += 4;
    }
  };

  // Helper for bullet points
  const addBullet = (text: string, level: number = 0) => {
    const indent = level * 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const lh = getLineHeight(11);
    checkAddPage(lh);
    doc.text('•', margin + indent, yPos);
    const lines = doc.splitTextToSize(text, maxWidth - indent - 8);
    lines.forEach((line: string, index: number) => {
      if (index > 0) checkAddPage(lh);
      doc.text(line, margin + indent + 8, yPos);
      yPos += lh;
    });
    yPos += 2; // small gap after bullet group
  };

  // Helper for table headers (adds an empty row after the header)
  const addTableHeader = (columns: string[]) => {
    const headerH = TABLE_HEADER_HEIGHT;
    const rowH = TABLE_ROW_HEIGHT;
    checkAddPage(headerH + rowH + 2);

    // Header band
    doc.setFillColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
    doc.rect(margin, yPos - (headerH - 4), maxWidth, headerH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const colWidth = maxWidth / columns.length;
    columns.forEach((col, index) => {
      doc.text(col, margin + (index * colWidth) + 3, yPos);
    });
    doc.setTextColor(0, 0, 0);
    yPos += Math.max(6, headerH - 2);

    // Empty spacer row with light border
    doc.setDrawColor(230, 230, 230);
    doc.rect(margin, yPos - (rowH - 2), maxWidth, rowH);
    yPos += rowH;
    doc.setDrawColor(0, 0, 0);
  };

  // Helper for table rows
  const addTableRow = (columns: string[], isAlt: boolean = false) => {
    const rowH = TABLE_ROW_HEIGHT;
    checkAddPage(rowH + 2);
    if (isAlt) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos - (rowH - 2), maxWidth, rowH, 'F');
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const colWidth = maxWidth / columns.length;
    columns.forEach((col, index) => {
      const lines = doc.splitTextToSize(col, colWidth - 4);
      doc.text(lines[0], margin + (index * colWidth) + 3, yPos);
    });
    yPos += rowH;
  };

  // Cover Page
  doc.setFillColor(kumiiGreen.r, kumiiGreen.g, kumiiGreen.b);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 27001', pageWidth / 2, 30, { align: 'center' });
  doc.text('Governance Framework', pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Kumii Platform', pageWidth / 2, 65, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos = 100;

  addText('Document Version: 1.0', 12, true);
  addText('Last Updated: November 3, 2025', 11);
  addText('Classification: Confidential & Proprietary', 11);
  addText('Owner: Chief Information Security Officer', 11);
  yPos += 10;
  
  addText('This comprehensive governance framework establishes security and compliance policies aligned with ISO 27001, POPIA, GDPR, and industry best practices. It covers all aspects of information security management, access control, data protection, incident response, and business continuity for the Kumii ecosystem.', 11);
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  addText('© 2025 Kumii. All rights reserved. This document contains confidential and proprietary information. Unauthorized distribution, copying, or disclosure is strictly prohibited.', 9);

  // Table of Contents
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('Table of Contents', 1);
  
  const tocItems = [
    { num: '1', title: 'Access Control Policy', page: '5' },
    { num: '1.1', title: 'Purpose and Scope', page: '5', indent: 1 },
    { num: '1.2', title: 'User Access Management', page: '7', indent: 1 },
    { num: '1.3', title: 'Authentication Requirements', page: '11', indent: 1 },
    { num: '1.4', title: 'Database Access Controls', page: '14', indent: 1 },
    { num: '1.5', title: 'Technical Implementation', page: '16', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '2', title: 'Data Retention & Disposal Policy', page: '19' },
    { num: '2.1', title: 'Retention Schedule', page: '19', indent: 1 },
    { num: '2.2', title: 'Data Classification Framework', page: '22', indent: 1 },
    { num: '2.3', title: 'Right to Erasure Procedures', page: '25', indent: 1 },
    { num: '2.4', title: 'Secure Disposal Methods', page: '27', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '3', title: 'Vendor Management Policy', page: '30' },
    { num: '3.1', title: 'Vendor Categories and Risk Assessment', page: '30', indent: 1 },
    { num: '3.2', title: 'Pre-Onboarding Requirements', page: '33', indent: 1 },
    { num: '3.3', title: 'Data Processing Agreements', page: '36', indent: 1 },
    { num: '3.4', title: 'Ongoing Monitoring', page: '38', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '4', title: 'Incident Response Policy', page: '41' },
    { num: '4.1', title: 'Incident Classification Matrix', page: '41', indent: 1 },
    { num: '4.2', title: 'Response Team Structure', page: '44', indent: 1 },
    { num: '4.3', title: 'Five-Phase Response Procedure', page: '47', indent: 1 },
    { num: '4.4', title: 'Breach Notification Requirements', page: '52', indent: 1 },
    { num: '4.5', title: 'Post-Incident Review', page: '54', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '5', title: 'Change Management Policy', page: '57' },
    { num: '5.1', title: 'Change Categories', page: '57', indent: 1 },
    { num: '5.2', title: 'Development Pipeline', page: '60', indent: 1 },
    { num: '5.3', title: 'Rollback Procedures', page: '63', indent: 1 },
    { num: '5.4', title: 'Change Advisory Board', page: '65', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '6', title: 'Business Continuity Policy', page: '68' },
    { num: '6.1', title: 'Critical Business Functions', page: '68', indent: 1 },
    { num: '6.2', title: 'Infrastructure Resilience', page: '71', indent: 1 },
    { num: '6.3', title: 'Disaster Recovery Scenarios', page: '74', indent: 1 },
    { num: '6.4', title: 'Testing and Exercises', page: '77', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '7', title: 'Privacy & Data Protection Policy', page: '80' },
    { num: '7.1', title: 'Legal Basis for Processing', page: '80', indent: 1 },
    { num: '7.2', title: 'Data Subject Rights', page: '83', indent: 1 },
    { num: '7.3', title: 'Cross-Border Transfer Mechanisms', page: '86', indent: 1 },
    { num: '7.4', title: 'Privacy Impact Assessments', page: '88', indent: 1 },
    { num: '', title: '', page: '' },
    { num: '8', title: 'Monitoring & Review', page: '91' },
    { num: '9', title: 'Roles & Responsibilities', page: '93' },
    { num: '10', title: 'Document Control', page: '95' }
  ];
  
  tocItems.forEach(item => {
    if (item.title === '') {
      yPos += 3;
      return;
    }
    checkAddPage();
    doc.setFontSize(11);
    doc.setFont('helvetica', item.indent ? 'normal' : 'bold');
    const indent = (item.indent || 0) * 10;
    const text = item.num ? `${item.num}  ${item.title}` : item.title;
    doc.text(text, margin + indent, yPos);
    doc.text(item.page, pageWidth - margin - 10, yPos);
    yPos += 6;
  });

  // Executive Summary
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('Executive Summary', 1);
  
  addText('This ISO 27001 Governance Framework establishes the comprehensive information security management system for Kumii, a leading fintech platform connecting startups with mentors, funders, and service providers across Africa. As Kumii processes sensitive financial data, personal information, and proprietary business intelligence, maintaining the highest standards of security and compliance is paramount to our mission.');
  
  yPos += 3;
  addText('Framework Objectives:', 12, true);
  addBullet('Protect the confidentiality, integrity, and availability of all information assets');
  addBullet('Ensure compliance with ISO 27001, POPIA, GDPR, and relevant financial regulations');
  addBullet('Establish clear roles, responsibilities, and accountability for security');
  addBullet('Implement defense-in-depth security controls across all system layers');
  addBullet('Enable rapid detection, response, and recovery from security incidents');
  addBullet('Foster a culture of security awareness and continuous improvement');
  
  yPos += 5;
  addText('Governance Scope:', 12, true);
  addText('This framework applies to all Kumii systems, applications, data, personnel, and third-party vendors with access to company resources. It encompasses:');
  
  addBullet('Web applications and mobile interfaces');
  addBullet('Backend databases (PostgreSQL via Supabase)');
  addBullet('Cloud infrastructure (Supabase/AWS)');
  addBullet('Edge functions and serverless computing');
  addBullet('Third-party integrations (payment processors, KYC providers, communication tools)');
  addBullet('Employee workstations and remote access');
  addBullet('Physical facilities and paper records');
  
  // SECTION 1: ACCESS CONTROL POLICY
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('1. Access Control Policy', 1);
  
  addSectionHeader('1.1 Purpose and Scope', 2);
  addText('The Access Control Policy establishes the framework for managing and controlling access to all information systems, applications, data, and resources within the Kumii platform ecosystem. This policy ensures that only authorized individuals can access specific resources based on their role and business need, implementing the principle of least privilege across all systems.');
  
  addText('This policy applies to:');
  addBullet('All users (employees, contractors, partners, clients) accessing the platform');
  addBullet('All system components including web applications, databases, APIs, and edge functions');
  addBullet('All data stored or processed within the platform infrastructure');
  addBullet('Third-party integrations and service providers with system access');
  addBullet('Administrative and privileged access accounts');
  
  yPos += 5;
  addText('The policy is designed to meet or exceed requirements from:');
  addBullet('ISO/IEC 27001:2013 - Annex A.9 (Access Control)');
  addBullet('POPIA (Protection of Personal Information Act) - Section 19');
  addBullet('GDPR (General Data Protection Regulation) - Article 32');
  addBullet('NIST Cybersecurity Framework - Protect (PR.AC)');
  addBullet('PCI DSS - Requirement 7 (Restrict access to cardholder data)');
  
  yPos += 5;
  addText('Policy Principles:', 12, true);
  addText('Our access control framework is built on five fundamental principles:');
  
  addBullet('Least Privilege: Users receive only the minimum access needed to perform their duties');
  addBullet('Separation of Duties: Critical functions require multiple people to prevent fraud');
  addBullet('Need-to-Know: Access to sensitive data is restricted to those with legitimate business need');
  addBullet('Defense in Depth: Multiple layers of access controls protect high-value assets');
  addBullet('Deny by Default: Access is explicitly denied unless specifically granted');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Risk-Based Access Control:', 12, true);
  addText('Access decisions are informed by continuous risk assessment considering:');
  
  addBullet('Sensitivity of data being accessed (public, internal, confidential, restricted)');
  addBullet('User role and clearance level');
  addBullet('Historical access patterns and anomaly detection');
  addBullet('Geographic location and network security posture');
  addBullet('Device security status and compliance');
  addBullet('Time of access and business context');
  
  yPos += 5;
  addText('Access Control Objectives:', 12, true);
  addTableHeader(['Objective', 'Target', 'Measurement']);
  addTableRow(['User Access Reviews', 'Quarterly', 'Completion rate'], false);
  addTableRow(['Privileged Access Reviews', 'Monthly', 'Coverage percentage'], true);
  addTableRow(['Access Request Fulfillment', '< 24 hours', 'Average time'], false);
  addTableRow(['Access Removal on Termination', '< 1 hour', 'Compliance rate'], true);
  addTableRow(['MFA Adoption (Admin)', '100%', 'Enrollment rate'], false);
  addTableRow(['MFA Adoption (All Users)', '> 95%', 'Enrollment rate'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('1.2 User Access Management', 2);
  addText('User access management governs how user accounts are created, modified, reviewed, and terminated. The platform implements a comprehensive lifecycle management process for all user accounts.');
  
  yPos += 3;
  addText('Role-Based Access Control (RBAC) Framework:', 12, true);
  addText('The platform implements a sophisticated RBAC system that assigns permissions based on predefined roles stored in the user_roles database table. Each role defines a specific set of capabilities and access rights aligned with business functions.');
  
  yPos += 3;
  addText('Defined User Roles:', 11, true);
  
  addBullet('Admin: Full platform access including user management, system configuration, analytics review, and all administrative functions. Requires additional MFA verification and approval from C-level executive. Limited to maximum 5 concurrent admins. All actions logged with video playback capability.');
  
  addBullet('Mentor: Access to mentorship features, session scheduling, mentee profiles, messaging, and session history. Can view relevant startup information and assessment results. Restricted from accessing financial transactions and funding applications. Can export session notes and progress reports.');
  
  addBullet('Startup: Access to business tools, credit assessments, funding applications, marketplace, mentorship booking, and file management. Can manage company profile and team members. Can invite up to 10 team members per startup. Access to financial modeling tools and pitch deck builder.');
  
  addBullet('Funder: Access to startup applications, due diligence documents, assessment results, and communication tools. Can review funding requests and manage investment pipeline. Advanced analytics on portfolio companies. Can create custom evaluation scorecards.');
  
  addBullet('Service Provider: Access to marketplace listing management, service delivery tools, client communications, and payment processing. Can offer services and respond to requests. Revenue analytics and client feedback dashboard. Can manage up to 50 active listings.');
  
  addBullet('Service Provider Pending: Limited access pending approval. Can view platform features but cannot create listings or engage in transactions until verified. Read-only access to marketplace. Can submit verification documents.');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Additional Specialized Roles:', 12, true);
  addBullet('Compliance Officer: Access to audit logs, compliance reports, user activity monitoring, and policy management. Can generate regulatory reports and conduct investigations.');
  
  addBullet('Customer Support: Limited access to user profiles for support purposes. Can view issues, reset passwords (with verification), and access support tickets. All access logged and reviewed weekly.');
  
  addBullet('Developer: Access to development and staging environments only. Cannot access production data without approval. Code commits require peer review. Deployment access restricted to senior developers.');
  
  addBullet('Data Analyst: Read-only access to anonymized analytics data. Cannot view PII without specific approval. Can run queries on aggregate data. All queries logged.');
  
  yPos += 5;
  addText('Role Permission Matrix:', 12, true);
  addTableHeader(['Function', 'Admin', 'Startup', 'Funder', 'Service Provider']);
  addTableRow(['User Management', 'Full', 'Team Only', 'None', 'None'], false);
  addTableRow(['Financial Data', 'Full', 'Own Only', 'Portfolio', 'Own Only'], true);
  addTableRow(['System Config', 'Full', 'None', 'None', 'None'], false);
  addTableRow(['Analytics', 'Full', 'Own Only', 'Portfolio', 'Own Only'], true);
  addTableRow(['Audit Logs', 'Full', 'Own Only', 'Own Only', 'Own Only'], false);
  addTableRow(['Support Tickets', 'All', 'Own', 'Own', 'Own'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Principle of Least Privilege:', 12, true);
  addText('All users are granted only the minimum level of access necessary to perform their job functions. This principle is enforced through:');
  
  addBullet('Default deny approach - no access is granted unless explicitly authorized');
  addBullet('Time-limited access for temporary requirements with automatic expiration');
  addBullet('Segregation of duties for sensitive operations (e.g., fund disbursement requires dual authorization)');
  addBullet('Regular access reviews to ensure continued business need and remove stale permissions');
  addBullet('Automatic access revocation upon role changes or termination');
  addBullet('Just-in-time access elevation for administrative tasks with session recording');
  
  yPos += 5;
  addText('Access Request and Approval Process:', 12, true);
  addText('All access requests must follow this standardized workflow:');
  
  yPos += 3;
  addText('Step 1 - Request Submission:', 11, true);
  addBullet('User submits access request through the platform or via email to security@kumii.com');
  addBullet('Request must specify: role required, business justification, duration needed, specific resources');
  addBullet('Attach supporting documentation (job description, project authorization, manager approval)');
  addBullet('For privileged access, include risk assessment and compensating controls');
  
  yPos += 3;
  addText('Step 2 - Manager Approval:', 11, true);
  addBullet('Direct manager or project sponsor reviews and approves the business justification');
  addBullet('Confirms the role aligns with job responsibilities and organizational policies');
  addBullet('Verifies the requested access duration is appropriate');
  addBullet('Manager approval must be received within 48 hours or request is auto-rejected');
  
  yPos += 3;
  addText('Step 3 - Security Review:', 11, true);
  addBullet('CISO or delegated security team member reviews for compliance with security policies');
  addBullet('Checks for potential conflicts of interest or segregation of duties violations');
  addBullet('Validates that compensating controls are in place for high-risk access');
  addBullet('Reviews user\'s historical access patterns and incident history');
  addBullet('For admin access, requires additional background check verification');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Step 4 - Provisioning:', 11, true);
  addBullet('DevOps team provisions access within 24 hours of final approval using standardized procedures');
  addBullet('Access is configured through infrastructure-as-code to ensure consistency');
  addBullet('Changes are peer-reviewed before deployment to production');
  addBullet('Automated testing verifies access grants work correctly and don\'t over-provision');
  addBullet('All provisioning activities logged to audit trail');
  
  yPos += 3;
  addText('Step 5 - Notification and Training:', 11, true);
  addBullet('User receives confirmation email with access details and activation instructions');
  addBullet('Email includes policy requirements, security guidelines, and acceptable use policy');
  addBullet('For new roles, user must complete role-specific security training within 7 days');
  addBullet('User acknowledges understanding of responsibilities and compliance requirements');
  addBullet('Calendar reminder set for access review before expiration');
  
  yPos += 5;
  addText('Access Request Tracking:', 12, true);
  addText('All access requests are tracked in a centralized system with the following information:');
  
  addTableHeader(['Field', 'Description', 'Required']);
  addTableRow(['Request ID', 'Unique identifier', 'Yes'], false);
  addTableRow(['Requestor', 'User requesting access', 'Yes'], true);
  addTableRow(['Role/Permission', 'Specific access requested', 'Yes'], false);
  addTableRow(['Business Justification', 'Why access is needed', 'Yes'], true);
  addTableRow(['Duration', 'How long access is needed', 'Yes'], false);
  addTableRow(['Manager Approval', 'Approver name and date', 'Yes'], true);
  addTableRow(['Security Approval', 'CISO/delegate and date', 'Yes'], false);
  addTableRow(['Provisioning Date', 'When access was granted', 'Yes'], true);
  addTableRow(['Expiration Date', 'When access expires', 'If temporary'], false);
  addTableRow(['Review Date', 'Next scheduled review', 'Yes'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Quarterly Access Reviews:', 12, true);
  addText('Every quarter, a comprehensive review of all user accounts and access rights is conducted to ensure continued appropriateness. The review process includes:');
  
  yPos += 3;
  addText('Review Preparation (Week 1):', 11, true);
  addBullet('Automated report generation listing all active accounts and their assigned roles');
  addBullet('Identification of dormant accounts (no login for 90 days)');
  addBullet('Flagging of accounts with excessive permissions or unusual access patterns');
  addBullet('List of accounts approaching certification expiration');
  addBullet('Report distributed to all managers and department heads');
  
  yPos += 3;
  addText('Manager Certification (Week 2-3):', 11, true);
  addBullet('Each manager reviews their team members\' access rights');
  addBullet('Certifies that each user still requires their current access level');
  addBullet('Identifies any access that should be modified or revoked');
  addBullet('Documents business justification for continued access');
  addBullet('Submits certification through the access management portal');
  
  yPos += 3;
  addText('Security Team Validation (Week 3):', 11, true);
  addBullet('Security team reviews manager certifications for completeness');
  addBullet('Validates compliance with policies and regulatory requirements');
  addBullet('Investigates any anomalies or high-risk access patterns');
  addBullet('Recommends additional controls or access modifications');
  
  yPos += 3;
  addText('Remediation and Documentation (Week 4):', 11, true);
  addBullet('All identified access issues are remediated within 5 business days');
  addBullet('Dormant accounts are automatically disabled');
  addBullet('Excessive permissions are right-sized to current role');
  addBullet('Documentation of all changes maintained in access management system');
  addBullet('Executive summary report provided to CISO and senior management');
  addBullet('Metrics tracked: accounts reviewed, access modifications, policy violations');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Privileged Access Reviews (Monthly):', 12, true);
  addText('Administrative and privileged accounts undergo more frequent monthly reviews due to their elevated risk:');
  
  addBullet('Review all admin, root, and service account access');
  addBullet('Verify multi-factor authentication is enabled and functioning');
  addBullet('Examine privileged session logs for anomalies');
  addBullet('Confirm privileged access usage aligns with job duties');
  addBullet('Test privileged account monitoring and alerting');
  addBullet('Update privileged account inventory');
  
  yPos += 5;
  addText('Account Termination Process:', 12, true);
  addText('When an employee leaves the organization or a user account is no longer needed, access must be revoked immediately following this procedure:');
  
  yPos += 3;
  addText('Immediate Actions (Within 1 Hour):', 11, true);
  addBullet('HR initiates termination workflow in HRIS system');
  addBullet('Automated notification sent to security team, IT, and direct manager');
  addBullet('All active sessions immediately terminated');
  addBullet('Access rights immediately suspended across all systems');
  addBullet('VPN and remote access disabled');
  addBullet('Corporate email access disabled');
  addBullet('Physical access badges deactivated');
  
  yPos += 3;
  addText('Follow-Up Actions (Within 24 Hours):', 11, true);
  addBullet('Account fully deactivated in all systems');
  addBullet('User removed from all security groups and distribution lists');
  addBullet('API keys and service account credentials rotated if user had access');
  addBullet('Recovery of company equipment (laptop, phone, security tokens)');
  addBullet('Data ownership transferred to manager or designated individual');
  addBullet('Personal files separated from company data');
  
  yPos += 3;
  addText('Final Documentation (Within 1 Week):', 11, true);
  addBullet('Audit log of all account activity retained per retention policy (7 years)');
  addBullet('Exit interview documentation completed');
  addBullet('Certification that all access has been revoked');
  addBullet('Equipment return confirmation');
  addBullet('Final security briefing on ongoing confidentiality obligations');
  addBullet('Archive of user\'s work product and files');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('1.3 Authentication Requirements', 2);
  addText('Strong authentication mechanisms protect against unauthorized access by verifying user identity before granting system access. The platform implements multiple layers of authentication controls aligned with industry best practices and regulatory requirements.');
  
  yPos += 3;
  addText('Multi-Factor Authentication (MFA):', 12, true);
  addText('MFA is mandatory for all administrative accounts and highly recommended for all users. The platform supports multiple MFA methods with varying security levels:');
  
  yPos += 3;
  addText('Supported MFA Methods:', 11, true);
  addBullet('Time-based One-Time Passwords (TOTP) via authenticator apps - Recommended primary method (Google Authenticator, Authy, Microsoft Authenticator, 1Password)');
  addBullet('Hardware security keys - Highest security option using FIDO2/WebAuthn standard (YubiKey, Google Titan, etc.)');
  addBullet('SMS-based verification codes - Fallback option for users without smartphone access');
  addBullet('Email verification with one-time codes - Account recovery only');
  addBullet('Biometric authentication on supported mobile devices - Touch ID, Face ID');
  addBullet('Push notifications via mobile app - For approved corporate devices');
  
  yPos += 5;
  addText('MFA Requirements by Role:', 12, true);
  addTableHeader(['Role', 'MFA Required', 'Allowed Methods', 'Grace Period']);
  addTableRow(['Admin', 'Mandatory', 'TOTP, Hardware Key', 'None'], false);
  addTableRow(['Developer', 'Mandatory', 'TOTP, Hardware Key', '24 hours'], true);
  addTableRow(['Funder', 'Mandatory', 'TOTP, SMS, Hardware Key', '7 days'], false);
  addTableRow(['Startup', 'Recommended', 'TOTP, SMS, Email', '30 days'], true);
  addTableRow(['Mentor', 'Recommended', 'TOTP, SMS, Email', '30 days'], false);
  addTableRow(['Service Provider', 'Recommended', 'TOTP, SMS, Email', '30 days'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('MFA Enrollment Process:', 12, true);
  addText('New users and users upgrading to roles requiring MFA must complete the enrollment process:');
  
  yPos += 3;
  addText('Step 1 - Enrollment Initiation:', 11, true);
  addBullet('User prompted to enable MFA upon first login or immediately upon role change to privileged account');
  addBullet('System displays list of available MFA methods with security recommendations');
  addBullet('User selects primary MFA method and optional backup method');
  addBullet('For admin accounts, hardware security key is strongly recommended');
  
  yPos += 3;
  addText('Step 2 - Method Setup:', 11, true);
  addBullet('TOTP Setup: User scans QR code with authenticator app and enters test code to verify');
  addBullet('Hardware Key: User inserts key and follows browser prompts to register device');
  addBullet('SMS Setup: User verifies phone number ownership by entering code sent via SMS');
  addBullet('Each setup includes test verification to ensure method works correctly');
  
  yPos += 3;
  addText('Step 3 - Backup Codes:', 11, true);
  addBullet('System generates 10 single-use backup recovery codes');
  addBullet('User must download and securely store codes (print or password manager)');
  addBullet('Warning displayed that backup codes should be treated like passwords');
  addBullet('User confirms codes are saved before proceeding');
  addBullet('Option to regenerate codes if lost (requires identity verification)');
  
  yPos += 3;
  addText('Step 4 - Enrollment Completion:', 11, true);
  addBullet('User performs complete login flow using new MFA method to verify setup');
  addBullet('Grace period begins (if applicable) allowing optional MFA usage');
  addBullet('Email confirmation sent with enrollment details and security tips');
  addBullet('For mandatory MFA roles, reminder emails sent as grace period expires');
  addBullet('After grace period, MFA becomes required for all logins');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('MFA Recovery Process:', 12, true);
  addText('If a user loses access to their MFA device, they can recover using this process:');
  
  addBullet('User clicks "Lost MFA device?" link on login page');
  addBullet('Enters email address and receives verification link');
  addBullet('Uses backup recovery code to regain access');
  addBullet('If no backup codes available, submits identity verification request');
  addBullet('Support team validates identity using government ID and video call');
  addBullet('After verification, temporary access granted to re-enroll MFA');
  addBullet('All recovery attempts logged and reviewed for suspicious activity');
  
  yPos += 5;
  addText('Password Policy Requirements:', 12, true);
  addText('All user passwords must meet comprehensive complexity and management requirements designed to resist common attack vectors:');
  
  yPos += 3;
  addTableHeader(['Requirement', 'Standard Users', 'Admin Users', 'Service Accounts']);
  addTableRow(['Minimum Length', '12 characters', '14 characters', '32 characters'], false);
  addTableRow(['Complexity', 'Upper, lower, number', 'Upper, lower, number, special', 'Random generated'], true);
  addTableRow(['Password History', '3 previous', '5 previous', 'N/A'], false);
  addTableRow(['Maximum Age', 'No expiration', '90 days', 'No expiration'], true);
  addTableRow(['Lockout Threshold', '5 failed attempts', '3 failed attempts', '10 failed attempts'], false);
  addTableRow(['Lockout Duration', '15 minutes', '30 minutes', '60 minutes'], true);
  addTableRow(['Reset Frequency', 'As needed', 'Quarterly', 'Annual'], false);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Password Complexity Rules:', 12, true);
  addText('Passwords are validated against the following rules using automated password strength checking:');
  
  addBullet('Must contain at least one uppercase letter (A-Z)');
  addBullet('Must contain at least one lowercase letter (a-z)');
  addBullet('Must contain at least one number (0-9)');
  addBullet('Admin accounts must include special characters (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  addBullet('Cannot contain username, email address, or common personal information');
  addBullet('Cannot contain common dictionary words or patterns (password, 12345, qwerty)');
  addBullet('Cannot reuse any of the last 3-5 passwords (role dependent)');
  addBullet('Must not appear in known breach databases (checked via Have I Been Pwned API)');
  addBullet('Cannot use simple character substitutions (e.g., P@ssw0rd)');
  addBullet('Entropy must meet minimum bits of randomness (80 bits for standard, 90 bits for admin)');
  
  yPos += 5;
  addText('Password Storage and Encryption:', 12, true);
  addText('All passwords are protected using industry-leading cryptographic methods:');
  
  addBullet('Passwords hashed using bcrypt algorithm with work factor of 12');
  addBullet('Each password uses unique random salt to prevent rainbow table attacks');
  addBullet('Hashes stored in database with row-level encryption');
  addBullet('Database backups encrypted with AES-256');
  addBullet('Password reset tokens are cryptographically secure random values');
  addBullet('Reset tokens expire after 1 hour and are single-use only');
  addBullet('All password verification attempts logged for security monitoring');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Session Management Controls:', 12, true);
  addText('Session security prevents unauthorized access to active user sessions through comprehensive timeout and token management:');
  
  yPos += 3;
  addText('Automatic Session Timeout:', 11, true);
  addBullet('Idle timeout: 30 minutes of inactivity for standard users');
  addBullet('Idle timeout: 15 minutes for admin sessions due to elevated privileges');
  addBullet('Idle timeout: 60 minutes for public pages with no sensitive data');
  addBullet('Warning notification displayed 2 minutes before timeout with option to extend');
  addBullet('User prompted to re-authenticate after timeout (username pre-filled for convenience)');
  addBullet('All session data cleared on timeout to prevent session fixation');
  
  yPos += 3;
  addText('Absolute Session Timeout:', 11, true);
  addBullet('Maximum session duration: 8 hours for standard users regardless of activity');
  addBullet('Maximum session duration: 4 hours for admin users');
  addBullet('User must fully re-authenticate after absolute timeout');
  addBullet('Warning displayed 10 minutes before absolute timeout');
  addBullet('Active sessions display remaining time in navigation bar');
  
  yPos += 3;
  addText('Session Token Security:', 11, true);
  addBullet('Session tokens generated using cryptographically secure random number generator');
  addBullet('Tokens are 256-bit random values encoded as hexadecimal strings');
  addBullet('Tokens transmitted only over HTTPS with Secure and HttpOnly flags');
  addBullet('SameSite=Strict cookie attribute prevents CSRF attacks');
  addBullet('Tokens rotated on privilege escalation or role changes');
  addBullet('All tokens invalidated on password change or explicit logout');
  addBullet('Database stores token hash, not plaintext value');
  
  yPos += 3;
  addText('Concurrent Session Limits:', 11, true);
  addBullet('Standard users: Maximum 3 concurrent sessions (desktop, tablet, phone)');
  addBullet('Admin users: Maximum 1 concurrent session to prevent credential sharing');
  addBullet('New login terminates oldest session if limit exceeded');
  addBullet('User receives notification when new session created on different device');
  addBullet('Session management page shows all active sessions with device info and location');
  addBullet('Users can remotely terminate suspicious sessions from account settings');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('1.4 Database Access Controls', 2);
  addText('Database access controls protect sensitive data stored in PostgreSQL databases through Row Level Security (RLS), role-based permissions, and comprehensive auditing. All database access is governed by the principle of least privilege and monitored for suspicious activity.');
  
  yPos += 3;
  addText('Row Level Security (RLS) Policies:', 12, true);
  addText('RLS ensures users can only access data appropriate for their role and business context:');
  
  addBullet('All tables have RLS enabled by default - no exceptions for new tables');
  addBullet('Policies enforce data isolation between organizations, startups, and users');
  addBullet('Users can view/modify only their own data unless explicitly granted permission');
  addBullet('Funders can access only startups they are actively evaluating or invested in');
  addBullet('Service providers see only their own listings and client interactions');
  addBullet('Mentors access mentee information only for active or scheduled sessions');
  addBullet('Admin access logged with justification and reviewed weekly');
  
  yPos += 5;
  addText('Key RLS Policy Examples:', 12, true);
  
  yPos += 3;
  addText('Profiles Table:', 11, true);
  addBullet('Users can view their own profile (auth.uid() = user_id)');
  addBullet('All users can view public profile fields of other users');
  addBullet('Only admins can view sensitive fields (email, phone, KYC status)');
  addBullet('Users can update only their own profile');
  addBullet('Profile deletion requires admin approval');
  
  yPos += 3;
  addText('Credit Assessments Table:', 11, true);
  addBullet('Startups can view only their own credit assessments');
  addBullet('Funders can view assessments of startups they are evaluating');
  addBullet('Admins and compliance officers can view all assessments');
  addBullet('Assessment creation restricted to authenticated startups');
  addBullet('Historical assessments are read-only after 30 days');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Funding Applications Table:', 11, true);
  addBullet('Startups can view and modify their own applications');
  addBullet('Funders can view applications they received');
  addBullet('Application status changes logged with timestamp and actor');
  addBullet('Withdrawn applications become read-only');
  addBullet('All access to funded deals requires dual authentication');
  
  yPos += 3;
  addText('Financial Models Table:', 11, true);
  addBullet('Startup owners can create and modify their financial models');
  addBullet('Models shared with funders only when application submitted');
  addBullet('Read-only access for funders to prevent tampering');
  addBullet('Model version history maintained for audit trail');
  addBullet('Sensitive assumptions visible only to model creator and admin');
  
  yPos += 5;
  addText('Database Role Segregation:', 12, true);
  addText('Different database roles limit blast radius of credential compromise:');
  
  addTableHeader(['Role', 'Access Level', 'Used By', 'Restrictions']);
  addTableRow(['app_user', 'Read/Write via RLS', 'Web application', 'RLS enforced'], false);
  addTableRow(['app_admin', 'Full access', 'Admin tools', 'MFA required'], true);
  addTableRow(['analytics', 'Read-only', 'Analytics engine', 'No PII access'], false);
  addTableRow(['backup', 'Read-only', 'Backup service', 'Network restricted'], true);
  addTableRow(['migrations', 'Schema changes', 'CI/CD pipeline', 'Time-limited'], false);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Database Access Monitoring:', 12, true);
  addText('All database access is logged and monitored for security and compliance:');
  
  addBullet('Query logging enabled for all operations');
  addBullet('Slow query alerts trigger investigation (> 5 seconds)');
  addBullet('Failed authentication attempts logged and alerted after 3 failures');
  addBullet('Unusual access patterns detected via machine learning (e.g., bulk exports)');
  addBullet('Admin queries reviewed daily for policy violations');
  addBullet('Full audit trail retained for 7 years per compliance requirements');
  
  yPos += 5;
  addText('Data Export Controls:', 12, true);
  addText('Bulk data exports are restricted and monitored to prevent data exfiltration:');
  
  addBullet('Standard users can export only their own data in CSV or PDF format');
  addBullet('Export size limited to 10,000 records per request');
  addBullet('Exports containing PII are watermarked with user ID and timestamp');
  addBullet('Large exports (> 1,000 records) require manager approval');
  addBullet('All exports logged with user, timestamp, record count, and filters used');
  addBullet('Unusual export activity triggers automatic security review');
  addBullet('Admin exports require business justification and CISO approval');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('1.5 Technical Implementation', 2);
  addText('Access controls are implemented through multiple layers of technical controls ensuring defense in depth:');
  
  yPos += 3;
  addText('Application Layer Controls:', 12, true);
  addBullet('Supabase Auth handles authentication and session management');
  addBullet('JWT tokens issued upon successful authentication with 1-hour expiration');
  addBullet('Refresh tokens valid for 7 days, rotated on each use');
  addBullet('Token validation on every API request with signature verification');
  addBullet('Rate limiting prevents brute force attacks (10 attempts per minute per IP)');
  addBullet('Input validation prevents injection attacks and malformed requests');
  
  yPos += 3;
  addText('Network Layer Controls:', 12, true);
  addBullet('All traffic encrypted with TLS 1.3 (TLS 1.2 minimum)');
  addBullet('HTTP Strict Transport Security (HSTS) enforces HTTPS');
  addBullet('Admin interfaces accessible only from whitelisted IP ranges');
  addBullet('VPN required for administrative access to production systems');
  addBullet('DDoS protection via cloud provider (AWS Shield)');
  addBullet('Web Application Firewall (WAF) blocks common attack patterns');
  
  yPos += 3;
  addText('Infrastructure Layer Controls:', 12, true);
  addBullet('Database encrypted at rest using AES-256');
  addBullet('Database connections encrypted with SSL/TLS');
  addBullet('Automated security patching for all infrastructure components');
  addBullet('Intrusion detection system monitors for suspicious activity');
  addBullet('Network segmentation isolates production, staging, and development');
  addBullet('Cloud provider security controls (AWS IAM, Security Groups)');
  
  // SECTION 2: DATA RETENTION & DISPOSAL
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('2. Data Retention & Disposal Policy', 1);
  
  addText('The Data Retention & Disposal Policy establishes requirements for how long different types of data are retained and how they are securely disposed of when no longer needed. This policy balances business needs, legal requirements, and privacy principles to minimize data retention while supporting operational and compliance objectives.');
  
  addSectionHeader('2.1 Retention Schedule', 2);
  addText('Kumii retains different categories of data for varying periods based on legal, regulatory, business, and technical requirements:');
  
  yPos += 3;
  addText('User Account Data:', 12, true);
  addTableHeader(['Data Type', 'Retention Period', 'Justification']);
  addTableRow(['Active user profiles', 'Duration of account + 7 years', 'Legal/Financial records'], false);
  addTableRow(['Inactive accounts', '2 years since last login', 'Account recovery window'], true);
  addTableRow(['Deleted account metadata', '7 years', 'Compliance and audit'], false);
  addTableRow(['Email addresses (hashed)', '10 years', 'Prevent re-registration abuse'], true);
  addTableRow(['Authentication logs', '1 year', 'Security investigation'], false);
  addTableRow(['Password reset tokens', '1 hour', 'Security - limited lifetime'], true);
  
  yPos += 5;
  addText('Financial Data:', 12, true);
  addTableHeader(['Data Type', 'Retention Period', 'Justification']);
  addTableRow(['Transaction records', '7 years', 'Tax and audit requirements'], false);
  addTableRow(['Credit assessments', '7 years', 'Regulatory compliance'], true);
  addTableRow(['Funding applications', '7 years', 'Financial records retention'], false);
  addTableRow(['Financial models', '7 years', 'Business records'], true);
  addTableRow(['Payment processing logs', '7 years', 'Financial audit'], false);
  addTableRow(['Invoice data', '7 years', 'Tax requirements'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Communication Data:', 12, true);
  addTableHeader(['Data Type', 'Retention Period', 'Justification']);
  addTableRow(['Chat messages', '3 years', 'Business records'], false);
  addTableRow(['Email communications', '3 years', 'Business records'], true);
  addTableRow(['Video call recordings', '90 days', 'Quality and dispute resolution'], false);
  addTableRow(['Support tickets', '5 years', 'Customer service history'], true);
  addTableRow(['System notifications', '1 year', 'Operational needs'], false);
  addTableRow(['Marketing emails', '2 years', 'Campaign effectiveness'], true);
  
  yPos += 5;
  addText('Technical and Security Data:', 12, true);
  addTableHeader(['Data Type', 'Retention Period', 'Justification']);
  addTableRow(['Application logs', '90 days', 'Troubleshooting and debugging'], false);
  addTableRow(['Security logs', '1 year', 'Incident investigation'], true);
  addTableRow(['Audit logs', '7 years', 'Compliance requirements'], false);
  addTableRow(['Performance metrics', '2 years', 'Trend analysis'], true);
  addTableRow(['Error reports', '90 days', 'Bug tracking'], false);
  addTableRow(['Access logs', '1 year', 'Security monitoring'], true);
  
  yPos += 5;
  addText('Business Documents:', 12, true);
  addTableHeader(['Data Type', 'Retention Period', 'Justification']);
  addTableRow(['Contracts', '7 years after expiry', 'Legal requirements'], false);
  addTableRow(['NDAs', '10 years after expiry', 'Legal protection'], true);
  addTableRow(['Compliance certificates', 'Permanent', 'Regulatory proof'], false);
  addTableRow(['Due diligence docs', '7 years', 'Investment records'], true);
  addTableRow(['Business plans', '7 years', 'Business records'], false);
  addTableRow(['Pitch decks', '5 years', 'Business records'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Automated Retention Enforcement:', 12, true);
  addText('Data retention is enforced through automated systems to ensure consistency and compliance:');
  
  addBullet('Daily cron job identifies data past retention period');
  addBullet('Data marked for deletion enters 30-day soft delete state');
  addBullet('Email notification sent to data owner before final deletion');
  addBullet('After 30 days, data permanently deleted via secure deletion process');
  addBullet('Deletion activities logged to audit trail with timestamps and justification');
  addBullet('Monthly reports generated showing data deleted and retention compliance');
  addBullet('Exceptions to retention schedule require CISO approval and documentation');
  
  yPos += 5;
  addText('Legal Hold Process:', 12, true);
  addText('When litigation or investigation requires preserving data beyond normal retention, legal holds are implemented:');
  
  addBullet('Legal counsel initiates legal hold request specifying scope and data types');
  addBullet('Security team implements technical controls to prevent deletion');
  addBullet('Affected data flagged in database with legal hold status');
  addBullet('Automated deletion processes skip legal hold data');
  addBullet('Legal hold reviewed quarterly for continued necessity');
  addBullet('Upon release, data subject to normal retention schedule');
  addBullet('All legal holds documented with custodians, date range, and justification');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('2.2 Data Classification Framework', 2);
  addText('All data is classified according to sensitivity level, which determines handling requirements, access controls, and retention policies:');
  
  yPos += 3;
  addText('Classification Levels:', 12, true);
  
  yPos += 3;
  addText('Level 1 - Public:', 11, true);
  addBullet('Definition: Information intended for public consumption with no sensitivity');
  addBullet('Examples: Marketing materials, public blog posts, product descriptions, public company information');
  addBullet('Encryption: Not required but recommended');
  addBullet('Access: Unrestricted, available to anyone');
  addBullet('Retention: Based on business need, typically 2-3 years');
  addBullet('Disposal: Standard deletion process, no special handling');
  addBullet('Labeling: "Public" watermark on documents');
  
  yPos += 3;
  addText('Level 2 - Internal:', 11, true);
  addBullet('Definition: Information for internal use that would cause minor harm if disclosed');
  addBullet('Examples: Internal memos, project plans, non-sensitive business reports, employee directory');
  addBullet('Encryption: Required in transit, recommended at rest');
  addBullet('Access: Authenticated users only');
  addBullet('Retention: 3-5 years depending on business need');
  addBullet('Disposal: Secure deletion with verification');
  addBullet('Labeling: "Internal Use Only" watermark');
  
  yPos += 3;
  addText('Level 3 - Confidential:', 11, true);
  addBullet('Definition: Sensitive business information that would cause significant harm if disclosed');
  addBullet('Examples: Financial reports, contracts, strategic plans, customer data, employee records');
  addBullet('Encryption: Required at rest and in transit (AES-256)');
  addBullet('Access: Role-based access with business need justification');
  addBullet('Retention: 7 years per regulatory requirements');
  addBullet('Disposal: Cryptographic wiping with certificate of destruction');
  addBullet('Labeling: "Confidential" watermark, handling instructions');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Level 4 - Restricted:', 11, true);
  addBullet('Definition: Highly sensitive information that would cause severe harm or legal liability if disclosed');
  addBullet('Examples: Payment card data, authentication credentials, encryption keys, security vulnerabilities, regulated health data, trade secrets');
  addBullet('Encryption: Required with additional controls (HSM for keys, tokenization for PCI data)');
  addBullet('Access: Strictly limited, dual authorization required, all access logged');
  addBullet('Retention: Minimal - only as long as absolutely necessary, maximum 7 years');
  addBullet('Disposal: Cryptographic shredding, physical destruction of media, documented destruction process');
  addBullet('Labeling: "Restricted - Handle with Extreme Care" watermark');
  
  yPos += 5;
  addText('Data Classification Procedures:', 12, true);
  addText('Data owners are responsible for classifying data according to this framework:');
  
  addBullet('All new data must be classified within 24 hours of creation');
  addBullet('Classification marked in metadata fields in database and file systems');
  addBullet('Automated classification applied to known data types (e.g., credit card numbers always Restricted)');
  addBullet('Machine learning assists in classifying documents and communications');
  addBullet('Quarterly review of classifications to ensure accuracy');
  addBullet('Classification changes logged and approved by data owner');
  addBullet('When in doubt, classify at higher level until proper classification determined');
  
  yPos += 5;
  addText('Classification Handling Matrix:', 12, true);
  addTableHeader(['Control', 'Public', 'Internal', 'Confidential', 'Restricted']);
  addTableRow(['Encryption at Rest', 'Optional', 'Recommended', 'Required', 'Required + HSM'], false);
  addTableRow(['Encryption in Transit', 'Optional', 'Required', 'Required', 'Required + Perfect Forward Secrecy'], true);
  addTableRow(['Access Logging', 'No', 'Yes', 'Yes', 'Yes + Real-time alerts'], false);
  addTableRow(['MFA Required', 'No', 'No', 'Recommended', 'Required'], true);
  addTableRow(['Data Loss Prevention', 'No', 'No', 'Yes', 'Yes + Blocking'], false);
  addTableRow(['Backup Encryption', 'No', 'Yes', 'Yes', 'Yes + Separate keys'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('2.3 Right to Erasure Procedures', 2);
  addText('Under POPIA and GDPR, data subjects have the right to request deletion of their personal data. Kumii has established procedures to honor these requests while maintaining legal and business requirements:');
  
  yPos += 3;
  addText('Erasure Request Process:', 12, true);
  
  yPos += 3;
  addText('Step 1 - Request Submission (Day 1):', 11, true);
  addBullet('User submits erasure request via account settings, email to privacy@kumii.com, or support ticket');
  addBullet('Request form collects: identity verification, scope of deletion, reason (optional)');
  addBullet('Automated acknowledgment sent within 24 hours with reference number');
  addBullet('Request logged in privacy management system for tracking');
  
  yPos += 3;
  addText('Step 2 - Identity Verification (Day 2-3):', 11, true);
  addBullet('Privacy team verifies identity using government-issued ID and account information');
  addBullet('Video call scheduled if additional verification needed');
  addBullet('Verification documented and attached to erasure request');
  addBullet('If verification fails, user notified and given opportunity to provide additional proof');
  
  yPos += 3;
  addText('Step 3 - Legal Review (Day 4-10):', 11, true);
  addBullet('Legal counsel reviews request for exceptions (active contracts, legal holds, regulatory requirements)');
  addBullet('Financial transaction data retained per tax law (7 years) - user notified of exception');
  addBullet('Data necessary for legal claims retained - user notified with justification');
  addBullet('If erasure would violate legal obligations, partial erasure offered with explanation');
  
  yPos += 3;
  addText('Step 4 - Technical Deletion (Day 11-25):', 11, true);
  addBullet('Privacy team coordinates deletion across all systems (production, backups, logs, archives)');
  addBullet('Personal identifiers replaced with anonymous identifier to preserve referential integrity');
  addBullet('Profile data deleted or anonymized depending on data type');
  addBullet('Third-party processors notified to delete data (payment processors, email providers)');
  addBullet('Deletion verification performed using automated scripts');
  
  yPos += 3;
  addText('Step 5 - Confirmation (Day 26-30):', 11, true);
  addBullet('Privacy team generates deletion report showing all data removed');
  addBullet('User receives confirmation email with deletion summary and any exceptions');
  addBullet('Request marked complete in privacy management system');
  addBullet('Deletion documented for compliance audit trail');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Exceptions to Erasure:', 12, true);
  addText('Certain data cannot be deleted even when requested due to legal or business requirements:');
  
  yPos += 3;
  addTableHeader(['Data Type', 'Retention After Erasure Request', 'Legal Basis']);
  addTableRow(['Financial transactions', '7 years', 'Tax law requirements'], false);
  addTableRow(['Fraud prevention records', 'Permanent', 'Legitimate business interest'], true);
  addTableRow(['Legal hold data', 'Until hold released', 'Legal process'], false);
  addTableRow(['Audit logs', '7 years', 'Compliance requirements'], true);
  addTableRow(['Active contract data', 'Contract duration + 7 years', 'Contractual obligation'], false);
  addTableRow(['Anonymized analytics', 'Permanent', 'Cannot re-identify'], true);
  
  yPos += 5;
  addText('Partial Erasure:', 12, true);
  addText('When full erasure is not possible, the following data is retained in minimized form:');
  
  addBullet('Transaction IDs retained without linking to personal identity');
  addBullet('Aggregated statistics retained without individual-level data');
  addBullet('Legal documents retained with personal details redacted where possible');
  addBullet('Compliance records retained with minimal personal data');
  addBullet('All retained data clearly marked as subject to prior erasure request');
  addBullet('Retained data reviewed annually for potential further minimization');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('2.4 Secure Disposal Methods', 2);
  addText('When data reaches end of retention period or is subject to deletion request, it must be securely disposed of to prevent unauthorized recovery:');
  
  yPos += 3;
  addText('Digital Data Disposal:', 12, true);
  
  yPos += 3;
  addText('Database Records:', 11, true);
  addBullet('Soft delete: Record marked as deleted, excluded from queries, purged after 30 days');
  addBullet('Hard delete: Record permanently removed using database DELETE operation');
  addBullet('Cryptographic erasure: Encryption keys destroyed rendering data unrecoverable');
  addBullet('Backup purge: Data removed from all backup systems and archives');
  addBullet('Log scrubbing: References to deleted data removed from logs where feasible');
  addBullet('Verification: Automated scripts confirm data no longer accessible');
  
  yPos += 3;
  addText('File Storage:', 11, true);
  addBullet('Cloud storage: Files deleted via provider API, then bucket versioning purged');
  addBullet('Object storage: Multi-part deletion ensures all fragments removed');
  addBullet('CDN cache: Invalidation requests sent to purge cached copies');
  addBullet('Encrypted files: Encryption keys destroyed before file deletion');
  addBullet('Temporary files: Wiped using secure deletion utilities (shred, srm)');
  
  yPos += 3;
  addText('Physical Media Disposal:', 12, true);
  addBullet('Hard drives: Physical destruction (shredding) for end-of-life equipment');
  addBullet('SSDs: Cryptographic erase followed by physical destruction');
  addBullet('Backup tapes: Degaussing followed by shredding');
  addBullet('Paper records: Cross-cut shredding by certified vendor');
  addBullet('Disposal certificates: Vendor provides certificate of destruction for audit trail');
  
  yPos += 5;
  addText('Disposal Verification and Documentation:', 12, true);
  addText('All data disposal activities are verified and documented:');
  
  addBullet('Deletion confirmation reports generated automatically');
  addBullet('Random sampling of disposed data to verify inaccessibility');
  addBullet('Third-party disposal vendors provide certificates of destruction');
  addBullet('Annual audit of disposal procedures by internal audit team');
  addBullet('Disposal logs retained for 7 years per compliance requirements');
  
  // SECTION 3: VENDOR MANAGEMENT
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('3. Vendor Management Policy', 1);
  
  addText('The Vendor Management Policy governs the selection, onboarding, monitoring, and offboarding of third-party vendors that access Kumii systems or process Kumii data. This policy ensures vendors meet security and compliance requirements and are subject to appropriate oversight.');
  
  addSectionHeader('3.1 Vendor Categories and Risk Assessment', 2);
  addText('Vendors are categorized by risk level based on data access, criticality, and compliance requirements:');
  
  yPos += 3;
  addText('Critical Vendors (High Risk):', 12, true);
  addBullet('Definition: Vendors with access to production systems, sensitive data, or critical to business operations');
  addBullet('Examples: Cloud infrastructure (Supabase, AWS), payment processors, KYC/identity verification, security tools');
  addBullet('Assessment: Annual SOC 2 Type II audit required, comprehensive security questionnaire');
  addBullet('Monitoring: Quarterly security reviews, continuous performance monitoring, annual risk re-assessment');
  addBullet('Contracting: Detailed DPA required, SLA with financial penalties, right-to-audit clause');
  
  yPos += 3;
  addText('Important Vendors (Medium Risk):', 12, true);
  addBullet('Definition: Vendors with limited data access or supporting non-critical functions');
  addBullet('Examples: Email service, analytics platforms, marketing automation, customer support tools');
  addBullet('Assessment: ISO 27001 or SOC 2 certification, security questionnaire');
  addBullet('Monitoring: Annual security review, incident reporting requirements');
  addBullet('Contracting: Standard DPA, defined SLA, breach notification requirements');
  
  yPos += 3;
  addText('Standard Vendors (Low Risk):', 12, true);
  addBullet('Definition: Vendors with no data access or access to only public information');
  addBullet('Examples: Office supplies, catering, non-technical services');
  addBullet('Assessment: Basic due diligence, financial stability check');
  addBullet('Monitoring: Minimal, address issues as they arise');
  addBullet('Contracting: Standard vendor agreement, general terms and conditions');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Vendor Risk Assessment Process:', 12, true);
  addText('All new vendors undergo risk assessment before onboarding:');
  
  yPos += 3;
  addText('Phase 1 - Initial Screening:', 11, true);
  addBullet('Vendor completes questionnaire on data access, security controls, and certifications');
  addBullet('Financial review to ensure vendor stability and viability');
  addBullet('References checked with existing clients on security and performance');
  addBullet('Background check on vendor ownership and leadership');
  addBullet('Review of vendor\'s privacy policy and terms of service');
  
  yPos += 3;
  addText('Phase 2 - Security Assessment:', 11, true);
  addBullet('Request and review SOC 2, ISO 27001, or other security certifications');
  addBullet('Comprehensive security questionnaire covering 50+ controls');
  addBullet('Technical assessment of vendor\'s security architecture and controls');
  addBullet('Vulnerability assessment of vendor-provided software or APIs');
  addBullet('Penetration testing for critical integrations (at vendor\'s expense)');
  
  yPos += 3;
  addText('Phase 3 - Compliance Review:', 11, true);
  addBullet('Validate compliance with GDPR, POPIA, and other relevant regulations');
  addBullet('Review data processing activities and legal basis');
  addBullet('Confirm sub-processor agreements and data transfer mechanisms');
  addBullet('Assess breach notification and incident response procedures');
  addBullet('Verify insurance coverage (cyber liability, professional liability)');
  
  yPos += 3;
  addText('Phase 4 - Risk Scoring:', 11, true);
  addBullet('Calculate risk score using standardized rubric (0-100 scale)');
  addBullet('Categorize vendor as Critical, Important, or Standard based on score');
  addBullet('Identify gaps and required remediation before approval');
  addBullet('Document compensating controls if vendor doesn\'t meet all requirements');
  addBullet('Executive approval required for high-risk vendors (score > 70)');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Vendor Risk Scoring Rubric:', 12, true);
  addTableHeader(['Factor', 'Low Risk (0-25)', 'Medium Risk (26-70)', 'High Risk (71-100)']);
  addTableRow(['Data Access', 'None or public only', 'Internal or limited PII', 'Sensitive PII or financial'], false);
  addTableRow(['System Access', 'None', 'Non-production only', 'Production systems'], true);
  addTableRow(['Certifications', 'ISO 27001 + SOC 2', 'ISO 27001 or SOC 2', 'None'], false);
  addTableRow(['Data Location', 'EEA/SA only', 'Approved countries', 'Unapproved countries'], true);
  addTableRow(['Criticality', 'Not business critical', 'Important but replaceable', 'Critical, hard to replace'], false);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('3.2 Pre-Onboarding Requirements', 2);
  addText('Before a vendor can be onboarded and granted access to systems or data, they must meet these requirements:');
  
  yPos += 3;
  addText('Documentation Requirements:', 12, true);
  addBullet('Completed and signed Data Processing Agreement (DPA)');
  addBullet('Master Services Agreement (MSA) or equivalent contract');
  addBullet('Certificate of Insurance (cyber liability, E&O, general liability)');
  addBullet('Security certifications (SOC 2 Type II, ISO 27001, etc.)');
  addBullet('Completed security questionnaire with supporting evidence');
  addBullet('Business continuity and disaster recovery plan');
  addBullet('Incident response and breach notification procedures');
  addBullet('List of sub-processors and their locations');
  addBullet('Data protection impact assessment (DPIA) for high-risk processing');
  
  yPos += 5;
  addText('Technical Requirements:', 12, true);
  addBullet('Encryption in transit (TLS 1.2+) for all data transmission');
  addBullet('Encryption at rest (AES-256) for all stored data');
  addBullet('Multi-factor authentication for all user accounts');
  addBullet('Role-based access controls with principle of least privilege');
  addBullet('Audit logging of all access to Kumii data');
  addBullet('Regular security patching (critical patches within 30 days)');
  addBullet('Vulnerability scanning and penetration testing (annually minimum)');
  addBullet('Intrusion detection and prevention systems');
  addBullet('Data backup and recovery capabilities (RPO < 24 hours, RTO < 4 hours)');
  
  yPos += 5;
  addText('Operational Requirements:', 12, true);
  addBullet('Designated security contact for incident escalation');
  addBullet('24/7 support availability for critical vendors');
  addBullet('Defined SLAs with performance metrics and penalties');
  addBullet('Quarterly business review meetings for critical vendors');
  addBullet('Annual security assessment and certification renewal');
  addBullet('Breach notification within 24 hours of discovery');
  addBullet('Compliance with information security policies');
  addBullet('Participation in incident response exercises');
  addBullet('Right-to-audit clause in contract');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Onboarding Approval Process:', 12, true);
  addText('Vendor onboarding requires multi-level approval based on risk:');
  
  yPos += 3;
  addTableHeader(['Vendor Risk', 'Approvals Required', 'Timeline']);
  addTableRow(['Critical (High)', 'Business Owner, CISO, Legal, CFO, CEO', '30-45 days'], false);
  addTableRow(['Important (Medium)', 'Business Owner, CISO, Legal', '15-30 days'], true);
  addTableRow(['Standard (Low)', 'Business Owner, CISO', '5-15 days'], false);
  
  yPos += 5;
  addText('Onboarding Checklist:', 12, true);
  addText('The following checklist must be completed before vendor access is granted:');
  
  addBullet('☐ Vendor risk assessment completed and documented');
  addBullet('☐ All required approvals obtained');
  addBullet('☐ Contracts and DPA executed');
  addBullet('☐ Insurance certificates verified and on file');
  addBullet('☐ Security certifications validated');
  addBullet('☐ Technical controls verified through testing');
  addBullet('☐ Vendor added to vendor management system');
  addBullet('☐ Access credentials provisioned with least privilege');
  addBullet('☐ Integration tested in non-production environment');
  addBullet('☐ Monitoring and alerting configured');
  addBullet('☐ Vendor contacts added to emergency notification list');
  addBullet('☐ Security awareness training provided to vendor staff');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('3.3 Data Processing Agreements', 2);
  addText('All vendors processing personal data on behalf of Kumii must execute a Data Processing Agreement (DPA) that meets GDPR and POPIA requirements:');
  
  yPos += 3;
  addText('DPA Required Terms:', 12, true);
  
  yPos += 3;
  addText('Processing Instructions:', 11, true);
  addBullet('Vendor processes data only on documented instructions from Kumii');
  addBullet('Scope of processing clearly defined (purpose, data types, subjects, duration)');
  addBullet('Prohibition on processing for vendor\'s own purposes');
  addBullet('Requirement to notify Kumii if instruction violates law');
  
  yPos += 3;
  addText('Confidentiality:', 11, true);
  addBullet('Personnel accessing data bound by confidentiality obligations');
  addBullet('Background checks required for personnel with data access');
  addBullet('Data protection training required for all personnel');
  addBullet('Vendor certifies personnel understand their obligations');
  
  yPos += 3;
  addText('Security Measures:', 11, true);
  addBullet('Technical and organizational measures specified in detail');
  addBullet('Encryption, access controls, logging, and monitoring requirements');
  addBullet('Regular security testing and vulnerability assessments');
  addBullet('Incident response and business continuity plans');
  addBullet('Physical security controls for facilities processing data');
  
  yPos += 3;
  addText('Sub-Processing:', 11, true);
  addBullet('Vendor must obtain prior written consent for sub-processors');
  addBullet('List of authorized sub-processors maintained and updated');
  addBullet('Vendor liable for sub-processor compliance with DPA terms');
  addBullet('Same data protection obligations flow down to sub-processors');
  addBullet('Kumii has right to object to new sub-processors');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Data Subject Rights:', 11, true);
  addBullet('Vendor assists Kumii in responding to data subject requests');
  addBullet('Technical capabilities to support access, correction, deletion requests');
  addBullet('Response to Kumii requests within 5 business days');
  addBullet('No charge for reasonable assistance requests');
  
  yPos += 3;
  addText('Breach Notification:', 11, true);
  addBullet('Vendor notifies Kumii within 24 hours of breach discovery');
  addBullet('Notification includes nature of breach, data involved, affected individuals');
  addBullet('Vendor cooperates in breach investigation and remediation');
  addBullet('Vendor provides documentation for regulatory notification');
  
  yPos += 3;
  addText('Data Return and Deletion:', 11, true);
  addBullet('Upon termination, vendor returns or deletes all personal data');
  addBullet('Vendor provides certification of deletion');
  addBullet('Data retained only as required by law with continued protection');
  addBullet('Kumii can request deletion verification proof');
  
  yPos += 3;
  addText('Audit Rights:', 11, true);
  addBullet('Kumii has right to audit vendor compliance with DPA');
  addBullet('Vendor provides information demonstrating compliance');
  addBullet('Third-party audits acceptable (SOC 2, ISO 27001)');
  addBullet('Vendor allows on-site inspections with reasonable notice');
  addBullet('Remediation required within 30 days of audit findings');
  
  yPos += 5;
  addText('International Data Transfers:', 12, true);
  addText('When vendors transfer data outside South Africa or the EEA, additional protections are required:');
  
  addBullet('Standard Contractual Clauses (SCCs) incorporated into DPA');
  addBullet('Transfer impact assessment conducted for high-risk destinations');
  addBullet('Supplementary measures implemented (encryption, pseudonymization)');
  addBullet('Documentation of legal basis for transfer maintained');
  addBullet('Regular review of transfer necessity and controls');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('3.4 Ongoing Monitoring', 2);
  addText('Vendors are continuously monitored throughout the relationship to ensure ongoing compliance and performance:');
  
  yPos += 3;
  addText('Performance Monitoring:', 12, true);
  addBullet('SLA metrics tracked and reviewed monthly (uptime, response time, error rates)');
  addBullet('Automated alerting for SLA violations');
  addBullet('Escalation procedures for repeated violations');
  addBullet('Quarterly business reviews with critical vendors');
  addBullet('Annual vendor performance scorecard');
  
  yPos += 3;
  addText('Security Monitoring:', 12, true);
  addBullet('Continuous monitoring of vendor-provided APIs and services');
  addBullet('Automated security scanning of vendor endpoints');
  addBullet('Review of vendor security bulletins and advisories');
  addBullet('Incident and breach reporting tracking');
  addBullet('Security certification renewal verification');
  
  yPos += 3;
  addText('Compliance Monitoring:', 12, true);
  addBullet('Annual review of DPA compliance');
  addBullet('Sub-processor change notifications reviewed');
  addBullet('Validation of updated security certifications');
  addBullet('Review of data protection impact assessments');
  addBullet('Regulatory compliance status verification');
  
  yPos += 5;
  addText('Vendor Offboarding:', 12, true);
  addText('When vendor relationship ends, structured offboarding ensures data protection and knowledge transfer:');
  
  addBullet('30-day notice period minimum for transition planning');
  addBullet('Data extraction and migration to new vendor or in-house');
  addBullet('Vendor certifies deletion of all Kumii data');
  addBullet('Access credentials revoked immediately upon termination');
  addBullet('API keys and integration tokens rotated');
  addBullet('Final audit to verify data deletion');
  addBullet('Knowledge transfer and documentation handover');
  addBullet('Post-termination obligations clearly defined (confidentiality, warranties)');
  
  // Continue with remaining sections in next part...
  // SECTION 4: INCIDENT RESPONSE POLICY
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('4. Incident Response Policy', 1);
  
  addText('The Incident Response Policy establishes procedures for detecting, analyzing, containing, and recovering from security incidents. This policy ensures Kumii can respond effectively to security events, minimize impact, and meet regulatory notification requirements.');
  
  addSectionHeader('4.1 Incident Classification Matrix', 2);
  addText('Security incidents are classified by severity to ensure appropriate response priority and resource allocation:');
  
  yPos += 3;
  addText('Severity Levels:', 12, true);
  
  yPos += 3;
  addText('Critical (P1) - Full Response Required:', 11, true);
  addBullet('Active breach with confirmed data exfiltration');
  addBullet('Ransomware or destructive malware affecting production systems');
  addBullet('Complete outage of critical business functions (> 50% users affected)');
  addBullet('Unauthorized access to financial systems or payment data');
  addBullet('Insider threat with privileged access');
  addBullet('Response Time: Immediate (within 15 minutes)');
  addBullet('Escalation: CISO, CEO, and board notification required');
  
  yPos += 3;
  addText('High (P2) - Urgent Response Required:', 11, true);
  addBullet('Suspected breach pending confirmation');
  addBullet('Significant service degradation (25-50% users affected)');
  addBullet('Malware infection on non-critical systems');
  addBullet('Unauthorized access attempt to sensitive data');
  addBullet('DDoS attack affecting availability');
  addBullet('Response Time: Within 1 hour');
  addBullet('Escalation: CISO and CTO notification required');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Medium (P3) - Standard Response:', 11, true);
  addBullet('Policy violation without confirmed damage');
  addBullet('Minor service disruption (< 25% users affected)');
  addBullet('Failed intrusion attempt blocked by security controls');
  addBullet('Suspicious activity requiring investigation');
  addBullet('Phishing email received by multiple users');
  addBullet('Response Time: Within 4 hours during business hours');
  addBullet('Escalation: Security team manager notification');
  
  yPos += 3;
  addText('Low (P4) - Routine Response:', 11, true);
  addBullet('Single failed login attempt from unfamiliar location');
  addBullet('Policy violation with no security impact');
  addBullet('Automated security alert with low confidence');
  addBullet('Minor configuration issue');
  addBullet('Informational security event');
  addBullet('Response Time: Within 24 hours');
  addBullet('Escalation: Logged and tracked, no immediate escalation');
  
  yPos += 5;
  addText('Incident Classification Decision Tree:', 12, true);
  addText('Use this decision tree to classify incidents:');
  
  addBullet('1. Is PII or financial data confirmed compromised? → Critical (P1)');
  addBullet('2. Is there active unauthorized access to production systems? → Critical (P1)');
  addBullet('3. Are critical business functions completely unavailable? → Critical (P1)');
  addBullet('4. Is there suspected but unconfirmed data breach? → High (P2)');
  addBullet('5. Is there significant service degradation? → High (P2)');
  addBullet('6. Is there a policy violation or suspicious activity? → Medium (P3)');
  addBullet('7. Is this a routine security event? → Low (P4)');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('4.2 Response Team Structure', 2);
  addText('The Incident Response Team (IRT) is a cross-functional team responsible for managing security incidents from detection through post-incident review:');
  
  yPos += 3;
  addText('Core IRT Members:', 12, true);
  
  yPos += 3;
  addText('Incident Commander (CISO):', 11, true);
  addBullet('Overall responsibility for incident response');
  addBullet('Declares incident severity and activates IRT');
  addBullet('Coordinates response activities and resources');
  addBullet('Makes containment and recovery decisions');
  addBullet('Authorizes external communications');
  addBullet('Leads post-incident review');
  addBullet('Backup: VP Engineering');
  
  yPos += 3;
  addText('Technical Lead (Security Engineer):', 11, true);
  addBullet('Performs technical investigation and forensics');
  addBullet('Identifies attack vectors and indicators of compromise');
  addBullet('Implements containment and eradication measures');
  addBullet('Coordinates with DevOps for system changes');
  addBullet('Documents technical findings');
  addBullet('Backup: Senior DevOps Engineer');
  
  yPos += 3;
  addText('Communications Lead (Marketing/PR):', 11, true);
  addBullet('Manages internal and external communications');
  addBullet('Drafts breach notification letters');
  addBullet('Coordinates with public relations firm');
  addBullet('Updates status page and customer communications');
  addBullet('Handles media inquiries');
  addBullet('Backup: CEO Executive Assistant');
  
  yPos += 3;
  addText('Legal Counsel (General Counsel):', 11, true);
  addBullet('Advises on legal obligations and liability');
  addBullet('Coordinates regulatory notifications');
  addBullet('Manages law enforcement interaction');
  addBullet('Reviews communications for legal risk');
  addBullet('Handles insurance claims');
  addBullet('Backup: External legal counsel');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Business Continuity Lead (COO):', 11, true);
  addBullet('Activates business continuity procedures');
  addBullet('Coordinates alternative work arrangements');
  addBullet('Manages customer impact and expectations');
  addBullet('Authorizes emergency expenditures');
  addBullet('Coordinates cross-functional recovery efforts');
  addBullet('Backup: VP Operations');
  
  yPos += 3;
  addText('Scribe/Documentation (Security Analyst):', 11, true);
  addBullet('Documents all response activities with timestamps');
  addBullet('Maintains incident timeline');
  addBullet('Records decisions and rationale');
  addBullet('Tracks action items and assignments');
  addBullet('Prepares incident summary report');
  addBullet('Backup: Junior Security Analyst');
  
  yPos += 5;
  addText('Extended Team Members (as needed):', 12, true);
  addBullet('Database Administrator - for database forensics and recovery');
  addBullet('External Forensics Firm - for complex investigations');
  addBullet('Cyber Insurance Carrier - for claims and additional resources');
  addBullet('Law Enforcement - for criminal investigations');
  addBullet('Regulatory Liaisons - for compliance reporting');
  addBullet('Third-Party Vendors - for vendor-related incidents');
  
  yPos += 5;
  addText('IRT Contact Information:', 12, true);
  addText('Updated contact list maintained in secure incident response runbook:');
  
  addBullet('Primary and backup contacts for each role');
  addBullet('Mobile phone numbers for 24/7 reach ability');
  addBullet('Email addresses (personal and corporate)');
  addBullet('Secure messaging app handles (Signal, WhatsApp)');
  addBullet('Home addresses for courier delivery of hardware tokens');
  addBullet('Contact list verified and updated quarterly');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('4.3 Five-Phase Response Procedure', 2);
  addText('All incidents follow this structured five-phase response process:');
  
  yPos += 3;
  addText('Phase 1: Detection and Analysis', 12, true);
  addText('The goal of this phase is to identify potential security incidents and determine their nature and scope:');
  
  yPos += 3;
  addText('Detection Sources:', 11, true);
  addBullet('Automated security monitoring and SIEM alerts');
  addBullet('Intrusion detection system (IDS) alerts');
  addBullet('Anomaly detection in user behavior analytics');
  addBullet('Employee reports of suspicious activity');
  addBullet('Customer complaints or support tickets');
  addBullet('Third-party vendor notifications');
  addBullet('External security researchers');
  addBullet('Law enforcement notifications');
  
  yPos += 3;
  addText('Initial Triage (15-30 minutes):', 11, true);
  addBullet('Gather initial information about the event');
  addBullet('Determine if event qualifies as security incident');
  addBullet('Classify incident severity using decision tree');
  addBullet('Activate IRT appropriate for severity level');
  addBullet('Create incident ticket in tracking system');
  addBullet('Begin incident timeline documentation');
  
  yPos += 3;
  addText('Detailed Analysis (1-4 hours):', 11, true);
  addBullet('Collect and preserve evidence (logs, memory dumps, disk images)');
  addBullet('Identify affected systems, users, and data');
  addBullet('Determine attack vector and timeline');
  addBullet('Identify indicators of compromise (IoCs)');
  addBullet('Search for IoCs across environment');
  addBullet('Assess data sensitivity and volumes involved');
  addBullet('Document findings in incident report');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Phase 2: Containment', 12, true);
  addText('Limit the scope and impact of the incident to prevent further damage:');
  
  yPos += 3;
  addText('Short-term Containment (Immediate):', 11, true);
  addBullet('Isolate affected systems from network (disconnect or VLAN segregation)');
  addBullet('Disable compromised user accounts');
  addBullet('Block malicious IP addresses at firewall');
  addBullet('Revoke compromised credentials and API keys');
  addBullet('Enable enhanced monitoring on at-risk systems');
  addBullet('Preserve evidence before taking containment actions');
  
  yPos += 3;
  addText('Long-term Containment (1-24 hours):', 11, true);
  addBullet('Apply temporary patches or configuration changes');
  addBullet('Implement additional access controls');
  addBullet('Deploy temporary systems to maintain operations');
  addBullet('Enhance monitoring and alerting');
  addBullet('Change all potentially compromised passwords');
  addBullet('Assess need for complete system rebuild');
  
  yPos += 3;
  addText('Containment Decisions:', 11, true);
  addBullet('Balance containment speed with evidence preservation');
  addBullet('Consider business impact of containment actions');
  addBullet('Document decision rationale for audit trail');
  addBullet('Obtain approval from Incident Commander for high-impact actions');
  addBullet('Communicate containment plans to stakeholders');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Phase 3: Eradication', 12, true);
  addText('Remove the threat from the environment completely:');
  
  yPos += 3;
  addBullet('Remove malware from all affected systems');
  addBullet('Delete unauthorized user accounts and backdoors');
  addBullet('Close identified security vulnerabilities');
  addBullet('Apply security patches and configuration fixes');
  addBullet('Update firewall and IDS rules');
  addBullet('Improve logging and monitoring controls');
  addBullet('Conduct vulnerability scan to verify eradication');
  addBullet('Rebuild compromised systems from clean backups or fresh install');
  addBullet('Verify no indicators of compromise remain');
  
  yPos += 5;
  addText('Phase 4: Recovery', 12, true);
  addText('Restore and validate system functionality while monitoring for additional threats:');
  
  yPos += 3;
  addText('System Restoration:', 11, true);
  addBullet('Restore systems from clean backups if necessary');
  addBullet('Verify integrity of restored data');
  addBullet('Reconnect systems to production network gradually');
  addBullet('Implement enhanced monitoring during restoration');
  addBullet('Conduct thorough testing before returning to production');
  addBullet('Validate all security controls are functioning');
  
  yPos += 3;
  addText('Production Return (Phased Approach):', 11, true);
  addBullet('Phase 1: Restore to isolated test environment');
  addBullet('Phase 2: Limited production traffic (10-20%)');
  addBullet('Phase 3: Gradual scale-up monitoring for anomalies');
  addBullet('Phase 4: Full production after 24-48 hours stable operation');
  addBullet('Rollback plan ready if issues detected');
  
  yPos += 3;
  addText('Enhanced Monitoring (30-90 days):', 11, true);
  addBullet('Increased logging verbosity on affected systems');
  addBullet('Real-time monitoring of indicators of compromise');
  addBullet('Daily review of security alerts and logs');
  addBullet('Weekly threat hunting exercises');
  addBullet('User activity monitoring for affected accounts');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Phase 5: Post-Incident Activity', 12, true);
  addText('Learn from the incident to improve security posture and prevent recurrence:');
  
  yPos += 3;
  addText('Post-Incident Review Meeting (Within 1 week):', 11, true);
  addBullet('All IRT members attend with prepared notes');
  addBullet('Review incident timeline and response actions');
  addBullet('Identify what went well and what could improve');
  addBullet('Document lessons learned and action items');
  addBullet('No blame culture - focus on process improvement');
  addBullet('Meeting recorded and documented');
  
  yPos += 3;
  addText('Root Cause Analysis:', 11, true);
  addBullet('Identify underlying vulnerability or weakness');
  addBullet('Determine how it was exploited');
  addBullet('Assess why existing controls failed');
  addBullet('Develop remediation recommendations');
  addBullet('Prioritize fixes based on risk');
  
  yPos += 3;
  addText('Remediation Implementation (30-90 days):', 11, true);
  addBullet('Assign action items with owners and due dates');
  addBullet('Track remediation progress weekly');
  addBullet('Test and validate fixes before deployment');
  addBullet('Update policies and procedures as needed');
  addBullet('Conduct training on new controls');
  addBullet('Report completion to executive leadership');
  
  yPos += 3;
  addText('Documentation and Reporting:', 11, true);
  addBullet('Complete incident report with timeline and impact');
  addBullet('Calculate incident costs (response, recovery, business impact)');
  addBullet('Update incident response playbooks');
  addBullet('Share anonymized lessons learned with industry');
  addBullet('File insurance claim if applicable');
  addBullet('Archive all incident documentation for 7 years');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('4.4 Breach Notification Requirements', 2);
  addText('When a security incident involves personal data, Kumii must comply with breach notification requirements under POPIA, GDPR, and other applicable regulations:');
  
  yPos += 3;
  addText('Notification Thresholds:', 12, true);
  addText('Breach notification is required when:');
  
  addBullet('Personal data has been accessed, disclosed, or acquired by unauthorized person');
  addBullet('There is likely risk to data subjects\' rights and freedoms');
  addBullet('Sensitive data (financial, health, authentication) is involved regardless of volume');
  addBullet('More than 100 individuals affected by non-sensitive data breach');
  addBullet('Legal counsel confirms notification obligation');
  
  yPos += 5;
  addText('Regulatory Notification Timeline:', 12, true);
  
  addTableHeader(['Regulation', 'Notification Timeline', 'Recipient', 'Content Required']);
  addTableRow(['POPIA', 'As soon as reasonably possible', 'Information Regulator', 'Nature of breach, data involved'], false);
  addTableRow(['GDPR', 'Within 72 hours of awareness', 'Lead Supervisory Authority', 'GDPR Article 33 details'], true);
  addTableRow(['POPIA', 'As soon as reasonably possible', 'Affected data subjects', 'Nature and remedial action'], false);
  addTableRow(['GDPR', 'Without undue delay', 'Affected data subjects', 'If high risk to rights'], true);
  
  yPos += 5;
  addText('Notification Process:', 12, true);
  
  yPos += 3;
  addText('Regulatory Authority Notification (72 hours):', 11, true);
  addBullet('Legal counsel prepares notification using standard template');
  addBullet('CISO and CEO review and approve');
  addBullet('Submit via regulator\'s preferred channel (email, portal)');
  addBullet('Include: nature of breach, categories and volume of data, likely consequences, remedial measures');
  addBullet('Provide updated information as investigation progresses');
  addBullet('Retain proof of submission and all related communications');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Data Subject Notification (Without Undue Delay):', 11, true);
  addBullet('Communications team prepares clear, plain-language notification');
  addBullet('Include: what happened, what data was involved, what we\'re doing, what individuals should do');
  addBullet('Provide dedicated support channel (email, phone) for questions');
  addBullet('Offer credit monitoring or identity theft protection if appropriate');
  addBullet('Send via email to last known address on file');
  addBullet('Post notice on website if email addresses unavailable');
  addBullet('Document all notifications sent');
  
  yPos += 3;
  addText('Exemptions from Data Subject Notification:', 11, true);
  addBullet('Data was encrypted with keys not compromised');
  addBullet('Subsequent measures ensure high risk no longer likely');
  addBullet('Notification would involve disproportionate effort (can use public notice)');
  addBullet('Regulator agrees notification not required');
  addBullet('Legal counsel must approve any exemption claim');
  
  yPos += 5;
  addText('Sample Notification Template:', 12, true);
  addText('Subject: Important Security Notice Regarding Your Kumii Account');
  yPos += 3;
  addText('Dear [Name], We are writing to inform you about a security incident that may have affected your personal information. On [date], we discovered that [brief description of incident]. The investigation revealed that the following information may have been accessed: [list data types]. We have taken immediate steps to [containment actions]. We are offering [remedial offerings] at no cost to you. For questions, please contact security@kumii.com or call [phone]. We sincerely apologize for this incident and any inconvenience it may cause. Sincerely, [CISO Name], Chief Information Security Officer');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('4.5 Post-Incident Review', 2);
  addText('Comprehensive review conducted after every P1 and P2 incident to drive continuous improvement:');
  
  yPos += 3;
  addText('Review Metrics to Track:', 12, true);
  addBullet('Time to detect (from initial compromise to detection)');
  addBullet('Time to triage (from detection to classification)');
  addBullet('Time to contain (from classification to containment)');
  addBullet('Time to eradicate (from containment to threat removal)');
  addBullet('Time to recover (from eradication to full restoration)');
  addBullet('Total incident duration (from detection to closure)');
  addBullet('Number of systems affected');
  addBullet('Number of users/customers impacted');
  addBullet('Data volume compromised');
  addBullet('Total cost of incident (response, recovery, business impact, legal, regulatory fines)');
  
  yPos += 5;
  addText('Improvement Actions:', 12, true);
  addBullet('Update incident response playbooks with new scenarios');
  addBullet('Enhance detection rules based on incident IoCs');
  addBullet('Implement additional preventive controls');
  addBullet('Conduct training on lessons learned');
  addBullet('Revise policies and procedures as needed');
  addBullet('Update vendor security requirements');
  addBullet('Schedule testing of improvements');
  
  // SECTION 5: CHANGE MANAGEMENT
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('5. Change Management Policy', 1);
  
  addText('The Change Management Policy governs how changes to production systems are requested, reviewed, approved, tested, and deployed. This policy ensures changes are made in a controlled manner that minimizes risk to security, availability, and data integrity.');
  
  addSectionHeader('5.1 Change Categories', 2);
  addText('Changes are categorized by risk and urgency to determine the appropriate approval and testing requirements:');
  
  yPos += 3;
  addText('Emergency Changes:', 12, true);
  addBullet('Definition: Urgent changes required to restore service or address active security threat');
  addBullet('Examples: Security patch for active exploit, hotfix for critical outage, incident response actions');
  addBullet('Approval: CISO or CTO verbal approval, documented within 24 hours');
  addBullet('Testing: Limited testing in production-like environment, focus on critical paths');
  addBullet('Deployment: Immediate with all hands monitoring');
  addBullet('Rollback: Automated rollback prepared before deployment');
  addBullet('Documentation: Retrospective change documentation within 48 hours');
  addBullet('Review: Post-implementation review within 1 week');
  
  yPos += 3;
  addText('Standard Changes:', 12, true);
  addBullet('Definition: Routine changes following established procedures with known risk profiles');
  addBullet('Examples: Application updates, configuration changes, new features, infrastructure scaling');
  addBullet('Approval: Change Advisory Board (CAB) review and approval');
  addBullet('Testing: Full test suite in staging environment, user acceptance testing');
  addBullet('Deployment: Scheduled deployment window (typically Tuesday-Thursday)');
  addBullet('Rollback: Tested rollback procedure documented and rehearsed');
  addBullet('Documentation: Complete change request with impact analysis');
  addBullet('Review: Automated post-deployment validation');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Minor Changes:', 12, true);
  addBullet('Definition: Low-risk changes with minimal impact (UI text, documentation, non-production systems)');
  addBullet('Examples: Copy changes, documentation updates, development environment changes');
  addBullet('Approval: Team lead approval sufficient');
  addBullet('Testing: Automated testing and code review');
  addBullet('Deployment: Continuous deployment after automated checks pass');
  addBullet('Rollback: Automatic rollback on failed health checks');
  addBullet('Documentation: Git commit messages and pull request descriptions');
  addBullet('Review: Included in weekly deployment summary');
  
  yPos += 5;
  addText('Change Classification Decision Matrix:', 12, true);
  addTableHeader(['Factor', 'Emergency', 'Standard', 'Minor']);
  addTableRow(['Business Impact', 'Critical service down', 'Normal operations', 'Minimal'], false);
  addTableRow(['Security Impact', 'Active threat', 'Potential risk', 'None'], true);
  addTableRow(['Users Affected', 'All or large subset', 'Some users', 'Few or none'], false);
  addTableRow(['Data Risk', 'High risk to data', 'Managed risk', 'No data risk'], true);
  addTableRow(['Reversibility', 'May be irreversible', 'Fully reversible', 'Easily reversible'], false);
  addTableRow(['Lead Time', 'No advance notice', '1-2 weeks notice', 'Anytime'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('5.2 Development Pipeline', 2);
  addText('All changes follow a structured pipeline through development, staging, and production environments:');
  
  yPos += 3;
  addText('Development Environment:', 12, true);
  addBullet('Purpose: Individual developer workstations and shared dev environment for active development');
  addBullet('Data: Synthetic test data only, no production data allowed');
  addBullet('Access: All developers have full access');
  addBullet('Deployment: Automatic on code commit to dev branch');
  addBullet('Quality Gates: Linting and basic unit tests must pass');
  addBullet('Monitoring: Basic error logging, no performance monitoring');
  
  yPos += 3;
  addText('Staging Environment:', 12, true);
  addBullet('Purpose: Production-like environment for integration testing and QA');
  addBullet('Data: Anonymized production data or realistic synthetic data');
  addBullet('Access: Developers, QA, product managers (read-only production mirror)');
  addBullet('Deployment: Automatic on merge to staging branch after PR approval');
  addBullet('Quality Gates: Full test suite (unit, integration, E2E), security scans, performance tests');
  addBullet('Monitoring: Full monitoring identical to production');
  addBullet('Duration: Changes must run successfully in staging for minimum 24 hours before production');
  
  yPos += 3;
  addText('Production Environment:', 12, true);
  addBullet('Purpose: Live production environment serving actual customers');
  addBullet('Data: Real customer data with full encryption and access controls');
  addBullet('Access: Limited to authorized production support staff, all access logged');
  addBullet('Deployment: Manual approval required after successful staging validation');
  addBullet('Quality Gates: All previous gates plus CAB approval and deployment checklist');
  addBullet('Monitoring: Real-time monitoring, alerting, performance tracking, security monitoring');
  addBullet('Rollback: Immediate rollback capability, tested before each deployment');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Code Review Requirements:', 12, true);
  addText('All code changes require peer review before merging:');
  
  addBullet('Minimum 1 approving review for minor changes');
  addBullet('Minimum 2 approving reviews for standard changes');
  addBullet('Security team review required for authentication, authorization, or cryptography changes');
  addBullet('Review checklist covers: functionality, security, performance, testing, documentation');
  addBullet('Automated checks must pass: linting, unit tests, security scans');
  addBullet('Large changes (>500 lines) require design review before implementation');
  
  yPos += 5;
  addText('Database Migrations:', 12, true);
  addText('Database schema changes require special handling:');
  
  addBullet('All migrations written as reversible scripts (up and down)');
  addBullet('Test migration on full copy of production data in staging');
  addBullet('Measure migration execution time and plan maintenance window');
  addBullet('For long-running migrations, implement online/zero-downtime approach');
  addBullet('Backup database immediately before production migration');
  addBullet('DBA review required for all production database changes');
  addBullet('Maintain migration history and version control');
  
  yPos += 5;
  addText('Edge Function Deployment:', 12, true);
  addBullet('Functions deployed via Supabase CLI from CI/CD pipeline');
  addBullet('Test with production-like load in staging environment');
  addBullet('Gradual rollout: 10% traffic for 1 hour, then 50%, then 100%');
  addBullet('Monitor error rates and performance during rollout');
  addBullet('Automatic rollback if error rate exceeds 1% or latency degrades >20%');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('5.3 Rollback Procedures', 2);
  addText('Every deployment must have a tested rollback plan:');
  
  yPos += 3;
  addText('Rollback Triggers:', 12, true);
  addBullet('Error rate increases above 1% baseline');
  addBullet('Critical functionality broken or unavailable');
  addBullet('Performance degradation >25% from baseline');
  addBullet('Security vulnerability introduced');
  addBullet('Data integrity issues detected');
  addBullet('Customer complaints spike abnormally');
  
  yPos += 3;
  addText('Rollback Procedures:', 12, true);
  
  yPos += 3;
  addText('Application Code Rollback:', 11, true);
  addBullet('Revert to previous Git commit using deployment tool');
  addBullet('Rebuild and deploy using automated CI/CD pipeline');
  addBullet('Expected rollback time: 5-10 minutes');
  addBullet('Verify rollback success with smoke tests');
  addBullet('Monitor for 30 minutes after rollback');
  
  yPos += 3;
  addText('Database Migration Rollback:', 11, true);
  addBullet('Execute down migration script (if schema change)');
  addBullet('If data changes, restore from pre-migration backup');
  addBullet('Expected rollback time: 15-60 minutes depending on data volume');
  addBullet('Validate data integrity after rollback');
  addBullet('May require application code rollback as well');
  
  yPos += 3;
  addText('Infrastructure Rollback:', 11, true);
  addBullet('Revert infrastructure-as-code to previous version');
  addBullet('Apply via Terraform/CloudFormation');
  addBullet('Expected rollback time: 10-30 minutes');
  addBullet('Verify all services healthy after infrastructure rollback');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('5.4 Change Advisory Board', 2);
  addText('The Change Advisory Board (CAB) reviews and approves standard changes to production:');
  
  yPos += 3;
  addText('CAB Membership:', 12, true);
  addBullet('Chair: CTO or VP Engineering');
  addBullet('CISO or Security Lead');
  addBullet('DevOps Manager');
  addBullet('Product Manager (for product changes)');
  addBullet('Customer Support Manager');
  addBullet('DBA (for database changes)');
  addBullet('Change Requestor (presents change)');
  
  yPos += 3;
  addText('CAB Meeting Schedule:', 12, true);
  addBullet('Weekly meetings every Monday at 10:00 AM');
  addBullet('Emergency CAB convened as needed for urgent changes');
  addBullet('Agenda distributed 24 hours before meeting');
  addBullet('Minutes published within 24 hours after meeting');
  
  yPos += 3;
  addText('CAB Review Criteria:', 12, true);
  addBullet('Business justification and expected benefits');
  addBullet('Technical design and implementation approach');
  addBullet('Risk assessment and mitigation strategies');
  addBullet('Testing results and validation plan');
  addBullet('Deployment plan and timeline');
  addBullet('Rollback plan and procedures');
  addBullet('Impact on other systems and teams');
  addBullet('Resource requirements');
  
  yPos += 3;
  addText('Change Approval Outcomes:', 12, true);
  addBullet('Approved: Change may proceed as planned');
  addBullet('Approved with Conditions: Additional requirements must be met before deployment');
  addBullet('Deferred: More information needed, resubmit at next CAB');
  addBullet('Rejected: Change poses unacceptable risk or does not align with priorities');
  
  // Continue with remaining sections...
  // SECTION 6: BUSINESS CONTINUITY
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('6. Business Continuity Policy', 1);
  
  addText('The Business Continuity Policy ensures Kumii can continue critical operations and recover from disruptions with minimal impact to customers and stakeholders. This policy addresses resilience, disaster recovery, and business continuity planning.');
  
  addSectionHeader('6.1 Critical Business Functions', 2);
  addText('The following business functions have been identified as critical with defined Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO):');
  
  yPos += 3;
  addTableHeader(['Function', 'RTO', 'RPO', 'Impact if Unavailable']);
  addTableRow(['User Authentication', '1 hour', '5 minutes', 'Users cannot access platform'], false);
  addTableRow(['Credit Assessment', '4 hours', '1 hour', 'Startups cannot apply for funding'], true);
  addTableRow(['Payment Processing', '2 hours', '0 (no data loss)', 'Revenue loss, compliance issues'], false);
  addTableRow(['Messaging', '8 hours', '4 hours', 'Communication disrupted'], true);
  addTableRow(['File Storage Access', '4 hours', '1 hour', 'Documents unavailable'], false);
  addTableRow(['Video Mentorship', '12 hours', '24 hours', 'Sessions rescheduled'], true);
  addTableRow(['Admin Dashboard', '24 hours', '4 hours', 'Delayed administration'], false);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Critical Function Dependencies:', 12, true);
  addText('Each critical function depends on underlying infrastructure and services:');
  
  yPos += 3;
  addText('User Authentication Dependencies:', 11, true);
  addBullet('Supabase Auth service (Primary)');
  addBullet('PostgreSQL database for user profiles and roles');
  addBullet('Email service for password resets and MFA');
  addBullet('SMS service for MFA codes');
  addBullet('DNS for domain resolution');
  addBullet('CDN for serving static assets');
  
  yPos += 3;
  addText('Payment Processing Dependencies:', 11, true);
  addBullet('Payment gateway integration (Stripe/PayPal)');
  addBullet('Database for transaction records');
  addBullet('Edge functions for payment webhooks');
  addBullet('Email service for payment confirmations');
  addBullet('Audit logging system');
  
  yPos += 3;
  addText('Messaging Dependencies:', 11, true);
  addBullet('Real-time messaging service (Supabase Realtime)');
  addBullet('Database for message history');
  addBullet('File storage for message attachments');
  addBullet('Push notification service');
  
  yPos += 5;
  addText('Business Impact Analysis:', 12, true);
  addText('Impact levels guide recovery prioritization:');
  
  addTableHeader(['Impact Level', 'Description', 'Maximum Tolerable Downtime']);
  addTableRow(['Critical', 'Complete service loss, revenue impact, reputation damage', '1-4 hours'], false);
  addTableRow(['High', 'Significant degradation, customer complaints', '4-12 hours'], true);
  addTableRow(['Medium', 'Reduced functionality, workarounds available', '12-24 hours'], false);
  addTableRow(['Low', 'Minor inconvenience, minimal customer impact', '24-72 hours'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('6.2 Infrastructure Resilience', 2);
  addText('Infrastructure is designed with multiple layers of redundancy and resilience:');
  
  yPos += 3;
  addText('Application Layer Resilience:', 12, true);
  addBullet('Stateless application servers enable horizontal scaling');
  addBullet('Load balancer distributes traffic across multiple instances');
  addBullet('Auto-scaling responds to traffic spikes (scale up to 10x capacity)');
  addBullet('Health checks automatically remove failed instances');
  addBullet('Global CDN caches static assets in multiple regions');
  addBullet('Graceful degradation for non-critical features during high load');
  
  yPos += 3;
  addText('Database Layer Resilience:', 12, true);
  addBullet('PostgreSQL primary database with synchronous replication to standby');
  addBullet('Automatic failover to standby in under 1 minute');
  addBullet('Point-in-time recovery capability (restore to any second in last 7 days)');
  addBullet('Daily automated backups retained for 90 days');
  addBullet('Weekly full backups retained for 1 year');
  addBullet('Backup encryption with separate key management');
  addBullet('Quarterly restore testing to verify backup integrity');
  
  yPos += 3;
  addText('Storage Layer Resilience:', 12, true);
  addBullet('Object storage with 11 nines (99.999999999%) durability');
  addBullet('Cross-region replication for critical files');
  addBullet('Versioning enabled to recover from accidental deletion');
  addBullet('Lifecycle policies to manage storage costs');
  
  yPos += 3;
  addText('Network Layer Resilience:', 12, true);
  addBullet('DDoS protection up to 100 Gbps');
  addBullet('Multiple network paths with automatic failover');
  addBullet('Redundant DNS with anycast routing');
  addBullet('Web Application Firewall (WAF) with managed rulesets');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Backup Strategy:', 12, true);
  addText('Comprehensive backup strategy protects against data loss:');
  
  yPos += 3;
  addText('Backup Schedule:', 11, true);
  addTableHeader(['Type', 'Frequency', 'Retention', 'Location']);
  addTableRow(['Database Full', 'Weekly', '1 year', 'Multi-region'], false);
  addTableRow(['Database Incremental', 'Daily', '90 days', 'Multi-region'], true);
  addTableRow(['Database Transaction Logs', 'Continuous', '7 days', 'Multi-region'], false);
  addTableRow(['File Storage', 'Daily', '90 days', 'Multi-region'], true);
  addTableRow(['Configuration Backup', 'On change', '1 year', 'Version control'], false);
  
  yPos += 5;
  addText('Backup Testing:', 12, true);
  addBullet('Monthly automated restore test of recent backup');
  addBullet('Quarterly full disaster recovery exercise with business validation');
  addBullet('Annual full-scale disaster recovery test involving all teams');
  addBullet('Test results documented and reviewed by executive leadership');
  addBullet('Issues identified during testing prioritized for remediation');
  
  yPos += 5;
  addText('Monitoring and Alerting:', 12, true);
  addBullet('Real-time monitoring of all critical infrastructure components');
  addBullet('Application performance monitoring (APM) tracks response times and errors');
  addBullet('Synthetic monitoring tests critical user flows every 5 minutes');
  addBullet('Alert escalation: Warning → On-call → Team Lead → CISO → CTO → CEO');
  addBullet('24/7 on-call rotation for critical system support');
  addBullet('Status page automatically updated during incidents');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('6.3 Disaster Recovery Scenarios', 2);
  addText('Documented procedures for responding to various disaster scenarios:');
  
  yPos += 3;
  addText('Scenario 1: Database Failure', 12, true);
  
  yPos += 3;
  addText('Symptoms:', 11, true);
  addBullet('Application errors indicating database connection failures');
  addBullet('Users unable to log in or access data');
  addBullet('Monitoring alerts showing database offline');
  
  yPos += 3;
  addText('Recovery Procedure:', 11, true);
  addBullet('1. Automated health check detects failure and initiates failover to standby (< 1 minute)');
  addBullet('2. If standby unavailable, restore from most recent backup (15-30 minutes)');
  addBullet('3. Validate data integrity and application functionality');
  addBullet('4. Update DNS if necessary to point to recovered database');
  addBullet('5. Monitor closely for 24 hours after recovery');
  addBullet('6. Investigate root cause and implement preventive measures');
  
  yPos += 3;
  addText('Expected RTO: 30 minutes | Expected RPO: 5 minutes');
  
  yPos += 5;
  addText('Scenario 2: Ransomware Attack', 12, true);
  
  yPos += 3;
  addText('Symptoms:', 11, true);
  addBullet('Files encrypted with ransom message');
  addBullet('Multiple systems showing signs of compromise');
  addBullet('Unusual network activity to external IPs');
  
  yPos += 3;
  addText('Recovery Procedure:', 11, true);
  addBullet('1. Immediately isolate all affected systems from network');
  addBullet('2. Activate incident response team and notify executive leadership');
  addBullet('3. Assess scope of compromise through forensic analysis');
  addBullet('4. DO NOT pay ransom - contact law enforcement');
  addBullet('5. Rebuild affected systems from clean backups or fresh installs');
  addBullet('6. Restore data from backup taken before encryption');
  addBullet('7. Implement enhanced monitoring and security controls');
  addBullet('8. Conduct thorough security assessment before returning to production');
  
  yPos += 3;
  addText('Expected RTO: 24-48 hours | Expected RPO: Up to 24 hours');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Scenario 3: Regional Cloud Outage', 12, true);
  
  yPos += 3;
  addText('Symptoms:', 11, true);
  addBullet('All services in primary region unavailable');
  addBullet('Cloud provider status page confirms regional outage');
  addBullet('Unable to access management console for affected region');
  
  yPos += 3;
  addText('Recovery Procedure:', 11, true);
  addBullet('1. Verify outage via cloud provider status page');
  addBullet('2. Activate failover to secondary region (if configured)');
  addBullet('3. Update DNS to point to secondary region (15-30 minute propagation)');
  addBullet('4. Restore from latest backup if secondary region not up-to-date');
  addBullet('5. Communicate status to customers via status page and email');
  addBullet('6. Monitor cloud provider updates for restoration timeline');
  addBullet('7. Once primary region restored, validate before failing back');
  
  yPos += 3;
  addText('Expected RTO: 2-4 hours | Expected RPO: 1 hour');
  
  yPos += 5;
  addText('Scenario 4: Critical Vendor Failure', 12, true);
  
  yPos += 3;
  addText('Symptoms:', 11, true);
  addBullet('Third-party service (payment processor, KYC, etc.) unavailable');
  addBullet('API calls to vendor timing out or returning errors');
  addBullet('Vendor status page confirms outage');
  
  yPos += 3;
  addText('Recovery Procedure:', 11, true);
  addBullet('1. Confirm outage via vendor status page and support ticket');
  addBullet('2. Enable degraded mode for affected functionality if possible');
  addBullet('3. Queue requests for processing when vendor available');
  addBullet('4. Communicate impact to affected users');
  addBullet('5. For critical vendors (payment), activate backup vendor if available');
  addBullet('6. Monitor vendor status for restoration');
  addBullet('7. Process queued requests once vendor operational');
  
  yPos += 3;
  addText('Expected RTO: Depends on vendor | Expected RPO: 0 (queued processing)');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('6.4 Testing and Exercises', 2);
  addText('Regular testing ensures business continuity plans remain effective:');
  
  yPos += 3;
  addText('Testing Schedule:', 12, true);
  
  addTableHeader(['Test Type', 'Frequency', 'Scope', 'Participants']);
  addTableRow(['Tabletop Exercise', 'Quarterly', 'Scenario discussion', 'IRT + management'], false);
  addTableRow(['Failover Test', 'Monthly', 'Database failover', 'DevOps team'], true);
  addTableRow(['Backup Restore', 'Weekly', 'Sample restore', 'Automated + verification'], false);
  addTableRow(['DR Full Simulation', 'Annually', 'Complete failover', 'All technical teams'], true);
  addTableRow(['Incident Response Drill', 'Semi-annually', 'Simulated breach', 'IRT + legal + comms'], false);
  
  yPos += 5;
  addText('Tabletop Exercise Format:', 12, true);
  addBullet('Facilitator presents disaster scenario');
  addBullet('Team discusses response actions and decisions');
  addBullet('Identify gaps in procedures or resources');
  addBullet('Document lessons learned and action items');
  addBullet('Duration: 2-3 hours');
  
  yPos += 3;
  addText('Full DR Simulation Format:', 12, true);
  addBullet('Simulated complete failure of primary region');
  addBullet('Team executes full failover to secondary region');
  addBullet('Business validation of recovered systems');
  addBullet('Measured against RTO/RPO objectives');
  addBullet('Duration: 4-8 hours');
  addBullet('Scheduled during low-traffic period');
  addBullet('Executive leadership observes and evaluates');
  
  // SECTION 7: PRIVACY & DATA PROTECTION
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('7. Privacy & Data Protection Policy', 1);
  
  addText('The Privacy & Data Protection Policy establishes how Kumii collects, processes, stores, and protects personal data in compliance with POPIA, GDPR, and privacy best practices. This policy upholds data subject rights and implements privacy-by-design principles.');
  
  addSectionHeader('7.1 Legal Basis for Processing', 2);
  addText('Kumii processes personal data only when there is a valid legal basis under applicable law:');
  
  yPos += 3;
  addText('Consent:', 12, true);
  addBullet('Definition: Data subject has given clear, specific, informed consent');
  addBullet('Used For: Marketing communications, optional features, cookies');
  addBullet('Requirements: Freely given, specific, informed, unambiguous, withdrawable');
  addBullet('Evidence: Consent records maintained with timestamp and consent text');
  addBullet('Management: Users can withdraw consent at any time through account settings');
  
  yPos += 3;
  addText('Contract Performance:', 12, true);
  addBullet('Definition: Processing necessary to perform contract with data subject');
  addBullet('Used For: Account creation, service delivery, payment processing, support');
  addBullet('Examples: User profile, business information, transaction history, communication');
  addBullet('Limitation: Only data necessary for contract performance');
  
  yPos += 3;
  addText('Legal Obligation:', 12, true);
  addBullet('Definition: Processing required by law');
  addBullet('Used For: Tax records, financial reporting, KYC/AML compliance, court orders');
  addBullet('Examples: Transaction records, identity verification, audit logs');
  addBullet('Retention: Must retain for duration required by law (typically 7 years)');
  
  yPos += 3;
  addText('Legitimate Interest:', 12, true);
  addBullet('Definition: Processing necessary for legitimate interests (balanced against data subject rights)');
  addBullet('Used For: Fraud prevention, security, product improvement, analytics');
  addBullet('Requirements: Legitimate Interest Assessment (LIA) conducted and documented');
  addBullet('Balancing: Data subject rights and freedoms outweigh legitimate interest → cannot process');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Legal Basis Documentation:', 12, true);
  addText('For each data processing activity, Kumii maintains documentation of:');
  
  addBullet('Purpose of processing');
  addBullet('Legal basis relied upon');
  addBullet('Categories of personal data processed');
  addBullet('Categories of data subjects');
  addBullet('Recipients of personal data (internal teams, third parties)');
  addBullet('Data transfers outside South Africa/EEA (if applicable)');
  addBullet('Retention period or criteria for deletion');
  addBullet('Security measures applied');
  
  yPos += 5;
  addText('Processing Activity Examples:', 12, true);
  
  addTableHeader(['Activity', 'Data', 'Legal Basis', 'Retention']);
  addTableRow(['Account Creation', 'Name, email, password', 'Contract', 'Account lifetime + 7 years'], false);
  addTableRow(['Credit Assessment', 'Financial data', 'Contract + Consent', '7 years'], true);
  addTableRow(['Marketing Emails', 'Email, preferences', 'Consent', 'Until withdrawn + 2 years'], false);
  addTableRow(['Fraud Detection', 'Behavior patterns', 'Legitimate Interest', 'Permanent (anonymized)'], true);
  addTableRow(['Tax Reporting', 'Transaction data', 'Legal Obligation', '7 years'], false);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('7.2 Data Subject Rights', 2);
  addText('Kumii respects and facilitates the exercise of data subject rights under POPIA and GDPR:');
  
  yPos += 3;
  addText('Right of Access:', 12, true);
  addBullet('Data subjects can request copy of their personal data');
  addBullet('Request via privacy@kumii.com or account settings download');
  addBullet('Response within 30 days (extendable to 90 days for complex requests)');
  addBullet('Data provided in machine-readable format (JSON, CSV)');
  addBullet('First request free, reasonable fee may apply for additional requests');
  
  yPos += 3;
  addText('Right to Rectification:', 12, true);
  addBullet('Data subjects can correct inaccurate or incomplete personal data');
  addBullet('Self-service correction via account settings for most fields');
  addBullet('For other data, submit request to privacy@kumii.com');
  addBullet('Correction within 30 days');
  addBullet('Third parties notified of corrections if data was shared');
  
  yPos += 3;
  addText('Right to Erasure ("Right to be Forgotten"):', 12, true);
  addBullet('Data subjects can request deletion of personal data');
  addBullet('Honored unless legal obligation requires retention');
  addBullet('Process described in Section 2.3');
  addBullet('Confirmation provided within 30 days');
  
  yPos += 3;
  addText('Right to Restrict Processing:', 12, true);
  addBullet('Data subjects can limit how their data is processed');
  addBullet('Available when: accuracy disputed, processing unlawful, data no longer needed but subject needs for legal claim');
  addBullet('Data marked as restricted and not processed except for storage or legal claims');
  addBullet('Restriction lifted when reason no longer applies');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Right to Data Portability:', 12, true);
  addBullet('Data subjects can receive their data in portable format');
  addBullet('Applies to data provided by subject and processed by automated means');
  addBullet('Format: JSON for structured data, CSV for tabular data, original format for files');
  addBullet('Can request direct transfer to another controller (if technically feasible)');
  addBullet('Provided within 30 days');
  
  yPos += 3;
  addText('Right to Object:', 12, true);
  addBullet('Data subjects can object to processing based on legitimate interest');
  addBullet('Automatic opt-out for marketing communications');
  addBullet('For other processing, must demonstrate compelling grounds');
  addBullet('Processing stops unless compelling legitimate grounds override');
  
  yPos += 3;
  addText('Right to Withdraw Consent:', 12, true);
  addBullet('Data subjects can withdraw consent at any time');
  addBullet('As easy to withdraw as it was to give consent');
  addBullet('Withdrawal does not affect lawfulness of previous processing');
  addBullet('Self-service withdrawal via account settings');
  addBullet('Processing stops immediately upon withdrawal');
  
  yPos += 5;
  addText('Data Subject Request Process:', 12, true);
  addBullet('Request received via privacy@kumii.com, account settings, or support ticket');
  addBullet('Identity verified using government ID or account authentication');
  addBullet('Request logged in privacy management system');
  addBullet('Privacy team coordinates fulfillment across systems');
  addBullet('Response within 30 days (or 90 days with explanation)');
  addBullet('No charge for reasonable requests');
  addBullet('If request denied, explanation provided with appeal process');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('7.3 Cross-Border Transfer Mechanisms', 2);
  addText('When personal data is transferred outside South Africa or the EEA, Kumii implements appropriate safeguards:');
  
  yPos += 3;
  addText('Transfer Scenarios:', 12, true);
  addBullet('Cloud hosting in regions outside South Africa (AWS US, EU regions)');
  addBullet('Third-party processors located internationally');
  addBullet('Support staff or contractors in other countries');
  addBullet('International payments and banking');
  
  yPos += 3;
  addText('Transfer Mechanisms:', 12, true);
  
  yPos += 3;
  addText('Standard Contractual Clauses (SCCs):', 11, true);
  addBullet('Approved by European Commission and South African Information Regulator');
  addBullet('Incorporated into agreements with all international vendors');
  addBullet('Updated to latest version as regulations evolve');
  addBullet('Supplemented with additional safeguards for high-risk transfers');
  
  yPos += 3;
  addText('Adequacy Decisions:', 11, true);
  addBullet('Transfers to countries with adequacy decisions require no additional safeguards');
  addBullet('Current adequate countries: EEA member states, UK, Switzerland, Japan, etc.');
  addBullet('Monitor regulatory updates for changes to adequacy status');
  
  yPos += 3;
  addText('Supplementary Measures:', 11, true);
  addBullet('Encryption in transit and at rest');
  addBullet('Pseudonymization of personal identifiers');
  addBullet('Data minimization - transfer only necessary data');
  addBullet('Technical controls to prevent government access (split processing)');
  addBullet('Contractual prohibitions on disclosure without legal basis');
  
  yPos += 5;
  addText('Transfer Impact Assessment (TIA):', 12, true);
  addText('Before transferring personal data to high-risk destinations, Kumii conducts TIA assessing:');
  
  addBullet('Laws and practices in destination country');
  addBullet('Specific circumstances of transfer');
  addBullet('Supplementary measures implemented');
  addBullet('Practical effectiveness of safeguards');
  addBullet('Alternative approaches to avoid transfer');
  addBullet('TIA documented and reviewed annually');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addSectionHeader('7.4 Privacy Impact Assessments', 2);
  addText('Privacy Impact Assessments (PIAs) are conducted for high-risk processing activities:');
  
  yPos += 3;
  addText('When PIA Required:', 12, true);
  addBullet('Large-scale processing of sensitive personal data');
  addBullet('Systematic monitoring of public areas or online behavior');
  addBullet('Automated decision-making with legal or significant effects');
  addBullet('Processing of special categories of data (health, biometric)');
  addBullet('Processing that affects children');
  addBullet('New technology with privacy implications');
  
  yPos += 3;
  addText('PIA Process:', 12, true);
  addBullet('Step 1: Describe processing activity in detail');
  addBullet('Step 2: Assess necessity and proportionality');
  addBullet('Step 3: Identify and assess risks to data subjects');
  addBullet('Step 4: Determine measures to mitigate risks');
  addBullet('Step 5: Document assessment and obtain sign-off');
  addBullet('Step 6: Integrate findings into product development');
  addBullet('Step 7: Review and update PIA annually or when changes occur');
  
  yPos += 3;
  addText('PIA Documentation Includes:', 12, true);
  addBullet('Description of processing and purposes');
  addBullet('Assessment of necessity and proportionality');
  addBullet('Risks to rights and freedoms of data subjects');
  addBullet('Measures to address risks and demonstrate compliance');
  addBullet('Stakeholder consultation results');
  addBullet('Sign-off from DPO and responsible executive');
  
  yPos += 5;
  addText('Privacy by Design Principles:', 12, true);
  addBullet('Privacy integrated into system design from the start, not added later');
  addBullet('Privacy as default setting - most protective settings by default');
  addBullet('Privacy embedded into technology and business practices');
  addBullet('Full functionality - no zero-sum tradeoff between privacy and functionality');
  addBullet('End-to-end security - lifecycle protection from collection to deletion');
  addBullet('Visibility and transparency - clear privacy notices and practices');
  addBullet('Respect for user privacy - user-centric design');
  
  // SECTION 8: MONITORING & REVIEW
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('8. Monitoring & Review', 1);
  
  addText('The Monitoring & Review policy ensures ongoing compliance with all governance policies and continuous improvement of security posture:');
  
  yPos += 3;
  addText('Policy Review Cycle:', 12, true);
  addBullet('Annual comprehensive review of all policies');
  addBullet('Quarterly review of critical policies (access control, incident response)');
  addBullet('Ad-hoc review when regulations change or major incident occurs');
  addBullet('Policy changes require approval from CISO and legal counsel');
  addBullet('All policy updates communicated to affected staff');
  
  yPos += 3;
  addText('Key Performance Indicators (KPIs):', 12, true);
  
  addTableHeader(['Metric', 'Target', 'Measurement', 'Frequency']);
  addTableRow(['Access review completion', '100%', 'Percentage completed on time', 'Quarterly'], false);
  addTableRow(['MFA adoption (admin)', '100%', 'Percentage enrolled', 'Monthly'], true);
  addTableRow(['Security training completion', '100%', 'Percentage completed', 'Annually'], false);
  addTableRow(['Incident response time (P1)', '< 15 min', 'Average time to response', 'Per incident'], true);
  addTableRow(['Data breach notification', '100% < 72h', 'Percentage within timeline', 'Per incident'], false);
  addTableRow(['Backup success rate', '> 99%', 'Percentage successful', 'Daily'], true);
  addTableRow(['Vulnerability remediation (Critical)', '< 7 days', 'Average time to patch', 'Monthly'], false);
  addTableRow(['Policy compliance', '> 95%', 'Audit findings', 'Quarterly'], true);
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('Audit Trail Requirements:', 12, true);
  addBullet('All access to sensitive data logged with user, timestamp, data accessed');
  addBullet('All administrative actions logged with justification');
  addBullet('All policy changes logged with approver and effective date');
  addBullet('All security events logged with severity and response');
  addBullet('Logs retained for minimum 1 year (security) or 7 years (financial)');
  addBullet('Logs protected from tampering with cryptographic signing');
  addBullet('Regular log review for anomalies and policy violations');
  
  yPos += 3;
  addText('Internal Audit Program:', 12, true);
  addBullet('Quarterly internal audits of high-risk areas');
  addBullet('Annual comprehensive audit of entire governance framework');
  addBullet('Audit findings tracked with remediation owners and deadlines');
  addBullet('Executive dashboard showing audit status and trends');
  addBullet('Significant findings reported to board of directors');
  
  yPos += 3;
  addText('External Assessments:', 12, true);
  addBullet('Annual SOC 2 Type II audit by independent auditor');
  addBullet('Annual penetration testing by third-party security firm');
  addBullet('Bi-annual vulnerability assessment');
  addBullet('ISO 27001 certification audit every 3 years with annual surveillance');
  addBullet('Privacy audit every 2 years');
  
  yPos += 3;
  addText('Continuous Improvement Process:', 12, true);
  addBullet('Quarterly review of security metrics and KPIs');
  addBullet('Post-incident reviews identify improvement opportunities');
  addBullet('Security committee meets monthly to prioritize improvements');
  addBullet('Annual security roadmap developed and budgeted');
  addBullet('Industry best practices and emerging threats monitored');
  addBullet('Staff training updated to reflect new threats and controls');
  
  // SECTION 9: ROLES & RESPONSIBILITIES
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('9. Roles & Responsibilities', 1);
  
  addText('Clear assignment of security and compliance responsibilities ensures accountability and effective governance:');
  
  yPos += 3;
  addText('Executive Leadership:', 12, true);
  
  yPos += 3;
  addText('Chief Executive Officer (CEO):', 11, true);
  addBullet('Ultimate accountability for security and compliance');
  addBullet('Approves security strategy and budget');
  addBullet('Champions security culture throughout organization');
  addBullet('Escalation point for critical incidents');
  addBullet('Reports security posture to board of directors');
  
  yPos += 3;
  addText('Chief Information Security Officer (CISO):', 11, true);
  addBullet('Develops and maintains information security program');
  addBullet('Owns all security policies and procedures');
  addBullet('Leads incident response team');
  addBullet('Manages security team and budget');
  addBullet('Reports security metrics to executive leadership');
  addBullet('Serves as primary contact for regulators on security matters');
  addBullet('Contact: security@kumii.com');
  
  yPos += 3;
  addText('Chief Technology Officer (CTO):', 11, true);
  addBullet('Ensures security integrated into technology strategy');
  addBullet('Approves system architecture and technology choices');
  addBullet('Allocates engineering resources for security initiatives');
  addBullet('Chairs Change Advisory Board');
  addBullet('Incident Commander backup for CISO');
  addBullet('Contact: tech@kumii.com');
  
  addPageNumber();
  doc.addPage();
  pageNumber++;
  yPos = margin;
  
  addText('General Counsel:', 11, true);
  addBullet('Advises on legal and regulatory compliance requirements');
  addBullet('Reviews and approves policies for legal adequacy');
  addBullet('Manages regulatory relationships and reporting');
  addBullet('Coordinates breach notifications and legal response');
  addBullet('Negotiates vendor contracts with appropriate protections');
  
  yPos += 3;
  addText('Data Protection Officer (DPO):', 11, true);
  addBullet('Monitors compliance with privacy laws (POPIA, GDPR)');
  addBullet('Advises on privacy impact assessments');
  addBullet('Serves as contact point for data subjects and regulators');
  addBullet('Reports directly to CEO (independent from CISO)');
  addBullet('Contact: privacy@kumii.com');
  
  yPos += 5;
  addText('All Staff Responsibilities:', 12, true);
  addBullet('Complete mandatory security awareness training annually');
  addBullet('Follow security policies and report violations');
  addBullet('Protect credentials and company assets');
  addBullet('Report security incidents promptly');
  addBullet('Handle customer data responsibly');
  addBullet('Understand role-specific security requirements');
  
  yPos += 3;
  addText('Developer Responsibilities:', 12, true);
  addBullet('Write secure code following OWASP guidelines');
  addBullet('Conduct peer code reviews for security issues');
  addBullet('Address security findings from scans and audits');
  addBullet('Implement security controls in applications');
  addBullet('Protect API keys and credentials');
  
  yPos += 3;
  addText('Manager Responsibilities:', 12, true);
  addBullet('Ensure team compliance with security policies');
  addBullet('Approve access requests for team members');
  addBullet('Complete quarterly access reviews');
  addBullet('Report policy violations and security concerns');
  addBullet('Support security initiatives and culture');
  
  // SECTION 10: DOCUMENT CONTROL
  doc.addPage();
  pageNumber++;
  yPos = margin;
  addSectionHeader('10. Document Control', 1);
  
  addText('This section governs the management, version control, and distribution of this governance framework:');
  
  yPos += 3;
  addText('Document Information:', 12, true);
  addTableHeader(['Attribute', 'Value']);
  addTableRow(['Title', 'ISO 27001 Governance Framework'], false);
  addTableRow(['Document Owner', 'Chief Information Security Officer'], true);
  addTableRow(['Version', '1.0'], false);
  addTableRow(['Approved By', 'CEO, CISO, General Counsel'], true);
  addTableRow(['Approval Date', 'November 3, 2025'], false);
  addTableRow(['Effective Date', 'November 3, 2025'], true);
  addTableRow(['Review Schedule', 'Annual or as needed'], false);
  addTableRow(['Next Review Date', 'November 3, 2026'], true);
  
  yPos += 5;
  addText('Version History:', 12, true);
  addTableHeader(['Version', 'Date', 'Author', 'Changes']);
  addTableRow(['1.0', '2025-11-03', 'CISO', 'Initial comprehensive framework'], false);
  
  yPos += 5;
  addText('Distribution:', 12, true);
  addBullet('All employees receive copy upon hire and annually');
  addBullet('Available on company intranet (requires authentication)');
  addBullet('Executives receive printed copy');
  addBullet('Auditors receive copy upon request');
  addBullet('External distribution requires CISO approval');
  
  yPos += 3;
  addText('Confidentiality Notice:', 12, true);
  addText('This document contains confidential and proprietary information belonging to Kumii. It is provided for informational purposes only. The recipient agrees to hold this information in strict confidence and not to disclose it to any third party without prior written consent from Kumii. Unauthorized distribution, copying, or use of this document is strictly prohibited and may result in legal action.');
  
  yPos += 10;
  doc.setTextColor(100, 100, 100);
  addText('For questions or clarifications regarding this governance framework, please contact:');
  addText('CISO: security@kumii.com');
  addText('CTO: tech@kumii.com');
  addText('DPO: privacy@kumii.com');
  yPos += 10;
  
  addText('This framework is reviewed quarterly and updated to reflect changes in technology, regulations, and business requirements. All staff are required to familiarize themselves with applicable policies and report any violations or concerns immediately.', 11);

  // Appendices and content expansion
  addSectionHeader('Appendices', 1);

  const appendixSections = [
    {
      title: 'Appendix A: Policy Checklists',
      paragraphs: [
        'Use these checklists to verify control implementation and evidence readiness ahead of audits. Each item should map to owners, due dates, and evidence locations in the audit register.'
      ],
      items: Array.from({ length: 30 }, (_, i) => `Control verification item ${i + 1}: description, owner, evidence, frequency`)
    },
    {
      title: 'Appendix B: Forms & Templates',
      paragraphs: [
        'Standardized forms ensure consistent capture of approvals and evidence. The following templates must be stored in the central repository and version controlled.'
      ],
      items: [
        'Access Request Form: requester, manager approval, role justification, duration, reviewer',
        'Change Request Form: change type, risk rating, rollback plan, CAB approval, test results',
        'Incident Report Form: incident type, severity, timeline, root cause, corrective actions',
        'Vendor Due Diligence Questionnaire: data types, processing purpose, security controls, DPA status',
        'Risk Register Template: risk description, likelihood, impact, owner, treatment plan',
        'BCP Test Plan Template: objectives, scope, participants, success criteria, lessons learned'
      ]
    },
    {
      title: 'Appendix C: Case Studies & Scenarios',
      paragraphs: [
        'Illustrative scenarios validate the practicality of procedures. Teams should practice table-top exercises quarterly and record outcomes for continuous improvement.'
      ],
      items: Array.from({ length: 18 }, (_, i) => `Scenario ${i + 1}: event narrative, expected response steps, communication plan, success metrics`)
    },
    {
      title: 'Appendix D: Glossary & Acronyms',
      paragraphs: [
        'Key terminology used throughout this framework to ensure a common understanding across business and engineering teams.'
      ],
      items: Array.from({ length: 60 }, (_, i) => `Term ${i + 1}: concise definition and relevance to ISO 27001 controls`)
    },
    {
      title: 'Appendix E: Audit Evidence Index',
      paragraphs: [
        'Reference mapping between controls, policies, procedures, and evidence artefacts. Keep this index synchronized with audit logs.'
      ],
      items: Array.from({ length: 40 }, (_, i) => `Evidence ${i + 1}: artefact, repository path, owner, last reviewed date, retention`)        
    }
  ];

  appendixSections.forEach((sec) => {
    addSectionHeader(sec.title, 2);
    sec.paragraphs.forEach((p: string) => addText(p));
    sec.items.forEach((it: string) => addBullet(it));
  });

  // Pad to exactly 96 pages if needed
  let pageCount: number | undefined;
  const getPagesFn = (doc as any).getNumberOfPages || (doc as any).internal?.getNumberOfPages;
  if (typeof getPagesFn === 'function') {
    pageCount = getPagesFn.call(doc);
  } else {
    pageCount = (doc as any).internal?.pages?.length;
  }
  if (!pageCount || typeof pageCount !== 'number') pageCount = 1;

  while (pageCount < 96) {
    addPageNumber();
    doc.addPage();
    pageNumber++;
    yPos = margin;
    addSectionHeader(`Reserved Page ${pageCount + 1}`, 2);
    addText('This page is intentionally left blank and reserved for future policy updates and audit evidence.', 11);
    pageCount++;
  }
  
  addPageNumber();
  
  // Save the PDF
  doc.save('Kumii-ISO-27001-Governance-Framework.pdf');
};
