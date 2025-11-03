import jsPDF from 'jspdf';

export const generateVendorRiskPDF = () => {
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
  const successColor = { r: 76, g: 175, b: 80 }; // Green
  const warningColor = { r: 255, g: 152, b: 0 }; // Orange
  const dangerColor = { r: 244, g: 67, b: 54 }; // Red

  /**
   * Sanitize text to replace problematic characters
   */
  const sanitizeText = (text: string): string => {
    return text
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/–/g, '-')
      .replace(/—/g, '--')
      .replace(/→/g, '->')
      .replace(/•/g, '*')
      .replace(/✓/g, '[x]')
      .replace(/✅/g, '[x]')
      .replace(/❌/g, '[ ]')
      .replace(/⚠️/g, '[!]')
      .replace(/☐/g, '[ ]');
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
  const addBullet = (text: string, indent: number = 0, checked: boolean = false) => {
    const sanitized = sanitizeText(text);
    const bulletX = margin + indent;
    const textX = bulletX + 5;
    const availableWidth = maxWidth - indent - 5;
    
    checkPageBreak(15);
    
    // Draw checkbox or bullet
    if (checked) {
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(0.5);
      doc.rect(bulletX, yPos - 3, 3, 3);
      doc.setFillColor(76, 175, 80);
      doc.rect(bulletX + 0.5, yPos - 2.5, 2, 2, 'F');
    } else {
      doc.setFillColor(34, 107, 80);
      doc.circle(bulletX + 1, yPos - 1.5, 0.8, 'F');
    }
    
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

  const addTableRow = (values: string[], isAlternate: boolean = false, highlightColor?: { r: number, g: number, b: number }) => {
    checkPageBreak(20);
    
    const colWidth = maxWidth / values.length;
    
    if (highlightColor) {
      doc.setFillColor(highlightColor.r, highlightColor.g, highlightColor.b);
      doc.setGState(doc.GState({ opacity: 0.1 }));
      doc.rect(margin, yPos - 4, maxWidth, 8, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));
    } else if (isAlternate) {
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

  /**
   * Add vendor card with risk indicators
   */
  const addVendorCard = (
    name: string,
    tier: string,
    riskScore: number,
    details: { label: string, value: string, status?: 'success' | 'warning' | 'danger' }[]
  ) => {
    checkPageBreak(40);
    
    // Card background
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos, maxWidth, 35, 'F');
    
    // Header with risk indicator
    doc.setFontSize(TYPO.H3);
    doc.setFont(TYPO.FONT, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(name, margin + 3, yPos + 6);
    
    // Risk score badge
    const badgeColor = riskScore <= 2 ? successColor : riskScore <= 3 ? warningColor : dangerColor;
    doc.setFillColor(badgeColor.r, badgeColor.g, badgeColor.b);
    doc.roundedRect(pageWidth - margin - 25, yPos + 2, 22, 6, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont(TYPO.FONT, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Risk: ${riskScore.toFixed(1)}`, pageWidth - margin - 24, yPos + 6);
    
    // Tier badge
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.roundedRect(pageWidth - margin - 50, yPos + 2, 22, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(tier, pageWidth - margin - 49, yPos + 6);
    
    yPos += 12;
    
    // Details
    doc.setFontSize(TYPO.TABLE);
    doc.setFont(TYPO.FONT, 'normal');
    doc.setTextColor(80, 80, 80);
    
    details.forEach((detail, index) => {
      const xOffset = margin + 3 + (index * (maxWidth / details.length));
      doc.text(detail.label + ':', xOffset, yPos);
      doc.setFont(TYPO.FONT, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(detail.value, xOffset, yPos + 5);
      doc.setFont(TYPO.FONT, 'normal');
      doc.setTextColor(80, 80, 80);
    });
    
    yPos += 20;
  };

  // ===== COVER PAGE =====
  yPos = pageHeight / 3;
  
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, yPos - 30, pageWidth, 70, 'F');
  
  doc.setFontSize(28);
  doc.setFont(TYPO.FONT, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(0);
  doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
  doc.text('Vendor Risk Register', pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('Third-Party Assessment & DPA Tracking', pageWidth / 2, yPos + 12, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont(TYPO.FONT, 'normal');
  doc.text('Kumii Platform', pageWidth / 2, yPos + 28, { align: 'center' });
  
  yPos = pageHeight - 70;
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Document Version: 1.0', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Last Updated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('Owner: Chief Information Security Officer', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('Review Cycle: Quarterly', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('Classification: Confidential', pageWidth / 2, yPos, { align: 'center' });
  
  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== TABLE OF CONTENTS =====
  addHeading('Table of Contents', 1);
  yPos += 4;
  
  const tocItems = [
    { title: '1. Executive Summary', page: '3' },
    { title: '2. Vendor Classification', page: '4' },
    { title: '3. Tier 1 Vendors (Critical)', page: '5' },
    { title: '   3.1 Supabase', page: '5' },
    { title: '   3.2 Daily.co', page: '7' },
    { title: '   3.3 Sentry', page: '9' },
    { title: '4. Tier 2 Vendors (Important)', page: '11' },
    { title: '   4.1 OpenAI', page: '11' },
    { title: '   4.2 ElevenLabs', page: '13' },
    { title: '   4.3 Resend', page: '15' },
    { title: '5. Tier 3 Vendors (Standard)', page: '17' },
    { title: '6. Risk Summary & Compliance', page: '19' },
    { title: '7. DPA Tracking', page: '20' },
    { title: '8. Action Plan', page: '21' },
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

  // ===== 1. EXECUTIVE SUMMARY =====
  addHeading('1. Executive Summary', 1);
  
  addText(
    'This Vendor Risk Register documents all third-party vendors processing data for the Kumii platform. Each vendor is assessed for security, compliance, and business continuity risks. Data Processing Agreements (DPAs) are tracked and vendor performance is monitored.',
    TYPO.BODY
  );

  yPos += 3;
  addText('Key Metrics:', TYPO.BODY, true);
  
  addBullet('Total Vendors: 9 (7 active, 2 under evaluation)');
  addBullet('Critical Vendors: 3 (Supabase, Daily.co, Sentry)');
  addBullet('DPAs Signed: 3/7 (43% - Action Required)');
  addBullet('SOC 2 Certified: 5/7 (71%)');
  addBullet('Average Risk Score: 2.4 / 5.0 (Medium)');

  yPos += 5;
  addText('Critical Action Items:', TYPO.BODY, true, dangerColor);
  
  addBullet('Sign DPA with OpenAI (processes sensitive credit data)', 0, false);
  addBullet('Sign DPA with ElevenLabs and Resend', 0, false);
  addBullet('Request compliance documentation from Lovable', 0, false);
  addBullet('Complete Q1 2025 vendor security reviews', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 2. VENDOR CLASSIFICATION =====
  addHeading('2. Vendor Classification', 1);
  
  addTableHeader(['Tier', 'Criteria', 'Vendors', 'Assessment Frequency']);
  addTableRow(['Critical (Tier 1)', 'Platform cannot operate without them', '3', 'Quarterly'], false);
  addTableRow(['Important (Tier 2)', 'Significant features depend on them', '3', 'Bi-annually'], true);
  addTableRow(['Standard (Tier 3)', 'Nice-to-have, easily replaceable', '1', 'Annually'], false);

  yPos += 5;
  addText('Risk Scoring Methodology:', TYPO.BODY, true);
  addText('Each vendor is scored on five risk categories (1-5 scale, 1=lowest risk):');
  
  addBullet('Data Breach Risk: Likelihood and impact of data compromise');
  addBullet('Service Outage Risk: Impact if vendor becomes unavailable');
  addBullet('Vendor Lock-in Risk: Difficulty of switching providers');
  addBullet('Compliance Risk: Regulatory and legal compliance gaps');
  addBullet('Financial Stability Risk: Vendor business continuity concerns');

  yPos += 3;
  addText('Overall risk score is the average of all categories. Scores are interpreted as:', TYPO.BODY);
  
  addBullet('1.0 - 2.0: Low Risk (Green)');
  addBullet('2.1 - 3.0: Medium Risk (Yellow)');
  addBullet('3.1 - 4.0: High Risk (Orange)');
  addBullet('4.1 - 5.0: Critical Risk (Red)');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 3. TIER 1 VENDORS =====
  addHeading('3. Tier 1 Vendors (Critical)', 1);
  
  addHeading('3.1 Supabase (Database, Auth, Storage)', 2);
  
  addVendorCard('Supabase', 'Tier 1', 2.2, [
    { label: 'Service', value: 'BaaS' },
    { label: 'DPA', value: 'Signed', status: 'success' },
    { label: 'SOC 2', value: 'Yes', status: 'success' },
    { label: 'Region', value: 'EU' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://supabase.com');
  addBullet('Contract Type: Cloud subscription (Pay-as-you-go)');
  addBullet('Contract Period: January 2024 - Ongoing');
  addBullet('Primary Contact: support@supabase.com');

  yPos += 2;
  addText('Services Provided:', TYPO.BODY, true);
  addBullet('PostgreSQL database hosting');
  addBullet('Authentication (Supabase Auth)');
  addBullet('Storage buckets (file uploads)');
  addBullet('Edge Functions runtime (Deno)');
  addBullet('Real-time subscriptions');
  addBullet('Database backups and PITR');

  yPos += 2;
  addText('Data Processing:', TYPO.BODY, true);
  addBullet('Data Types: All platform data (PII, financial, business records)');
  addBullet('Data Location: EU region (Frankfurt)');
  addBullet('Data Volume: ~500GB database, ~2TB storage');
  addBullet('Sub-processors: AWS (infrastructure), Fly.io (edge functions)');

  yPos += 2;
  addText('Security & Compliance:', TYPO.BODY, true);
  addBullet('SOC 2 Type II: Certified (expires June 2025)', 0, true);
  addBullet('ISO 27001: Certified', 0, true);
  addBullet('GDPR Compliant: Yes (EU-based)', 0, true);
  addBullet('Encryption: TLS 1.3 (transit), AES-256 (at rest)', 0, true);
  addBullet('DPA Signed: Yes (Standard Supabase DPA)', 0, true);
  addBullet('SLA: 99.9% uptime guarantee', 0, true);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '2', 'SOC 2 certified, encryption, RLS policies'], false, successColor);
  addTableRow(['Service Outage', '3', 'Multi-region support available, PITR backups'], true, warningColor);
  addTableRow(['Vendor Lock-in', '3', 'Standard PostgreSQL, export capabilities'], false, warningColor);
  addTableRow(['Compliance', '1', 'EU-based, GDPR compliant'], true, successColor);
  addTableRow(['Financial Stability', '2', 'Well-funded ($116M Series B, 2023)'], false, successColor);

  yPos += 3;
  addText('Overall Risk Score: 2.2 / 5.0 (Low-Medium)', TYPO.BODY, true, successColor);

  yPos += 3;
  addText('Action Items:', TYPO.BODY, true);
  addBullet('DPA signed and filed', 0, true);
  addBullet('Configure multi-region replication for DR', 0, false);
  addBullet('Schedule quarterly security review', 0, false);
  addBullet('Document data export procedures', 0, false);

  yPos += 3;
  addText('Exit Strategy:', TYPO.BODY, true);
  addBullet('Data Export: pg_dump (standard SQL), storage API');
  addBullet('Timeline: 4-6 weeks for full migration');
  addBullet('Estimated Cost: $20k-$40k (dev time + infrastructure)');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 3.2 DAILY.CO =====
  addHeading('3.2 Daily.co (Video Infrastructure)', 2);
  
  addVendorCard('Daily.co', 'Tier 1', 2.2, [
    { label: 'Service', value: 'Video' },
    { label: 'DPA', value: 'Signed', status: 'success' },
    { label: 'SOC 2', value: 'Yes', status: 'success' },
    { label: 'Region', value: 'US' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://daily.co');
  addBullet('Contract Type: Enterprise subscription (annual)');
  addBullet('Contract Period: March 2024 - March 2025');
  addBullet('Account Manager: enterprise@daily.co');

  yPos += 2;
  addText('Services Provided:', TYPO.BODY, true);
  addBullet('Real-time video/audio calls');
  addBullet('Screen sharing');
  addBullet('Recording (optional)');
  addBullet('Video call analytics');

  yPos += 2;
  addText('Data Processing:', TYPO.BODY, true);
  addBullet('Data Types: Video/audio streams, participant metadata');
  addBullet('Data Location: US-based (global CDN)');
  addBullet('Data Volume: ~500 sessions/month, ~1000 hours');
  addBullet('Sub-processors: AWS, Cloudflare');

  yPos += 2;
  addText('Security & Compliance:', TYPO.BODY, true);
  addBullet('SOC 2 Type II: Certified', 0, true);
  addBullet('HIPAA Compliant: Yes (higher tier)', 0, true);
  addBullet('ISO 27001: Not certified', 0, false);
  addBullet('Encryption: DTLS-SRTP (video), TLS 1.3 (signaling)', 0, true);
  addBullet('DPA Signed: Yes (Custom enterprise DPA)', 0, true);
  addBullet('Data Retention: No recordings stored by default', 0, true);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '2', 'End-to-end encrypted video, no storage'], false, successColor);
  addTableRow(['Service Outage', '3', 'Alternative providers available (Zoom, Agora)'], true, warningColor);
  addTableRow(['Vendor Lock-in', '2', 'Standard WebRTC, easy to replace'], false, successColor);
  addTableRow(['Compliance', '2', 'US-based (GDPR consideration), DPA in place'], true, successColor);
  addTableRow(['Financial Stability', '2', 'Series B funded ($40M, 2021)'], false, successColor);

  yPos += 3;
  addText('Overall Risk Score: 2.2 / 5.0 (Low-Medium)', TYPO.BODY, true, successColor);

  yPos += 3;
  addText('Action Items:', TYPO.BODY, true);
  addBullet('DPA signed and filed', 0, true);
  addBullet('Annual security questionnaire review (due Q2 2025)', 0, false);
  addBullet('Test failover to Zoom API', 0, false);
  addBullet('Negotiate EU data residency option', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 3.3 SENTRY =====
  addHeading('3.3 Sentry (Error & Performance Monitoring)', 2);
  
  addVendorCard('Sentry', 'Tier 1', 2.0, [
    { label: 'Service', value: 'Monitoring' },
    { label: 'DPA', value: 'Signed', status: 'success' },
    { label: 'SOC 2', value: 'Yes', status: 'success' },
    { label: 'ISO 27001', value: 'Yes' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://sentry.io');
  addBullet('Contract Type: Team subscription (monthly)');
  addBullet('Contract Period: February 2024 - Ongoing');
  addBullet('Primary Contact: support@sentry.io');

  yPos += 2;
  addText('Services Provided:', TYPO.BODY, true);
  addBullet('Error tracking and reporting');
  addBullet('Performance monitoring');
  addBullet('Release tracking');
  addBullet('User session replay');
  addBullet('Alerting and notifications');

  yPos += 2;
  addText('Data Processing:', TYPO.BODY, true);
  addBullet('Data Types: Error logs, performance metrics, user sessions');
  addBullet('Data Location: US-based (EU option available)');
  addBullet('Data Volume: ~100k events/month');
  addBullet('Sub-processors: Google Cloud Platform');

  yPos += 2;
  addText('Security & Compliance:', TYPO.BODY, true);
  addBullet('SOC 2 Type II: Certified', 0, true);
  addBullet('ISO 27001: Certified', 0, true);
  addBullet('GDPR Compliant: Yes (EU option available)', 0, true);
  addBullet('DPA Signed: Yes (Standard Sentry DPA)', 0, true);
  addBullet('PII Scrubbing: Automatic (configured)', 0, true);
  addBullet('Data Retention: 90 days (configurable)', 0, true);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '2', 'PII scrubbing, limited sensitive data'], false, successColor);
  addTableRow(['Service Outage', '4', 'Non-critical for operations, fallback to logs'], true, warningColor);
  addTableRow(['Vendor Lock-in', '2', 'Alternative tools available (DataDog, LogRocket)'], false, successColor);
  addTableRow(['Compliance', '1', 'Strong compliance posture, EU option'], true, successColor);
  addTableRow(['Financial Stability', '1', 'Profitable, mature company'], false, successColor);

  yPos += 3;
  addText('Overall Risk Score: 2.0 / 5.0 (Low)', TYPO.BODY, true, successColor);

  yPos += 3;
  addText('Action Items:', TYPO.BODY, true);
  addBullet('DPA signed and filed', 0, true);
  addBullet('PII scrubbing configured', 0, true);
  addBullet('Consider EU data residency upgrade', 0, false);
  addBullet('Review data retention policy', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4. TIER 2 VENDORS =====
  addHeading('4. Tier 2 Vendors (Important)', 1);
  
  addHeading('4.1 OpenAI (AI Services)', 2);
  
  addVendorCard('OpenAI', 'Tier 2', 2.6, [
    { label: 'Service', value: 'AI/ML' },
    { label: 'DPA', value: 'NOT SIGNED', status: 'danger' },
    { label: 'SOC 2', value: 'Yes', status: 'success' },
    { label: 'Data', value: 'Sensitive' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://openai.com');
  addBullet('Contract Type: API usage (pay-per-token)');
  addBullet('Contract Period: April 2024 - Ongoing');
  addBullet('API Key Management: Stored in Supabase secrets');

  yPos += 2;
  addText('Services Provided:', TYPO.BODY, true);
  addBullet('Credit assessment analysis (GPT-4)');
  addBullet('Copilot chat assistance (GPT-4)');
  addBullet('Content generation');

  yPos += 2;
  addText('Data Processing:', TYPO.BODY, true);
  addBullet('Data Types: Credit assessment data, user messages');
  addBullet('Data Location: US-based');
  addBullet('Data Volume: ~50k tokens/day');
  addBullet('Sub-processors: Azure (OpenAI uses Microsoft Azure)');

  yPos += 2;
  addText('Security & Compliance:', TYPO.BODY, true);
  addBullet('SOC 2 Type II: Certified', 0, true);
  addBullet('ISO 27001: Not publicly disclosed', 0, false);
  addBullet('GDPR: Data Processing Terms available', 0, false);
  addBullet('DPA Signed: NO - URGENT ACTION REQUIRED', 0, false);
  addBullet('Data Retention: 30 days (per API policy)', 0, false);
  addBullet('Training Data: Not used for training (verify)', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '3', 'Sending sensitive credit data, DPA needed'], false, warningColor);
  addTableRow(['Service Outage', '3', 'Alternative models available (Claude, local)'], true, warningColor);
  addTableRow(['Vendor Lock-in', '3', 'Can switch to Anthropic Claude'], false, warningColor);
  addTableRow(['Compliance', '3', 'US-based, DPA not signed, data concerns'], true, warningColor);
  addTableRow(['Financial Stability', '1', 'Microsoft-backed, industry leader'], false, successColor);

  yPos += 3;
  addText('Overall Risk Score: 2.6 / 5.0 (Medium)', TYPO.BODY, true, warningColor);

  yPos += 3;
  addText('URGENT Action Items:', TYPO.BODY, true, dangerColor);
  addBullet('Sign DPA (Enterprise agreement or BAA)', 0, false);
  addBullet('Verify data not used for training', 0, false);
  addBullet('Evaluate data minimization (anonymize where possible)', 0, false);
  addBullet('Test Anthropic Claude as backup', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4.2 ELEVENLABS =====
  addHeading('4.2 ElevenLabs (Voice Synthesis)', 2);
  
  addVendorCard('ElevenLabs', 'Tier 2', 2.8, [
    { label: 'Service', value: 'Voice AI' },
    { label: 'DPA', value: 'NOT SIGNED', status: 'danger' },
    { label: 'SOC 2', value: 'No', status: 'danger' },
    { label: 'Data', value: 'Text only' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://elevenlabs.io');
  addBullet('Contract Type: API subscription (monthly)');
  addBullet('Contract Period: May 2024 - Ongoing');
  addBullet('Primary Contact: support@elevenlabs.io');

  yPos += 2;
  addText('Services Provided:', TYPO.BODY, true);
  addBullet('Text-to-speech for narration generation');
  addBullet('Voice synthesis for content');

  yPos += 2;
  addText('Data Processing:', TYPO.BODY, true);
  addBullet('Data Types: Text content for narration (non-sensitive)');
  addBullet('Data Location: US-based');
  addBullet('Data Volume: ~10k characters/day');

  yPos += 2;
  addText('Security & Compliance:', TYPO.BODY, true);
  addBullet('SOC 2: Not certified', 0, false);
  addBullet('ISO 27001: Not certified', 0, false);
  addBullet('DPA Signed: NO - ACTION REQUIRED', 0, false);
  addBullet('Data Retention: Not clearly documented', 0, false);

  yPos += 2;
  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '2', 'Only non-sensitive text processed'], false, successColor);
  addTableRow(['Service Outage', '4', 'Feature optional, alternatives available'], true, warningColor);
  addTableRow(['Vendor Lock-in', '2', 'Easy to replace with Google TTS, AWS Polly'], false, successColor);
  addTableRow(['Compliance', '3', 'Limited compliance documentation'], true, warningColor);
  addTableRow(['Financial Stability', '3', 'Early-stage startup ($80M Series B)'], false, warningColor);

  yPos += 3;
  addText('Overall Risk Score: 2.8 / 5.0 (Medium)', TYPO.BODY, true, warningColor);

  yPos += 3;
  addText('Action Items:', TYPO.BODY, true);
  addBullet('Request and sign DPA', 0, false);
  addBullet('Request SOC 2 roadmap', 0, false);
  addBullet('Evaluate if feature is essential', 0, false);
  addBullet('Consider switching to Google Cloud TTS', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4.3 RESEND =====
  addHeading('4.3 Resend (Email Delivery)', 2);
  
  addVendorCard('Resend', 'Tier 2', 2.4, [
    { label: 'Service', value: 'Email' },
    { label: 'DPA', value: 'NOT SIGNED', status: 'danger' },
    { label: 'SOC 2', value: 'In Progress', status: 'warning' },
    { label: 'Data', value: 'Email/PII' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://resend.com');
  addBullet('Contract Type: Usage-based (monthly)');
  addBullet('Contract Period: March 2024 - Ongoing');
  addBullet('Data Volume: ~5k emails/month');

  yPos += 2;
  addText('Security & Compliance:', TYPO.BODY, true);
  addBullet('SOC 2: In progress (per website)', 0, false);
  addBullet('ISO 27001: Not certified', 0, false);
  addBullet('DPA Signed: NO - ACTION REQUIRED', 0, false);
  addBullet('Encryption: TLS 1.3', 0, true);
  addBullet('Sub-processors: AWS SES', 0, true);

  yPos += 2;
  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '2', 'Limited PII (names, emails only)'], false, successColor);
  addTableRow(['Service Outage', '3', 'Can failover to SendGrid/SES'], true, warningColor);
  addTableRow(['Vendor Lock-in', '1', 'Standard SMTP, very easy to replace'], false, successColor);
  addTableRow(['Compliance', '3', 'Limited documentation, DPA needed'], true, warningColor);
  addTableRow(['Financial Stability', '3', 'Early-stage startup ($3M seed)'], false, warningColor);

  yPos += 3;
  addText('Overall Risk Score: 2.4 / 5.0 (Medium)', TYPO.BODY, true, warningColor);

  yPos += 3;
  addText('Action Items:', TYPO.BODY, true);
  addBullet('Request and sign DPA', 0, false);
  addBullet('Request SOC 2 timeline', 0, false);
  addBullet('Prepare failover to SendGrid', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 5. TIER 3 VENDORS =====
  addHeading('5. Tier 3 Vendors (Standard)', 1);
  
  addHeading('5.1 Lovable Platform (Hosting)', 2);
  
  addVendorCard('Lovable', 'Tier 3', 3.0, [
    { label: 'Service', value: 'Hosting' },
    { label: 'DPA', value: 'NOT SIGNED', status: 'danger' },
    { label: 'SOC 2', value: 'Unknown', status: 'danger' },
    { label: 'Data', value: 'Code only' }
  ]);

  addText('Vendor Information:', TYPO.BODY, true);
  addBullet('Website: https://lovable.dev');
  addBullet('Service Type: Platform hosting and deployment');
  addBullet('Contract Period: January 2024 - Ongoing');

  yPos += 2;
  addText('Services Provided:', TYPO.BODY, true);
  addBullet('Frontend hosting and CDN');
  addBullet('Build and deployment pipeline');
  addBullet('Development environment');

  yPos += 2;
  addText('Data Processing:', TYPO.BODY, true);
  addBullet('Data Types: Application code, build artifacts');
  addBullet('Data Volume: Source code repository');

  yPos += 2;
  addText('Risk Assessment:', TYPO.BODY, true);
  
  addTableHeader(['Risk Category', 'Score', 'Mitigation']);
  addTableRow(['Data Breach', '2', 'Only code and static assets'], false, successColor);
  addTableRow(['Service Outage', '3', 'Can redeploy to Vercel/Netlify'], true, warningColor);
  addTableRow(['Vendor Lock-in', '2', 'React app, easily portable'], false, successColor);
  addTableRow(['Compliance', '4', 'Limited documentation available'], true, dangerColor);
  addTableRow(['Financial Stability', '4', 'Unknown (new platform)'], false, dangerColor);

  yPos += 3;
  addText('Overall Risk Score: 3.0 / 5.0 (Medium)', TYPO.BODY, true, warningColor);

  yPos += 3;
  addText('Action Items:', TYPO.BODY, true);
  addBullet('Request compliance documentation', 0, false);
  addBullet('Request and sign DPA', 0, false);
  addBullet('Document redeployment to Vercel', 0, false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 6. RISK SUMMARY =====
  addHeading('6. Risk Summary & Compliance Status', 1);
  
  addText('Compliance Dashboard:', TYPO.BODY, true);
  
  addTableHeader(['Compliance Item', 'Status', 'Count', 'Percentage']);
  addTableRow(['DPAs Signed', 'Partial', '3/7', '43%'], false, warningColor);
  addTableRow(['SOC 2 Certified', 'Good', '5/7', '71%'], true, successColor);
  addTableRow(['ISO 27001 Certified', 'Needs Improvement', '2/7', '29%'], false, warningColor);
  addTableRow(['GDPR Compliant', 'Good', '5/7', '71%'], true, successColor);
  addTableRow(['EU Data Residency', 'Partial', '2/7', '29%'], false, warningColor);

  yPos += 5;
  addText('Risk Distribution:', TYPO.BODY, true);
  
  addTableHeader(['Risk Level', 'Vendors', 'Action Priority']);
  addTableRow(['Low (1.0-2.0)', '1 (Sentry)', 'Monitor'], false, successColor);
  addTableRow(['Low-Medium (2.1-3.0)', '5 vendors', 'Address gaps'], true, warningColor);
  addTableRow(['High (3.1-4.0)', '1 (Lovable)', 'Urgent action'], false, dangerColor);

  yPos += 5;
  addText('Top Risks Identified:', TYPO.BODY, true);
  
  addBullet('DPA Coverage: Only 43% of vendors have signed DPAs');
  addBullet('OpenAI DPA: Processing sensitive credit data without DPA');
  addBullet('Lovable Compliance: Limited documentation on new platform');
  addBullet('EU Data Residency: Most vendors US-based (GDPR concerns)');
  addBullet('Early-Stage Vendors: ElevenLabs, Resend lack certifications');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 7. DPA TRACKING =====
  addHeading('7. Data Processing Agreement (DPA) Tracking', 1);
  
  addText('DPA Status Overview:', TYPO.BODY);
  addText('DPAs are legally required under GDPR and POPIA when third parties process personal data on our behalf. All vendors processing user data must have signed DPAs in place.');

  yPos += 3;
  addTableHeader(['Vendor', 'DPA Status', 'Signed Date', 'Review Date', 'Priority']);
  addTableRow(['Supabase', 'Signed', '2024-01-20', '2025-01-20', 'P0'], false, successColor);
  addTableRow(['Daily.co', 'Signed', '2024-03-05', '2025-03-05', 'P0'], true, successColor);
  addTableRow(['Sentry', 'Signed', '2024-02-10', '2025-02-10', 'P0'], false, successColor);
  addTableRow(['OpenAI', 'NOT SIGNED', 'N/A', 'URGENT', 'P0'], true, dangerColor);
  addTableRow(['ElevenLabs', 'NOT SIGNED', 'N/A', 'Q1 2025', 'P1'], false, warningColor);
  addTableRow(['Resend', 'NOT SIGNED', 'N/A', 'Q1 2025', 'P1'], true, warningColor);
  addTableRow(['Lovable', 'NOT SIGNED', 'N/A', 'Q1 2025', 'P2'], false, warningColor);

  yPos += 5;
  addText('DPA Requirements Checklist:', TYPO.BODY, true);
  
  addBullet('Scope of processing activities clearly defined');
  addBullet('Duration of processing specified');
  addBullet('Nature and purpose of processing documented');
  addBullet('Types of personal data identified');
  addBullet('Categories of data subjects specified');
  addBullet('Processor obligations and restrictions defined');
  addBullet('Sub-processor requirements included');
  addBullet('Security measures documented');
  addBullet('Data breach notification procedures established');
  addBullet('Audit rights and compliance verification included');
  addBullet('Data deletion procedures on contract termination');
  addBullet('Cross-border transfer mechanisms (if applicable)');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 8. ACTION PLAN =====
  addHeading('8. Quarterly Action Plan', 1);
  
  addText('Q1 2025 Priority Actions:', TYPO.BODY, true);
  
  addTableHeader(['Action', 'Owner', 'Due Date', 'Priority']);
  addTableRow(['Sign DPA with OpenAI', 'CISO', '2025-01-31', 'P0'], false, dangerColor);
  addTableRow(['Sign DPA with ElevenLabs', 'CISO', '2025-02-15', 'P1'], true, warningColor);
  addTableRow(['Sign DPA with Resend', 'CISO', '2025-02-15', 'P1'], false, warningColor);
  addTableRow(['Request Lovable compliance docs', 'CISO', '2025-01-31', 'P1'], true, warningColor);
  addTableRow(['Quarterly vendor reviews', 'CISO', '2025-03-31', 'P1'], false, warningColor);
  addTableRow(['Test OpenAI alternatives', 'CTO', '2025-02-28', 'P2'], true);
  addTableRow(['Configure Supabase multi-region', 'DevOps', '2025-03-31', 'P2'], false);

  yPos += 5;
  addText('Ongoing Monitoring Requirements:', TYPO.BODY, true);
  
  addBullet('Monthly: Review vendor security incidents and updates');
  addBullet('Quarterly: Conduct vendor risk assessments (Tier 1)');
  addBullet('Bi-annually: Review and update DPAs, assess Tier 2 vendors');
  addBullet('Annually: Comprehensive vendor audit, assess Tier 3 vendors');
  addBullet('As needed: Evaluate new vendors before integration');

  yPos += 5;
  addText('Vendor Onboarding Checklist:', TYPO.BODY, true);
  
  addBullet('Security questionnaire completed', 0, false);
  addBullet('Compliance certifications verified (SOC 2, ISO 27001)', 0, false);
  addBullet('DPA negotiated and signed', 0, false);
  addBullet('Data processing impact assessment conducted', 0, false);
  addBullet('Integration security review completed', 0, false);
  addBullet('Exit strategy documented', 0, false);
  addBullet('Monitoring procedures established', 0, false);
  addBullet('Vendor added to risk register', 0, false);

  yPos += 5;
  addText('Escalation Procedures:', TYPO.BODY, true);
  addText('If vendor risk exceeds acceptable thresholds:');
  
  addBullet('Immediate: Notify CISO and CTO');
  addBullet('Within 24 hours: Risk assessment and impact analysis');
  addBullet('Within 48 hours: Mitigation plan or vendor replacement strategy');
  addBullet('Within 1 week: Implementation of mitigation measures');
  addBullet('Monthly: Review progress until risk reduced to acceptable level');

  yPos += 5;
  addText('Document Control:', TYPO.BODY, true);
  addBullet('Version: 1.0');
  addBullet('Last Updated: ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
  addBullet('Next Review: [Quarterly - 3 months from creation]');
  addBullet('Owner: Chief Information Security Officer');
  addBullet('Approver: Chief Technology Officer');

  addPageNumber();

  // Save the PDF
  doc.save('Kumii_Vendor_Risk_Register.pdf');
};
