import jsPDF from 'jspdf';

export const generateDisasterRecoveryPDF = () => {
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
  const warningColor = { r: 255, g: 152, b: 0 }; // Orange
  const criticalColor = { r: 244, g: 67, b: 54 }; // Red

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

  const addTableRow = (values: string[], isAlternate: boolean = false, priorityColor?: { r: number, g: number, b: number }) => {
    checkPageBreak(20);
    
    const colWidth = maxWidth / values.length;
    
    if (priorityColor) {
      doc.setFillColor(priorityColor.r, priorityColor.g, priorityColor.b);
      doc.rect(margin, yPos - 4, maxWidth, 8, 'F');
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
    doc.setFont(TYPO.FONT, priorityColor ? 'bold' : 'normal');
    doc.setTextColor(priorityColor ? 255 : 0, priorityColor ? 255 : 0, priorityColor ? 255 : 0);
    doc.setCharSpace(0);
    doc.setLineHeightFactor(LINE_HEIGHT_FACTOR);
    
    values.forEach((value, i) => {
      const sanitized = sanitizeText(value);
      const cellText = doc.splitTextToSize(sanitized, colWidth - 4);
      doc.text(cellText, margin + (i * colWidth) + 2, yPos);
    });
    
    yPos += 8;
    doc.setTextColor(0, 0, 0);
  };

  /**
   * Add code block
   */
  const addCodeBlock = (code: string) => {
    checkPageBreak(30);
    
    doc.setFillColor(245, 245, 245);
    const codeLines = code.split('\n');
    const blockHeight = codeLines.length * 5 + 4;
    
    doc.rect(margin, yPos - 2, maxWidth, blockHeight, 'F');
    
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.setTextColor(60, 60, 60);
    
    codeLines.forEach((line) => {
      checkPageBreak(6);
      doc.text(sanitizeText(line), margin + 2, yPos);
      yPos += 5;
    });
    
    yPos += 4;
    doc.setFont(TYPO.FONT, 'normal');
    doc.setTextColor(0, 0, 0);
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
  doc.text('Disaster Recovery Plan', pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('Business Continuity & Recovery', pageWidth / 2, yPos + 12, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont(TYPO.FONT, 'normal');
  doc.text('Kumii Platform', pageWidth / 2, yPos + 28, { align: 'center' });
  
  yPos = pageHeight - 70;
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  addText('Document Version: 1.0', 11, true, { r: 255, g: 255, b: 255 });
  doc.text(`Last Updated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('Owner: Chief Technology Officer', pageWidth / 2, yPos, { align: 'center' });
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
    { title: '2. Recovery Objectives', page: '4' },
    { title: '3. Disaster Scenarios', page: '5' },
    { title: '4. Recovery Procedures', page: '6' },
    { title: '   4.1 Regional Cloud Outage', page: '6' },
    { title: '   4.2 Database Corruption', page: '8' },
    { title: '   4.3 Ransomware/Cyberattack', page: '10' },
    { title: '   4.4 Accidental Data Deletion', page: '12' },
    { title: '   4.5 Edge Function Failure', page: '14' },
    { title: '5. Contact Information', page: '16' },
    { title: '6. Testing & Maintenance', page: '17' },
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
    'This Disaster Recovery Plan (DRP) outlines procedures to restore the Kumii platform following a disruption. The plan defines Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for critical systems, assigns responsibilities, and provides step-by-step recovery procedures.',
    TYPO.BODY
  );

  yPos += 3;
  addText('Key Metrics:', TYPO.BODY, true);
  
  addBullet('Primary RTO: 4 hours (for P0/P1 services)');
  addBullet('Primary RPO: 15 minutes (for critical data)');
  addBullet('Maximum Tolerable Downtime: 24 hours');
  addBullet('Testing Frequency: Quarterly');
  addBullet('Last Full Test: [To be scheduled]');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 2. RECOVERY OBJECTIVES =====
  addHeading('2. Recovery Objectives', 1);
  
  addHeading('2.1 Service Priority Matrix', 2);
  
  addTableHeader(['Service', 'Priority', 'RTO', 'RPO', 'Business Impact']);
  addTableRow(['Authentication', 'P0', '1 hour', '0 (live)', 'Complete platform inaccessible'], false, criticalColor);
  addTableRow(['Database (Core)', 'P0', '1 hour', '15 min', 'All services impacted'], true, criticalColor);
  addTableRow(['Mentorship Sessions', 'P1', '4 hours', '15 min', 'Revenue loss, user dissatisfaction'], false, warningColor);
  addTableRow(['Credit Assessments', 'P1', '8 hours', '1 hour', 'Business operations disrupted'], true, warningColor);
  addTableRow(['Messaging', 'P1', '4 hours', '15 min', 'User communication breakdown'], false, warningColor);
  addTableRow(['Marketplace Listings', 'P2', '24 hours', '4 hours', 'Service discovery impacted'], true);
  addTableRow(['File Storage', 'P2', '24 hours', '1 hour', 'Document access disrupted'], false);
  addTableRow(['Analytics/Reporting', 'P3', '72 hours', '24 hours', 'Minimal immediate impact'], true);

  yPos += 5;
  addHeading('2.2 RTO/RPO Definitions', 2);
  
  addText('Recovery Time Objective (RTO):', TYPO.BODY, true);
  addText('Maximum acceptable time to restore a service after disruption. This defines how quickly we need to get back online to avoid unacceptable business impact.');
  
  yPos += 2;
  addText('Recovery Point Objective (RPO):', TYPO.BODY, true);
  addText('Maximum acceptable data loss measured in time. This defines how much data we can afford to lose during a disaster (e.g., 15 minutes = we can lose up to 15 minutes of recent data).');
  
  yPos += 2;
  addText('Maximum Tolerable Downtime (MTD):', TYPO.BODY, true);
  addText('Point at which business cannot continue operations. Beyond this threshold, the business faces existential risk.');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 3. DISASTER SCENARIOS =====
  addHeading('3. Disaster Scenarios', 1);
  
  addHeading('3.1 Scenario Classification', 2);
  
  addTableHeader(['Scenario', 'Likelihood', 'Impact', 'Priority']);
  addTableRow(['Regional Cloud Outage', 'Low', 'Critical', 'P0'], false, criticalColor);
  addTableRow(['Database Corruption', 'Medium', 'High', 'P0'], true, criticalColor);
  addTableRow(['Ransomware/Cyberattack', 'Medium', 'Critical', 'P0'], false, criticalColor);
  addTableRow(['Accidental Data Deletion', 'High', 'Medium', 'P1'], true, warningColor);
  addTableRow(['Edge Function Failure', 'Medium', 'Medium', 'P1'], false, warningColor);
  addTableRow(['Storage Bucket Compromise', 'Low', 'Medium', 'P2'], true);
  addTableRow(['Third-Party API Outage', 'High', 'Low-Med', 'P2-P3'], false);
  addTableRow(['Human Error (Code Deploy)', 'High', 'Low-High', 'P1-P2'], true, warningColor);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4. RECOVERY PROCEDURES =====
  addHeading('4. Recovery Procedures', 1);
  
  addHeading('4.1 Scenario: Regional Cloud Outage (Supabase)', 2);
  
  addText('Detection:', TYPO.BODY, true);
  addBullet('Health check monitoring fails');
  addBullet('Users report inability to access platform');
  addBullet('Supabase status page indicates outage');

  yPos += 3;
  addText('Immediate Response (0-15 minutes):', TYPO.BODY, true);
  
  addText('1. Verify Outage:', TYPO.BODY, true);
  addCodeBlock('# Check Supabase status\ncurl https://status.supabase.com/api/v2/status.json\n\n# Verify database connectivity\npsql $DATABASE_URL -c "SELECT 1;"');

  addText('2. Activate Incident Response:', TYPO.BODY, true);
  addBullet('Notify Incident Commander (CTO)');
  addBullet('Alert stakeholders (CEO, CISO, DevOps Lead)');
  addBullet('Post status update to users (status page/social media)');

  addText('3. Assess Scope:', TYPO.BODY, true);
  addBullet('Which regions are affected?');
  addBullet('Is it partial or complete outage?');
  addBullet('Estimated resolution time from Supabase?');

  yPos += 3;
  addText('Recovery Steps (15 minutes - 2 hours):', TYPO.BODY, true);
  
  addText('Option A: Wait for Supabase Recovery (Preferred)', TYPO.BODY, true);
  addBullet('If Supabase ETA < 2 hours, monitor and communicate');
  addBullet('Continue status updates every 30 minutes');

  yPos += 2;
  addText('Option B: Failover to Secondary Region (If configured)', TYPO.BODY, true);
  
  addText('1. Update DNS:', TYPO.BODY, true);
  addCodeBlock('# Point domain to secondary Supabase project\n# Update CNAME records in DNS provider');

  addText('2. Verify Data Replication:', TYPO.BODY, true);
  addCodeBlock('# Check replication lag\npsql $SECONDARY_DATABASE_URL -c "\n  SELECT now() - pg_last_xact_replay_timestamp() AS lag;\n"');

  addText('3. Update Environment Variables:', TYPO.BODY, true);
  addCodeBlock('# Update all edge functions and frontend\nSUPABASE_URL=<secondary_url>\nSUPABASE_ANON_KEY=<secondary_key>');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addText('4. Redeploy Frontend:', TYPO.BODY, true);
  addCodeBlock('# Update production build\ngit checkout main\ngit pull\n# Deploy via Lovable platform');

  yPos += 2;
  addText('Option C: Restore to New Supabase Project (Last Resort)', TYPO.BODY, true);
  
  addText('1. Create New Supabase Project:', TYPO.BODY, true);
  addBullet('Go to https://supabase.com/dashboard');
  addBullet('Create new project in different region');

  addText('2. Restore Database from Backup:', TYPO.BODY, true);
  addCodeBlock('# Download latest backup from Supabase\nsupabase db dump --db-url $OLD_DATABASE_URL > backup.sql\n\n# Restore to new project\npsql $NEW_DATABASE_URL < backup.sql');

  addText('3. Migrate Storage Buckets:', TYPO.BODY, true);
  addCodeBlock('# Script to copy all storage objects\n# (Implement migration script)');

  addText('4. Update All Configurations:', TYPO.BODY, true);
  addBullet('Environment variables');
  addBullet('DNS records');
  addBullet('API keys');

  yPos += 3;
  addText('Validation (30 minutes):', TYPO.BODY, true);
  addCodeBlock('# Health checks\ncurl https://yourplatform.com/health\n\n# Test authentication\n# Test database reads/writes\n# Test edge functions\n# Test storage access');

  yPos += 2;
  addText('Post-Recovery:', TYPO.BODY, true);
  addBullet('Conduct incident retrospective within 48 hours');
  addBullet('Document lessons learned');
  addBullet('Update DRP with improvements');
  addBullet('Test failover procedures');

  yPos += 3;
  addText('RTO Achievement: 2-4 hours', TYPO.BODY, true, primaryColor);
  addText('RPO Achievement: 15 minutes (PITR)', TYPO.BODY, true, primaryColor);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4.2 DATABASE CORRUPTION =====
  addHeading('4.2 Scenario: Database Corruption', 2);
  
  addText('Detection:', TYPO.BODY, true);
  addBullet('Database errors in logs');
  addBullet('Data integrity check failures');
  addBullet('User reports of missing/incorrect data');

  yPos += 3;
  addText('Immediate Response (0-15 minutes):', TYPO.BODY, true);
  
  addText('1. Isolate Issue:', TYPO.BODY, true);
  addCodeBlock('-- Check for corruption\nSELECT pg_database.datname, pg_database_size(pg_database.datname)\nFROM pg_database;\n\n-- Check table integrity\nSELECT schemaname, tablename, pg_relation_size(schemaname||\'.\'||tablename)\nFROM pg_tables\nWHERE schemaname = \'public\';');

  addText('2. Stop All Writes:', TYPO.BODY, true);
  addCodeBlock('-- Revoke write permissions temporarily\nREVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;');

  addText('3. Take Snapshot:', TYPO.BODY, true);
  addCodeBlock('# Immediate backup before any recovery attempts\npg_dump $DATABASE_URL > corruption_snapshot_$(date +%Y%m%d_%H%M%S).sql');

  yPos += 3;
  addText('Recovery Steps (15 minutes - 4 hours):', TYPO.BODY, true);
  
  addText('Option A: Point-in-Time Recovery (Preferred)', TYPO.BODY, true);
  
  addText('1. Identify Last Known Good Time:', TYPO.BODY, true);
  addCodeBlock('-- Review audit logs\nSELECT * FROM audit_logs\nWHERE timestamp < now() - interval \'1 hour\'\nORDER BY timestamp DESC\nLIMIT 100;');

  addText('2. Restore via Supabase Dashboard:', TYPO.BODY, true);
  addBullet('Go to Database → Backups');
  addBullet('Select PITR (Point-in-Time Recovery)');
  addBullet('Choose timestamp before corruption');
  addBullet('Initiate restore (creates new database)');

  addText('3. Validate Restored Data:', TYPO.BODY, true);
  addCodeBlock('-- Check critical tables\nSELECT count(*) FROM profiles;\nSELECT count(*) FROM credit_assessments;\nSELECT max(created_at) FROM profiles;');

  yPos += 2;
  addText('Option B: Restore from Daily Backup', TYPO.BODY, true);
  
  addText('1. Download Backup:', TYPO.BODY, true);
  addBullet('Supabase Dashboard → Database → Backups');
  addBullet('Select most recent daily backup');

  addText('2. Create New Database:', TYPO.BODY, true);
  addCodeBlock('createdb recovery_db');

  addText('3. Restore Backup:', TYPO.BODY, true);
  addCodeBlock('psql recovery_db < backup_file.sql');

  addText('4. Merge Recent Data (Manual):', TYPO.BODY, true);
  addBullet('Export data created after backup timestamp');
  addBullet('Manual merge into restored database');
  addBullet('Validate with stakeholders');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  yPos += 3;
  addText('Validation:', TYPO.BODY, true);
  addCodeBlock('-- Data integrity checks\nSELECT \n  \'profiles\' as table_name,\n  count(*) as row_count,\n  max(created_at) as latest_record\nFROM profiles\nUNION ALL\nSELECT \n  \'credit_assessments\',\n  count(*),\n  max(created_at)\nFROM credit_assessments;\n\n-- Check for orphaned records\nSELECT * FROM messages \nWHERE conversation_id NOT IN (SELECT id FROM conversations);');

  yPos += 2;
  addText('Post-Recovery:', TYPO.BODY, true);
  addBullet('Root cause analysis (corrupted migration? hardware failure?)');
  addBullet('Restore write permissions');
  addBullet('Monitor database health for 48 hours');
  addBullet('Update backup/monitoring procedures');

  yPos += 3;
  addText('RTO Achievement: 4 hours', TYPO.BODY, true, primaryColor);
  addText('RPO Achievement: 1 hour (depending on backup)', TYPO.BODY, true, primaryColor);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4.3 RANSOMWARE/CYBERATTACK =====
  addHeading('4.3 Scenario: Ransomware/Cyberattack', 2);
  
  addText('Detection:', TYPO.BODY, true);
  addBullet('Unusual encryption activity');
  addBullet('Mass file deletions');
  addBullet('Ransom demand notice');
  addBullet('Security monitoring alerts');

  yPos += 3;
  addText('Immediate Response (0-5 minutes - CRITICAL):', TYPO.BODY, true, criticalColor);
  
  addText('1. ISOLATE IMMEDIATELY:', TYPO.BODY, true, criticalColor);
  addCodeBlock('# Disconnect affected systems\n# Revoke all API keys\nsupabase secrets unset --all\n\n# Disable authentication temporarily\n# (via Supabase Dashboard -> Authentication -> Settings)');

  addText('2. Activate Incident Response Team:', TYPO.BODY, true);
  addBullet('CTO (Incident Commander)');
  addBullet('CISO (Security Lead)');
  addBullet('Legal Counsel');
  addBullet('External Security Consultant (if needed)');

  addText('3. Preserve Evidence:', TYPO.BODY, true);
  addBullet('Do NOT modify affected systems');
  addBullet('Capture memory dumps');
  addBullet('Save all logs');
  addBullet('Document timeline');

  yPos += 3;
  addText('Assessment (5-30 minutes):', TYPO.BODY, true);
  
  addText('1. Determine Scope:', TYPO.BODY, true);
  addBullet('Which systems are compromised?');
  addBullet('When did breach occur?');
  addBullet('What data was accessed/encrypted?');
  addBullet('Is ransomware still active?');

  addText('2. Identify Attack Vector:', TYPO.BODY, true);
  addBullet('Review access logs');
  addBullet('Check for unauthorized accounts');
  addBullet('Analyze malware (if safe)');

  yPos += 3;
  addText('Recovery Steps (1-24 hours):', TYPO.BODY, true);
  
  addText('DO NOT PAY RANSOM', TYPO.H3, true, criticalColor);

  yPos += 2;
  addText('1. Eradicate Threat:', TYPO.BODY, true);
  addBullet('Identify and remove malware');
  addBullet('Close attack vector (patch vulnerability)');
  addBullet('Reset ALL credentials');
  addBullet('Rotate ALL API keys');
  addBullet('Change ALL passwords');

  addText('2. Restore from Clean Backups:', TYPO.BODY, true);
  addCodeBlock('# Use backup from BEFORE infection date\n# Verify backup is clean (scan for malware)\n\n# Restore database\npsql $NEW_DATABASE_URL < clean_backup.sql\n\n# Restore storage (from immutable backups)\n# Use Supabase backup system');

  addText('3. Rebuild Compromised Systems:', TYPO.BODY, true);
  addBullet('Fresh Supabase project (if needed)');
  addBullet('Redeploy all edge functions from version control');
  addBullet('Redeploy frontend from clean build');

  addPageNumber();
  doc.addPage();
  yPos = margin;

  addText('4. Strengthen Security:', TYPO.BODY, true);
  addCodeBlock('-- Enable MFA for all admin accounts\n-- Implement stricter RLS policies\n-- Add additional monitoring');

  yPos += 3;
  addText('Validation:', TYPO.BODY, true);
  addBullet('Full security scan');
  addBullet('Penetration testing');
  addBullet('Third-party security audit');
  addBullet('Monitor for 7 days before declaring "all clear"');

  yPos += 2;
  addText('Communication:', TYPO.BODY, true);
  addBullet('Internal: Immediate notification to all staff');
  addBullet('Users: Within 24 hours if data compromised');
  addBullet('Regulatory: Within 72 hours (POPIA/GDPR)');
  addBullet('Law Enforcement: Report cybercrime');

  yPos += 2;
  addText('Post-Incident:', TYPO.BODY, true);
  addBullet('Full forensic analysis');
  addBullet('Implement additional security controls');
  addBullet('Update incident response procedures');
  addBullet('Consider cyber insurance claim');

  yPos += 3;
  addText('RTO Achievement: 8-24 hours', TYPO.BODY, true, primaryColor);
  addText('RPO Achievement: Varies (depends on last clean backup)', TYPO.BODY, true, primaryColor);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4.4 ACCIDENTAL DATA DELETION =====
  addHeading('4.4 Scenario: Accidental Data Deletion', 2);
  
  addText('Detection:', TYPO.BODY, true);
  addBullet('User reports missing data');
  addBullet('Admin notices deletion in logs');
  addBullet('Audit logs show unexpected DELETE operations');

  yPos += 3;
  addText('Immediate Response (0-10 minutes):', TYPO.BODY, true);
  
  addText('1. Verify Deletion:', TYPO.BODY, true);
  addCodeBlock('-- Check audit logs\nSELECT * FROM audit_logs\nWHERE action = \'DELETE\'\n  AND timestamp > now() - interval \'1 hour\'\nORDER BY timestamp DESC;');

  addText('2. Stop Further Deletions:', TYPO.BODY, true);
  addCodeBlock('-- Temporarily revoke delete permissions\nREVOKE DELETE ON affected_table FROM authenticated;');

  yPos += 3;
  addText('Recovery Steps (10 minutes - 2 hours):', TYPO.BODY, true);
  
  addText('Option A: Restore from PITR (If within 7 days)', TYPO.BODY, true);
  
  addText('1. Identify Deletion Time:', TYPO.BODY, true);
  addBullet('Check audit logs for exact timestamp');

  addText('2. Export Deleted Records:', TYPO.BODY, true);
  addCodeBlock('# Create temporary recovery database with PITR\n# Query deleted records\npsql $PITR_DATABASE_URL -c "\n  SELECT * FROM profiles WHERE id IN (<deleted_ids>);\n" > deleted_records.sql');

  addText('3. Restore to Production:', TYPO.BODY, true);
  addCodeBlock('-- Insert deleted records back\nINSERT INTO profiles SELECT * FROM deleted_records;');

  yPos += 2;
  addText('Option B: Restore from Backup (If older than 7 days)', TYPO.BODY, true);
  addBullet('Use daily backup closest to deletion');
  addBullet('Extract deleted records manually');
  addBullet('Merge with current database');

  yPos += 3;
  addText('Validation:', TYPO.BODY, true);
  addCodeBlock('-- Verify restored records\nSELECT count(*) FROM profiles WHERE id IN (<deleted_ids>);\n\n-- Check related records (foreign keys)\nSELECT * FROM startup_profiles WHERE user_id IN (<deleted_ids>);');

  yPos += 2;
  addText('Prevention:', TYPO.BODY, true);
  addBullet('Implement soft deletes (deleted_at column)');
  addBullet('Require admin approval for bulk deletions');
  addBullet('Add confirmation dialogs in UI');
  addBullet('Implement delete throttling');

  yPos += 3;
  addText('RTO Achievement: 1-2 hours', TYPO.BODY, true, primaryColor);
  addText('RPO Achievement: 0-15 minutes', TYPO.BODY, true, primaryColor);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 4.5 EDGE FUNCTION FAILURE =====
  addHeading('4.5 Scenario: Edge Function Failure', 2);
  
  addText('Detection:', TYPO.BODY, true);
  addBullet('Sentry alerts for function errors');
  addBullet('Users report feature unavailable');
  addBullet('Health checks failing');

  yPos += 3;
  addText('Immediate Response (0-15 minutes):', TYPO.BODY, true);
  
  addText('1. Check Logs:', TYPO.BODY, true);
  addCodeBlock('# View edge function logs\nsupabase functions logs <function-name> --limit 100');

  addText('2. Identify Issue:', TYPO.BODY, true);
  addBullet('Code error?');
  addBullet('API dependency down (OpenAI, ElevenLabs)?');
  addBullet('Rate limit exceeded?');
  addBullet('Configuration issue?');

  yPos += 3;
  addText('Recovery Steps (15 minutes - 1 hour):', TYPO.BODY, true);
  
  addText('Option A: Rollback to Previous Version', TYPO.BODY, true);
  addCodeBlock('# Redeploy last working version\ngit log --oneline supabase/functions/<function-name>/\ngit checkout <previous-commit>\nsupabase functions deploy <function-name>\n\n# Verify\ncurl -X POST https://<project>.supabase.co/functions/v1/<function-name> \\\n  -H "Authorization: Bearer $ANON_KEY" \\\n  -d \'{"test": true}\'');

  yPos += 2;
  addText('Option B: Quick Fix & Deploy', TYPO.BODY, true);
  addCodeBlock('# Fix code\nvim supabase/functions/<function-name>/index.ts\n\n# Test locally (if possible)\n# Deploy\nsupabase functions deploy <function-name>');

  yPos += 2;
  addText('Option C: Disable Function Temporarily', TYPO.BODY, true);
  addBullet('If function is non-critical');
  addBullet('Remove from UI to prevent errors');
  addBullet('Show maintenance message');

  yPos += 3;
  addText('Validation:', TYPO.BODY, true);
  addCodeBlock('# Test function end-to-end\n# Check error logs\n# Monitor for 30 minutes');

  yPos += 3;
  addText('RTO Achievement: 30 minutes - 1 hour', TYPO.BODY, true, primaryColor);
  addText('RPO Achievement: Not applicable', TYPO.BODY, true, primaryColor);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 5. CONTACT INFORMATION =====
  addHeading('5. Contact Information', 1);
  
  addText('Emergency Contacts (24/7 Availability):', TYPO.BODY, true);
  
  addTableHeader(['Role', 'Name', 'Primary Contact', 'Backup Contact']);
  addTableRow(['Incident Commander', 'CTO', '[Phone]', '[Email]'], false);
  addTableRow(['Security Lead', 'CISO', '[Phone]', '[Email]'], true);
  addTableRow(['DevOps Lead', '[Name]', '[Phone]', '[Email]'], false);
  addTableRow(['Database Admin', '[Name]', '[Phone]', '[Email]'], true);
  addTableRow(['CEO', '[Name]', '[Phone]', '[Email]'], false);

  yPos += 5;
  addText('External Contacts:', TYPO.BODY, true);
  
  addTableHeader(['Service', 'Contact', 'Priority']);
  addTableRow(['Supabase Support', 'support@supabase.com', 'P0'], false);
  addTableRow(['Lovable Support', 'support@lovable.dev', 'P1'], true);
  addTableRow(['Security Consultant', '[Email/Phone]', 'P0'], false);
  addTableRow(['Legal Counsel', '[Email/Phone]', 'P1'], true);
  addTableRow(['Cyber Insurance', '[Policy #/Phone]', 'P2'], false);

  addPageNumber();
  doc.addPage();
  yPos = margin;

  // ===== 6. TESTING & MAINTENANCE =====
  addHeading('6. Testing & Maintenance', 1);
  
  addHeading('6.1 Testing Schedule', 2);
  
  addTableHeader(['Test Type', 'Frequency', 'Scope', 'Duration']);
  addTableRow(['Backup Verification', 'Weekly', 'Random backup restore', '30 min'], false);
  addTableRow(['PITR Test', 'Monthly', 'Point-in-time recovery test', '1 hour'], true);
  addTableRow(['Failover Drill', 'Quarterly', 'Full region failover', '4 hours'], false);
  addTableRow(['Full DR Exercise', 'Annually', 'Complete disaster simulation', '8 hours'], true);

  yPos += 5;
  addHeading('6.2 Plan Maintenance', 2);
  
  addText('This DRP should be reviewed and updated:', TYPO.BODY);
  
  addBullet('After every disaster recovery event (within 48 hours)');
  addBullet('After significant infrastructure changes');
  addBullet('Quarterly review of contact information');
  addBullet('Annual comprehensive review');
  addBullet('When new services are added to the platform');

  yPos += 3;
  addHeading('6.3 Training Requirements', 2);
  
  addBullet('All technical staff must be familiar with DRP procedures');
  addBullet('Key personnel must participate in quarterly drills');
  addBullet('New team members receive DRP training within 30 days');
  addBullet('Annual refresher training for all staff');

  yPos += 5;
  addText('Document Control:', TYPO.BODY, true);
  addBullet('Version: 1.0');
  addBullet('Last Updated: ' + new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
  addBullet('Next Review: [3 months from creation]');
  addBullet('Owner: Chief Technology Officer');
  addBullet('Approver: Chief Executive Officer');

  addPageNumber();

  // Save the PDF
  doc.save('Kumii_Disaster_Recovery_Plan.pdf');
};
