import jsPDF from 'jspdf';

// Typography constants for consistency
const TYPO = {
  title: 24,
  subtitle: 16,
  heading1: 18,
  heading2: 14,
  heading3: 12,
  body: 10,
  small: 9,
  code: 9
};

const LINE_HEIGHT_FACTOR = 1.5;

// Sanitize text for jsPDF
const sanitizeText = (text: string): string => {
  return text.replace(/[^\x20-\x7E\n]/g, '');
};

export const generateSecurityAwarenessPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add text with word wrapping and page break
  const addText = (text: string, fontSize: number = TYPO.body, isBold: boolean = false, isCode: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(sanitizeText(text), contentWidth);
    const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
    
    lines.forEach((line: string) => {
      if (yPos + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      if (isCode) {
        doc.setTextColor(60, 60, 60);
        doc.text(line, margin + 5, yPos);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text(line, margin, yPos);
      }
      yPos += lineHeight;
    });
  };

  const addBullet = (text: string, indent: number = 0) => {
    const bulletX = margin + indent;
    const textX = bulletX + 5;
    
    doc.setFontSize(TYPO.body);
    doc.text('•', bulletX, yPos);
    
    const lines = doc.splitTextToSize(sanitizeText(text), contentWidth - indent - 5);
    const lineHeight = TYPO.body * LINE_HEIGHT_FACTOR;
    
    lines.forEach((line: string, index: number) => {
      if (yPos + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, index === 0 ? textX : textX, yPos);
      yPos += lineHeight;
    });
  };

  const addHeading = (text: string, level: 1 | 2 | 3 = 1) => {
    const fontSize = level === 1 ? TYPO.heading1 : level === 2 ? TYPO.heading2 : TYPO.heading3;
    yPos += 5;
    addText(text, fontSize, true);
    yPos += 3;
  };

  const addSpace = (amount: number = 5) => {
    yPos += amount;
  };

  const addHorizontalLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
  };

  // Cover Page
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(TYPO.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Kumii Platform', pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(TYPO.subtitle);
  doc.text('Security Awareness & Training Program', pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(TYPO.body);
  doc.setFont('helvetica', 'normal');
  doc.text('Employee Security Education & Compliance', pageWidth / 2, 120, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 140, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  // Table of Contents
  doc.addPage();
  yPos = margin;
  addHeading('Table of Contents', 1);
  addSpace(5);
  
  const tocItems = [
    '1. Program Overview',
    '2. Training Curriculum',
    '3. Phishing Simulation Program',
    '4. Secure Development Lifecycle',
    '5. Incident Response Training',
    '6. Compliance & Regulations',
    '7. Training Delivery & Tracking',
    '8. Resources & Support',
    '9. Certification & Continuous Improvement'
  ];
  
  tocItems.forEach(item => {
    addText(item, TYPO.body);
  });

  // 1. Program Overview
  doc.addPage();
  yPos = margin;
  addHeading('1. Program Overview', 1);
  addHorizontalLine();
  
  addHeading('Purpose', 2);
  addText('This Security Awareness & Training Program equips all Kumii employees with the knowledge and skills to identify, prevent, and respond to security threats while ensuring compliance with data protection regulations.');
  addSpace();
  
  addHeading('Scope', 2);
  addText('This program applies to:');
  addBullet('All full-time and part-time employees');
  addBullet('Contractors and temporary workers');
  addBullet('Third-party vendors with system access');
  addBullet('Executive leadership and board members');
  addSpace();
  
  addHeading('Key Objectives', 2);
  addBullet('Recognize phishing, social engineering, and malware threats');
  addBullet('Implement secure password and authentication practices');
  addBullet('Handle sensitive data according to POPIA and GDPR requirements');
  addBullet('Report security incidents promptly and effectively');
  addBullet('Maintain security awareness through continuous education');

  // 2. Training Curriculum
  doc.addPage();
  yPos = margin;
  addHeading('2. Training Curriculum', 1);
  addHorizontalLine();
  
  addHeading('2.1 Mandatory Onboarding Training (Day 1)', 2);
  addText('All new employees must complete security training on their first day:');
  addSpace();
  
  addText('Security Fundamentals (30 minutes):', TYPO.body, true);
  addBullet('Information security principles (CIA triad)');
  addBullet('Kumii security policies and acceptable use');
  addBullet('Physical security and clean desk policy');
  addBullet('Remote work security guidelines');
  addSpace();
  
  addText('Authentication & Access Control (20 minutes):', TYPO.body, true);
  addBullet('Strong password creation and management');
  addBullet('Multi-factor authentication (MFA) setup');
  addBullet('Password manager usage (1Password/LastPass)');
  addBullet('Single Sign-On (SSO) best practices');
  addSpace();
  
  addText('Phishing & Social Engineering (25 minutes):', TYPO.body, true);
  addBullet('Identifying phishing emails and suspicious links');
  addBullet('Social engineering tactics and red flags');
  addBullet('Verification procedures for sensitive requests');
  addBullet('Reporting suspicious communications');
  addSpace();
  
  addText('Data Protection & Privacy (25 minutes):', TYPO.body, true);
  addBullet('Data classification levels (Public, Internal, Confidential, Restricted)');
  addBullet('POPIA and GDPR compliance fundamentals');
  addBullet('Secure data handling and transmission');
  addBullet('Personal device security (BYOD policy)');
  addSpace();
  
  addText('Incident Response (20 minutes):', TYPO.body, true);
  addBullet('What constitutes a security incident');
  addBullet('Immediate reporting procedures');
  addBullet('Contact information for security team');
  addBullet('Do\'s and don\'ts during an incident');
  addSpace();
  
  addHeading('2.2 Annual Refresher Training', 2);
  addText('All employees must complete annual refresher training covering:');
  addBullet('Latest security threats and attack trends');
  addBullet('Policy updates and new security tools');
  addBullet('Case studies of recent security incidents');
  addBullet('Interactive scenarios and knowledge checks');
  addSpace();
  
  addHeading('2.3 Role-Specific Training', 2);
  addSpace();
  
  addText('Developers & Engineers:', TYPO.body, true);
  addBullet('Secure coding practices (OWASP Top 10)');
  addBullet('Code review and security testing');
  addBullet('API security and authentication');
  addBullet('Secrets management and encryption');
  addBullet('Supply chain security (dependency management)');
  addSpace();
  
  addText('System Administrators:', TYPO.body, true);
  addBullet('Infrastructure security hardening');
  addBullet('Patch management and vulnerability scanning');
  addBullet('Access control and privilege management');
  addBullet('Security monitoring and incident detection');
  addBullet('Backup and disaster recovery procedures');
  addSpace();
  
  addText('Data Analysts & Scientists:', TYPO.body, true);
  addBullet('Data privacy and anonymization techniques');
  addBullet('Secure data processing and storage');
  addBullet('Third-party data sharing agreements');
  addBullet('Statistical disclosure control methods');
  addSpace();
  
  addText('Executive Leadership:', TYPO.body, true);
  addBullet('Cybersecurity governance and risk management');
  addBullet('Board-level security reporting');
  addBullet('Business continuity and crisis management');
  addBullet('Regulatory compliance and legal obligations');
  addBullet('Security investment and resource allocation');

  // 3. Phishing Simulation Program
  doc.addPage();
  yPos = margin;
  addHeading('3. Phishing Simulation Program', 1);
  addHorizontalLine();
  
  addHeading('Program Structure', 2);
  addText('Monthly simulated phishing campaigns test employee awareness and response:');
  addSpace();
  
  addText('Campaign Types:', TYPO.body, true);
  addBullet('Standard phishing: Generic credential harvesting attempts');
  addBullet('Spear phishing: Targeted attacks using employee information');
  addBullet('Whaling: Executive-level targeted campaigns');
  addBullet('Smishing: SMS-based phishing simulations');
  addBullet('Vishing: Voice call social engineering scenarios');
  addSpace();
  
  addHeading('Success Metrics', 2);
  addText('Click Rate: Percentage of employees who clicked malicious links');
  addText('Target: <5% click rate organization-wide');
  addSpace();
  addText('Data Entry Rate: Employees who entered credentials on phishing pages');
  addText('Target: <2% data entry rate');
  addSpace();
  addText('Reporting Rate: Employees who reported phishing attempts');
  addText('Target: >75% reporting rate');
  addSpace();
  
  addHeading('Response Procedures', 2);
  addText('Employees who fail simulations receive:');
  addBullet('Immediate educational popup with correct response');
  addBullet('Required completion of targeted phishing training module');
  addBullet('Manager notification after 3 consecutive failures');
  addBullet('Mandatory one-on-one security coaching after 5 failures');
  addSpace();
  
  addHeading('Reporting Suspicious Emails', 2);
  addText('Employees must report suspicious emails using:');
  addBullet('PhishAlert button in email client (primary method)');
  addBullet('Forward to security@kumii.com with [PHISHING] in subject');
  addBullet('Security hotline: +27 (0)11 XXX-XXXX');
  addSpace();
  
  addHeading('Rewards Program', 2);
  addText('Employees who report real phishing attempts receive:');
  addBullet('Security Champion recognition in monthly newsletter');
  addBullet('Entry into quarterly prize drawing');
  addBullet('Annual Security Guardian Award for top reporters');

  // 4. Secure Development Lifecycle
  doc.addPage();
  yPos = margin;
  addHeading('4. Secure Development Lifecycle (SDL)', 1);
  addHorizontalLine();
  
  addHeading('4.1 Security Requirements Phase', 2);
  addBullet('Threat modeling for all new features and services');
  addBullet('Privacy Impact Assessment (PIA) for data processing');
  addBullet('Security requirements documentation');
  addBullet('Risk assessment and mitigation planning');
  addSpace();
  
  addHeading('4.2 Secure Code Review Checklist', 2);
  addText('All code must be reviewed for:');
  addSpace();
  
  addText('Input Validation:', TYPO.body, true);
  addBullet('All user inputs validated and sanitized');
  addBullet('Parameterized queries prevent SQL injection');
  addBullet('File upload restrictions and validation');
  addSpace();
  
  addText('Authentication & Authorization:', TYPO.body, true);
  addBullet('Proper session management and timeout');
  addBullet('Role-based access control (RBAC) enforcement');
  addBullet('Multi-factor authentication where required');
  addSpace();
  
  addText('Data Protection:', TYPO.body, true);
  addBullet('Sensitive data encrypted in transit (TLS 1.3)');
  addBullet('Sensitive data encrypted at rest (AES-256)');
  addBullet('No hardcoded secrets or credentials');
  addBullet('Secure key management practices');
  addSpace();
  
  addText('Error Handling:', TYPO.body, true);
  addBullet('Generic error messages to users (no stack traces)');
  addBullet('Detailed errors logged securely');
  addBullet('No sensitive data in error messages');
  addSpace();
  
  addHeading('4.3 Security Testing', 2);
  addText('Automated Testing:', TYPO.body, true);
  addBullet('Static Application Security Testing (SAST) in CI/CD pipeline');
  addBullet('Dependency vulnerability scanning (Snyk, Dependabot)');
  addBullet('Dynamic Application Security Testing (DAST) on staging');
  addSpace();
  
  addText('Manual Testing:', TYPO.body, true);
  addBullet('Penetration testing annually by third-party security firm');
  addBullet('Security code reviews for critical features');
  addBullet('Threat modeling workshops for complex systems');

  // 5. Incident Response Training
  doc.addPage();
  yPos = margin;
  addHeading('5. Incident Response Training', 1);
  addHorizontalLine();
  
  addHeading('5.1 What Constitutes a Security Incident', 2);
  addBullet('Unauthorized access to systems or data');
  addBullet('Suspected malware or ransomware infection');
  addBullet('Data breach or exposure of sensitive information');
  addBullet('Phishing attempts targeting employees');
  addBullet('Lost or stolen devices containing company data');
  addBullet('Suspicious system behavior or performance issues');
  addBullet('Unauthorized configuration changes');
  addSpace();
  
  addHeading('5.2 Immediate Response Procedures', 2);
  addText('When you suspect a security incident:', TYPO.body, true);
  addSpace();
  
  addText('DO:', TYPO.body, true);
  addBullet('Report immediately to security@kumii.com or Security Hotline');
  addBullet('Document what you observed (screenshots, timestamps)');
  addBullet('Isolate affected systems if possible (disconnect network)');
  addBullet('Preserve evidence (don\'t delete files or clear logs)');
  addBullet('Follow instructions from the security team');
  addSpace();
  
  addText('DON\'T:', TYPO.body, true);
  addBullet('Attempt to investigate or remediate on your own');
  addBullet('Delete files or clear browser history');
  addBullet('Discuss the incident on unsecured channels');
  addBullet('Contact affected parties before consulting security team');
  addBullet('Restart systems without approval');
  addSpace();
  
  addHeading('5.3 Incident Response Team', 2);
  addText('Security Hotline: +27 (0)11 XXX-XXXX (24/7)');
  addText('Email: security@kumii.com');
  addText('Slack: #security-incidents (monitored 24/7)');
  addSpace();
  addText('Response Time Commitments:');
  addBullet('Critical incidents: 15-minute initial response');
  addBullet('High priority: 1-hour initial response');
  addBullet('Medium/Low priority: 4-hour initial response');

  // 6. Compliance & Regulations
  doc.addPage();
  yPos = margin;
  addHeading('6. Compliance & Regulations', 1);
  addHorizontalLine();
  
  addHeading('6.1 POPIA Compliance (Protection of Personal Information Act)', 2);
  addText('Key Principles:', TYPO.body, true);
  addBullet('Accountability: Kumii is responsible for personal information processing');
  addBullet('Processing limitation: Only process data for lawful purposes');
  addBullet('Purpose specification: Clear purpose for data collection');
  addBullet('Further processing: Compatible with original purpose');
  addBullet('Information quality: Data must be accurate and up to date');
  addBullet('Openness: Transparent about data processing activities');
  addBullet('Security safeguards: Implement appropriate security measures');
  addBullet('Data subject participation: Respect individual rights');
  addSpace();
  
  addText('Employee Responsibilities:', TYPO.body, true);
  addBullet('Only access personal information necessary for your role');
  addBullet('Never share personal information without authorization');
  addBullet('Report data breaches within 24 hours');
  addBullet('Respond to data subject requests within 30 days');
  addBullet('Delete personal information when no longer needed');
  addSpace();
  
  addHeading('6.2 GDPR Compliance (General Data Protection Regulation)', 2);
  addText('Key Rights of Data Subjects:', TYPO.body, true);
  addBullet('Right to access: Individuals can request their data');
  addBullet('Right to rectification: Correct inaccurate data');
  addBullet('Right to erasure: "Right to be forgotten"');
  addBullet('Right to data portability: Transfer data to another provider');
  addBullet('Right to object: Object to data processing');
  addSpace();
  
  addText('Breach Notification:', TYPO.body, true);
  addBullet('Report breaches to supervisory authority within 72 hours');
  addBullet('Notify affected individuals if high risk to rights and freedoms');
  addBullet('Document all data breaches (even if not reportable)');

  // 7. Training Delivery & Tracking
  doc.addPage();
  yPos = margin;
  addHeading('7. Training Delivery & Tracking', 1);
  addHorizontalLine();
  
  addHeading('7.1 Training Schedule Matrix', 2);
  addText('Training completion requirements by role:');
  addSpace();
  
  const trainingMatrix = [
    ['Training Type', 'All Staff', 'Developers', 'Admins', 'Leadership'],
    ['Onboarding', 'Day 1', 'Day 1', 'Day 1', 'Day 1'],
    ['Annual Refresher', 'Yearly', 'Yearly', 'Yearly', 'Yearly'],
    ['Phishing Simulation', 'Monthly', 'Monthly', 'Monthly', 'Monthly'],
    ['Secure Coding', '-', 'Quarterly', '-', '-'],
    ['Infrastructure Security', '-', '-', 'Quarterly', '-'],
    ['Governance Training', '-', '-', '-', 'Bi-annual']
  ];
  
  // Simple table rendering
  const colWidth = contentWidth / 5;
  trainingMatrix.forEach((row, rowIndex) => {
    if (yPos > pageHeight - margin - 20) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(TYPO.small);
    doc.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
    
    row.forEach((cell, colIndex) => {
      const x = margin + (colIndex * colWidth);
      doc.text(sanitizeText(cell), x, yPos);
    });
    
    yPos += TYPO.small * LINE_HEIGHT_FACTOR;
  });
  
  addSpace(10);
  
  addHeading('7.2 Tracking & Metrics', 2);
  addText('Training completion tracked in Learning Management System (LMS):');
  addBullet('Individual training completion rates');
  addBullet('Department-level compliance metrics');
  addBullet('Phishing simulation performance trends');
  addBullet('Time-to-completion for mandatory training');
  addSpace();
  
  addText('Monthly metrics dashboard includes:');
  addBullet('Overall training completion percentage (Target: 100%)');
  addBullet('Average phishing click rate (Target: <5%)');
  addBullet('Incident reporting rate (Target: >90% within 1 hour)');
  addBullet('Security policy acknowledgment rate (Target: 100%)');
  addSpace();
  
  addHeading('7.3 Consequences for Non-Compliance', 2);
  addText('Failure to complete required training results in:');
  addSpace();
  addBullet('1st reminder: Automated email notification');
  addBullet('2nd reminder: Manager notification after 7 days');
  addBullet('3rd reminder: HR notification after 14 days');
  addBullet('Final: System access suspension after 30 days until training complete');
  addSpace();
  addText('Repeated phishing simulation failures (5+):');
  addBullet('Mandatory additional training');
  addBullet('Performance improvement plan consideration');
  addBullet('Potential disciplinary action per HR policies');

  // 8. Resources & Support
  doc.addPage();
  yPos = margin;
  addHeading('8. Resources & Support', 1);
  addHorizontalLine();
  
  addHeading('8.1 Security Champions Program', 2);
  addText('Volunteer program for security advocates within each team:');
  addBullet('Quarterly Security Champion meetings and advanced training');
  addBullet('First point of contact for security questions in their team');
  addBullet('Assist in rolling out new security initiatives');
  addBullet('Recognized with Security Champion badge and LinkedIn certification');
  addSpace();
  
  addHeading('8.2 Internal Resources', 2);
  addText('Security Resources Library (Intranet):');
  addBullet('Security policies and procedures documentation');
  addBullet('Security awareness videos and training materials');
  addBullet('Incident response guides and contact information');
  addBullet('Monthly security newsletter archive');
  addBullet('Security tool tutorials (password managers, VPN, MFA)');
  addSpace();
  
  addHeading('8.3 External Resources', 2);
  addBullet('SANS Security Awareness: www.sans.org/security-awareness-training');
  addBullet('NIST Cybersecurity Framework: www.nist.gov/cyberframework');
  addBullet('OWASP (Open Web Application Security): www.owasp.org');
  addBullet('Have I Been Pwned (breach checking): haveibeenpwned.com');
  addSpace();
  
  addHeading('8.4 Getting Help', 2);
  addText('Security Questions & Support:');
  addBullet('Email: security@kumii.com (response within 4 hours)');
  addBullet('Slack: #ask-security (monitored during business hours)');
  addBullet('Security office hours: Tuesdays 2-4 PM, Thursdays 10 AM-12 PM');
  addSpace();
  addText('Anonymous Reporting:');
  addBullet('Security concerns hotline: +27 (0)11 XXX-XXXX');
  addBullet('Anonymous web form: https://kumii.com/security-report');
  addText('(All reports treated confidentially and without retaliation)');

  // 9. Certification & Continuous Improvement
  doc.addPage();
  yPos = margin;
  addHeading('9. Certification & Continuous Improvement', 1);
  addHorizontalLine();
  
  addHeading('9.1 Training Completion Certificates', 2);
  addText('Upon successful completion of training modules, employees receive:');
  addBullet('Digital certificate via email');
  addBullet('LinkedIn-shareable certification for annual refresher');
  addBullet('Physical certificate for specialized training programs');
  addBullet('Training record maintained in HR system');
  addSpace();
  
  addHeading('9.2 Annual Security Awareness Acknowledgment', 2);
  addText('All employees must sign an annual acknowledgment stating:');
  addBullet('I have read and understood the Kumii Security Policies');
  addBullet('I have completed all required security training');
  addBullet('I agree to follow security best practices and procedures');
  addBullet('I understand the consequences of security policy violations');
  addBullet('I will report security incidents and concerns promptly');
  addSpace();
  
  addHeading('9.3 Measuring Training Effectiveness', 2);
  addText('Program effectiveness measured through:');
  addBullet('Pre and post-training knowledge assessments');
  addBullet('Phishing simulation performance trends');
  addBullet('Real incident detection and reporting rates');
  addBullet('Security policy violation frequency');
  addBullet('Employee feedback surveys (conducted quarterly)');
  addSpace();
  
  addHeading('9.4 Annual Program Review & Updates', 2);
  addText('Security training program reviewed and updated annually based on:');
  addBullet('Emerging threat landscape and attack trends');
  addBullet('New regulatory requirements and compliance obligations');
  addBullet('Internal incident analysis and lessons learned');
  addBullet('Employee feedback and training effectiveness metrics');
  addBullet('Industry best practices and security framework updates');
  addSpace();
  addText('Next scheduled review: January 2026');
  addSpace(10);
  
  addHeading('Contact Information', 2);
  addText('Security Training Program Manager: Sarah Johnson');
  addText('Email: sarah.johnson@kumii.com');
  addText('Security Team: security@kumii.com');
  addText('Training Platform: https://learning.kumii.com');
  
  // Footer on last page
  yPos = pageHeight - margin;
  doc.setFontSize(TYPO.small);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Kumii Security Awareness Program | Generated ${new Date().toLocaleDateString()} | Confidential`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  doc.save('kumii-security-awareness-training.pdf');
};
