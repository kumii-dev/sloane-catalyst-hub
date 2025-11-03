import jsPDF from 'jspdf';

// Typography constants for consistency
const TYPO = {
  title: 24,
  subtitle: 16,
  heading1: 18,
  heading2: 14,
  heading3: 11,
  body: 10,
  small: 8,
  code: 9
};

const LINE_HEIGHT_FACTOR = 1.2; // Reduced from 1.5 for tighter spacing

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
    yPos += level === 1 ? 6 : level === 2 ? 4 : 3;
    addText(text, fontSize, true);
    yPos += level === 1 ? 2 : 1;
  };

  const addSpace = (amount: number = 3) => {
    yPos += amount;
  };
  
  const addParagraph = (text: string) => {
    addText(text, TYPO.body, false);
    yPos += 2;
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
  
  addHeading('1.1 Purpose & Business Justification', 2);
  addParagraph('Security breaches cost African businesses an average of R50 million annually, with 60% of SMEs closing within 6 months of a major cyber incident. This Security Awareness & Training Program is not merely a compliance checkbox—it\'s a business imperative designed to transform every Kumii employee into an active defender of our platform, customer data, and competitive advantage.');
  addParagraph('Research shows that 95% of cybersecurity breaches involve human error. By investing R150 per employee annually in comprehensive security training, we prevent potential losses exceeding R5 million from data breaches, regulatory fines (up to 4% of annual turnover under GDPR), and reputational damage that could cost us 30% of our customer base.');
  
  addHeading('1.2 Scope & Mandatory Participation', 2);
  addText('Security is everyone\'s responsibility. This program mandates participation from:', TYPO.body, true);
  addBullet('All full-time and part-time employees: Complete onboarding training within 24 hours of receiving system credentials. Annual refresher training due 365 days from hire date. Non-completion results in account suspension.');
  addBullet('Contractors and temporary workers: Same requirements as employees if accessing production systems, customer data, or internal networks for more than 7 consecutive days.');
  addBullet('Third-party vendors with privileged access: Must provide evidence of equivalent training or complete our Vendor Security Training module (2 hours) before access is granted.');
  addBullet('Executive leadership and board members: Quarterly executive briefings on threat landscape and governance training annually. Phishing simulations increased to weekly due to higher targeting risk.');
  
  addHeading('1.3 Measurable Objectives & Success Metrics', 2);
  addText('By December 2025, this program will achieve:', TYPO.body, true);
  addBullet('Threat Recognition: 95% of employees will correctly identify phishing attempts in monthly simulations (currently 72%). This includes recognizing spoofed sender addresses, suspicious URLs, urgency-based social engineering, and attachment-based attacks.');
  addBullet('Authentication Security: 100% MFA adoption across all company accounts (currently 87%). Zero instances of password sharing or sticky-note passwords. Password manager usage at 100% (currently 65%).');
  addBullet('Data Handling Compliance: Zero POPIA/GDPR violations related to employee negligence (currently 3 incidents per year). All employees demonstrate ability to classify data correctly in quarterly assessments.');
  addBullet('Incident Response Speed: Mean time to report security incidents reduced from 4.3 hours to under 30 minutes. 100% of employees know how to contact the security team.');
  addBullet('Cultural Transformation: Security awareness scores (measured via quarterly surveys) increase from 6.2/10 to 8.5/10. Security becomes embedded in daily operations, not an afterthought.');

  // 2. Training Curriculum
  doc.addPage();
  yPos = margin;
  addHeading('2. Training Curriculum', 1);
  addHorizontalLine();
  
  addHeading('2.1 Mandatory Onboarding Training - Day One Requirements', 2);
  addText('New employees cannot access production systems until completing this 2-hour interactive training. Training completion is verified by HR before IT provisions accounts. Employees must achieve 85% on the final assessment or retake the course.', TYPO.body, true);
  
  addHeading('Module 1: Security Fundamentals (30 minutes)', 3);
  addText('Understanding the CIA Triad in Practice:', TYPO.body, true);
  addParagraph('Confidentiality: You will learn why customer data must never be discussed in public spaces (cafes, elevators, Uber rides). Real incident case study: Employee discussed client financial data on public transport, overheard by competitor\'s employee. Result: R2.3 million contract loss and regulatory fine.');
  addParagraph('Integrity: How to verify that data hasn\'t been tampered with. Example: Always verify large payment requests via a second communication channel (phone call) even if the email looks legitimate. A South African startup lost R850,000 when an attacker intercepted and modified payment instructions via email.');
  addParagraph('Availability: Why your laptop must be backed up daily to our secure cloud. Ransomware attack on similar companies: 23% never recover their data even after paying ransom. Our backup policy ensures maximum 24-hour data loss.');
  
  addText('Kumii-Specific Security Policies:', TYPO.body, true);
  addParagraph('Acceptable Use Policy: Your company laptop is for business use. Installing unauthorized software could introduce malware that compromises 15,000+ customer accounts. Personal social media use is permitted during breaks but never access customer data for personal reasons—this is a criminal offense under POPIA with potential 10-year prison sentences.');
  addParagraph('Clean Desk & Screen Lock Policy: Lock your computer (Windows+L or Cmd+L) every time you step away—even for 30 seconds. Unlocked computer in common areas was attack vector in 31% of office-based breaches. Visitor could photograph sensitive data or install malware in under 10 seconds.');
  addParagraph('Remote Work Security: Home WiFi must have WPA3 encryption and unique password (not ISP default). Never work from public WiFi without our company VPN—unencrypted connections allow attackers to intercept usernames, passwords, and customer data. Use privacy screens on laptops when working from public spaces.');
  
  addHeading('Module 2: Authentication & Password Security (25 minutes)', 3);
  addText('Creating Unbreakable Passwords:', TYPO.body, true);
  addParagraph('Weak password "Summer2024!" can be cracked in 6 hours using standard hacking tools. Strong passphrase "Kumii-Helps-5000-Startups-Fund-R900Million" would take 2 trillion years to crack. Minimum 16 characters required for all accounts.');
  addParagraph('Never reuse passwords across sites. When LinkedIn was breached (165 million passwords stolen), attackers tried those passwords on banking sites—78% of people reuse passwords. Our password manager (1Password, provided free) generates and remembers unique passwords for every account.');
  
  addText('Multi-Factor Authentication (MFA) - Your Digital Bulletproof Vest:', TYPO.body, true);
  addParagraph('Even if attacker steals your password, MFA blocks 99.9% of automated attacks. You must enable MFA on all company accounts within 24 hours. Preferred method: Authenticator app (Microsoft Authenticator or Google Authenticator) NOT SMS—SMS can be intercepted via SIM-swapping attacks.');
  addParagraph('PRACTICAL EXERCISE: During this module, you will set up MFA on your Kumii account, password manager, and company email. IT support is standing by to assist. No exceptions granted.');
  
  addText('Password Manager Mandatory Usage:', TYPO.body, true);
  addParagraph('All employees receive 1Password Business license (R195/month value, company-paid). Store all work passwords here. Browser-integrated autofill prevents phishing—it won\'t autofill passwords on fake lookalike sites. Shared team vaults allow secure password sharing without sending passwords via email or Slack.');
  addParagraph('Never write passwords on sticky notes, in notebooks, or unencrypted documents. Security audits check for this—violations result in mandatory retraining and manager notification.');
  
  addHeading('Module 3: Phishing & Social Engineering Defense (30 minutes)', 3);
  addText('Real-World Phishing Examples That Fooled Smart People:', TYPO.body, true);
  addParagraph('CASE STUDY 1: Fake "IT Department" Email - Employee received email: "Your password expires today. Click here to renew." Red flags missed: (1) Sender was "it-support@kumii-secure.com" not our real domain "kumii.com", (2) Hovering over link revealed URL "http://kumii-verify.ml", (3) Real IT never asks for passwords via email. Employee clicked, entered password, attacker gained access to 840 customer records.');
  addParagraph('CASE STUDY 2: CEO Fraud (Whaling) - Finance manager received email from "CEO" requesting urgent wire transfer R450,000 for acquisition deal. Email said "I\'m in meetings, handle this discretely." Grammatical errors, external email warning ignored. Manager transferred money to attacker. Policy now: All transfers above R50,000 require phone verification with two executives.');
  addParagraph('CASE STUDY 3: Microsoft 365 Suspension - Authentic-looking email "Your Microsoft account has been suspended due to suspicious activity." Link led to perfect replica of Microsoft login page. URL was "microsoft-office365-security.com" not "microsoft.com". Over 200 employees at a competitor fell for this attack.');
  
  addText('The 7 Red Flags That Identify 98% of Phishing:', TYPO.body, true);
  addBullet('1. URGENCY - "Act within 24 hours or account closed!" Legitimate companies give reasonable time. Urgency creates pressure that bypasses critical thinking.');
  addBullet('2. SUSPICIOUS SENDER - Hover over sender name to see actual email address. "CEO John Smith <ceo@kumii.secure-login.com>" is fake. Check for typos: "kumii.com" vs "kurmii.com".');
  addBullet('3. GENERIC GREETINGS - "Dear Customer" instead of your name. Our systems always personalize emails. Phishers don\'t have your name, only your email address.');
  addBullet('4. LINKS DON\'T MATCH - Hover before clicking. "Click here to verify" shows URL "http://kumii.verify-account.tk" in bottom-left corner—obviously fake domain.');
  addBullet('5. REQUESTS FOR SENSITIVE INFO - We never ask for passwords, credit cards, or personal information via email. Never. If unsure, go to website directly (type URL) rather than clicking link.');
  addBullet('6. ATTACHMENT WARNINGS - Unexpected attachments, especially .exe, .zip, .scr, .iso files. Even PDF or Word docs can contain malware. Verify with sender via different communication channel before opening.');
  addBullet('7. POOR GRAMMAR - Professional companies proofread. Typos, odd phrasing, wrong logos indicate phishing. "Your account have been compromise" is obvious.');
  
  addText('When In Doubt, Report It Out:', TYPO.body, true);
  addParagraph('Report suspicious emails to security@kumii.com immediately. We analyze within 30 minutes. False alarms are praised—better to report 10 legitimate emails than miss one real attack. Employees who report confirmed phishing receive "Security Guardian" recognition and entry into monthly prize draw (R1,000 gift card).');
  
  addHeading('Module 4: Data Protection & Privacy Compliance (30 minutes)', 3);
  addText('Data Classification - Know What You\'re Protecting:', TYPO.body, true);
  addParagraph('PUBLIC DATA: Marketing materials, job postings, published blog posts. Can be shared freely without approval. Example: Platform feature announcements.');
  addParagraph('INTERNAL DATA: Business strategies, roadmaps, financial projections, employee directories. Restrict to employees only. Never discuss in public or share with contractors without NDA. Example: Q3 growth targets, pricing strategy documents.');
  addParagraph('CONFIDENTIAL DATA: Customer information (names, emails, company data), startup financial models, credit assessment scores, mentor session notes. Strict need-to-know basis. Encryption required for transmission and storage. Example: Startup pitch decks uploaded to platform.');
  addParagraph('RESTRICTED DATA: Authentication credentials, payment card data, ID numbers, bank account details, personally identifiable information (PII) covered by POPIA/GDPR. Maximum security controls. Log every access. Example: User passwords (must be hashed), startup banking details.');
  
  addText('POPIA Compliance - The Law That Sends People to Prison:', TYPO.body, true);
  addParagraph('South Africa\'s Protection of Personal Information Act (POPIA) carries criminal penalties: up to R10 million fines and up to 10 years imprisonment for willful violations. Not theoretical—enforcement began July 2021, and companies are being prosecuted.');
  addParagraph('YOUR LEGAL OBLIGATIONS: (1) Only access personal information required for your job role. Developer needs user email for bug fixes—approved. Marketing wants customer phone numbers for cold calling—illegal without explicit consent. (2) Never share customer data externally without Data Processing Agreement (DPA) and legal approval. (3) Report any data breach within 24 hours—delayed reporting compounds penalties. (4) Respond to data subject access requests within 30 days (customer asks "What data do you have on me?" we must provide complete list). (5) Delete data when no longer needed—customer closes account, their data must be erased within 30 days unless legally required to retain.');
  
  addText('GDPR for South African Companies - Yes, It Applies To Us:', TYPO.body, true);
  addParagraph('GDPR applies to any company processing data of EU residents, regardless of where the company is located. Kumii has EU users, so we must comply. Maximum fine: 4% of annual global turnover or €20 million, whichever is higher.');
  addParagraph('KEY DIFFERENCE FROM POPIA: GDPR requires explicit opt-in consent. Pre-checked boxes are illegal. User must actively check "I agree to receive marketing emails." Data portability right means users can request their data in machine-readable format (CSV/JSON). Right to erasure ("right to be forgotten") means we must delete their data upon request unless we have compelling legal grounds to retain it.');
  
  addText('Secure Data Handling in Daily Work:', TYPO.body, true);
  addParagraph('EMAIL ENCRYPTION: Never send passwords, banking details, or ID numbers via unencrypted email. Use our secure file sharing portal or encrypt with PGP/S/MIME.');
  addParagraph('SCREEN PRIVACY: Use privacy screen filters (provided by IT) when working on laptop in public. Person sitting next to you on plane could be competitive intelligence operative.');
  addParagraph('SECURE FILE SHARING: Use Supabase Storage with expiring links (7-day maximum). Never use personal Dropbox, Google Drive, or WeTransfer for work data. These services are not under our Data Processing Agreements.');
  addParagraph('PRINTING RESTRICTIONS: Customer data must not be printed unless absolutely necessary. If printed, must be shredded (cross-cut shredder in office) immediately after use. Never leave printed customer data on desk overnight.');
  addParagraph('BYOD POLICY: Personal devices (phone, tablet, laptop) can access company email only if enrolled in Mobile Device Management (MDM). MDM allows remote wipe if device is lost. Personal laptop must have full-disk encryption (BitLocker/FileVault), updated antivirus, and company VPN to access internal systems.');
  
  addHeading('Module 5: Incident Response - When Things Go Wrong (20 minutes)', 3);
  addText('Security Incidents - Definition and Real Examples:', TYPO.body, true);
  addParagraph('SECURITY INCIDENT = Any event that compromises confidentiality, integrity, or availability of our systems or data. Examples of what to report immediately:');
  addBullet('Suspicious login notifications: "Your account was accessed from Nigeria" but you\'re in Johannesburg.');
  addBullet('Lost/stolen device: Laptop, phone, or USB drive containing any company data. Report immediately even if encrypted—we can remotely wipe.');
  addBullet('Malware detection: Antivirus alerts, ransomware pop-ups, computer behaving strangely (slow, unexpected reboots, files you didn\'t create).');
  addBullet('Phishing click: You clicked a suspicious link or entered credentials on fake site. Don\'t panic—immediate reporting allows us to reset credentials before attacker uses them.');
  addBullet('Accidental data exposure: Sent customer data to wrong person, shared confidential file publicly, misconfigured database permissions.');
  addBullet('Physical security: Unidentified person in secure areas, door left unlocked overnight, visitor without escort badge.');
  
  addText('The Golden Hour - Report Within 60 Minutes:', TYPO.body, true);
  addParagraph('Speed matters. Security incident reported within 1 hour: 93% chance of preventing data breach. Same incident reported after 24 hours: 31% success rate. Every minute counts.');
  addParagraph('IMMEDIATE REPORTING CHANNELS (24/7 monitoring): (1) Email: security@kumii.com - monitored continuously, automatic escalation to on-call security engineer. (2) Phone/WhatsApp: +27 11 XXX-XXXX - direct line to CISO. (3) Slack: Post in #security-incidents channel - fastest response during business hours. (4) In-person: Find any manager, they will escalate immediately.');
  
  addText('Do\'s and Don\'ts - Protecting Evidence:', TYPO.body, true);
  addParagraph('DO IMMEDIATELY: (1) Disconnect infected device from network (unplug ethernet, disable WiFi) to prevent malware spread. (2) Take photos/screenshots of error messages, suspicious emails, ransom notes. (3) Write down timeline: when you first noticed, what you were doing, what you clicked. (4) Preserve evidence—don\'t delete anything.');
  addParagraph('DO NOT UNDER ANY CIRCUMSTANCES: (1) Try to "fix it yourself"—wiping disk destroys evidence needed for forensics and legal proceedings. (2) Pay ransoms—funding criminal enterprises, no guarantee of data recovery, encourages future attacks. (3) Restart computer—malware may be only in memory, restart could trigger worse payload. (4) Post on social media—"Kumii got hacked" creates PR crisis, alerts attackers that we\'re aware, potential insider trading implications. (5) Contact affected customers directly—legal and PR teams must coordinate response messaging.');
  
  addText('Post-Incident Support:', TYPO.body, true);
  addParagraph('Reporting security incidents is encouraged and protected. You will never face disciplinary action for honest mistakes—clicking phishing link, losing device, misconfiguring system. We want to know so we can help. Disciplinary action only for: (1) Willful policy violations, (2) Attempting to cover up incident, (3) Delayed reporting without justification.');
  
  addHeading('2.2 Annual Refresher Training', 2);
  addText('All employees must complete annual refresher training covering:');
  addBullet('Latest security threats and attack trends');
  addBullet('Policy updates and new security tools');
  addBullet('Case studies of recent security incidents');
  addBullet('Interactive scenarios and knowledge checks');
  addSpace();
  
  addHeading('2.3 Role-Specific Advanced Training', 2);
  addSpace();
  
  addHeading('2.3.1 Developers & Engineers - Secure Coding Masterclass (4 hours quarterly)', 3);
  addText('Developers are the first line of defense. Code vulnerabilities cost 10x more to fix in production than during development.', TYPO.body, true);
  
  addText('OWASP Top 10 Deep Dive with Real Kumii Code Examples:', TYPO.body, true);
  addParagraph('1. BROKEN ACCESS CONTROL - Attacker changes URL parameter user_id=123 to user_id=456 to access other user\'s data. Prevention: Row Level Security (RLS) in Supabase. Every query automatically filtered by auth.uid(). Example policy: CREATE POLICY "Users can only access own assessments" ON credit_assessments FOR SELECT USING (auth.uid() = user_id);');
  addParagraph('2. INJECTION ATTACKS - SQL Injection example: Attacker enters "admin\' OR \'1\'=\'1" in login form. Prevention: Never concatenate user input into queries. Always use parameterized queries. Supabase client handles this automatically: supabase.from(\'users\').select().eq(\'email\', userInput) — safe. Direct SQL with template literals: `SELECT * FROM users WHERE email = \'${userInput}\'` — DANGEROUS.');
  addParagraph('3. CROSS-SITE SCRIPTING (XSS) - Attacker injects <script>alert(document.cookie)</script> into comment field, steals session cookies from other users. Prevention: React automatically escapes JSX expressions. Danger zone: dangerouslySetInnerHTML. If you must use it, sanitize with DOMPurify library first. Review all instances quarterly.');
  addParagraph('4. CRYPTOGRAPHIC FAILURES - Storing passwords in plain text or using weak hashing (MD5, SHA1). Prevention: Supabase Auth handles password hashing with bcrypt. For additional sensitive data, use AES-256 encryption. Never roll your own crypto—use established libraries (libsodium, Web Crypto API).');
  addParagraph('5. SECURITY MISCONFIGURATION - Leaving debug mode enabled in production, exposing stack traces to users, default admin passwords. Prevention: Environment-specific configs, never commit .env files, automated security scans in CI/CD pipeline.');
  
  addText('Supabase Security Best Practices:', TYPO.body, true);
  addParagraph('ROW LEVEL SECURITY (RLS) IS MANDATORY: Every table with user data must have RLS enabled and policies defined. Default deny—if no policy matches, query fails. Test policies with multiple user accounts before deploying. Common mistake: UPDATE policy allows changing user_id to steal other accounts—use WITH CHECK clause.');
  addParagraph('SECURITY DEFINER FUNCTIONS: Use sparingly. When function runs as definer (admin), it bypasses RLS. Attacker exploiting this function has admin access. Always validate inputs exhaustively. Example: Function to transfer points between users must verify sender has sufficient balance AND sender is authenticated user.');
  addParagraph('API KEY ROTATION: Anon key is public (safe for client-side use). Service role key has admin access—NEVER expose in frontend code, only use in Edge Functions. Rotate service role key quarterly.');
  
  addText('Secrets Management - Configuration Hell Solved:', TYPO.body, true);
  addParagraph('NEVER COMMIT SECRETS TO GIT: GitHub secret scanning detects API keys in commits within 10 minutes. Automated bots scan GitHub for exposed AWS keys 24/7. If you accidentally commit secret: (1) Rotate immediately—git commit --amend doesn\'t protect you, secret is in history. (2) Notify security team. (3) Check access logs for unauthorized usage.');
  addParagraph('USE SUPABASE SECRETS: Store API keys (Stripe, OpenAI, etc.) in Supabase Secrets dashboard. Access in Edge Functions via Deno.env.get(\'STRIPE_SECRET_KEY\'). Never in database, never in code. Audit trail of all secret access.');
  addParagraph('ENVIRONMENT VARIABLES: Local development uses .env file (git-ignored). Staging and production use Supabase Secrets. Different keys per environment—dev Stripe keys use test mode, production uses live mode with different keys.');
  
  addText('Dependency Security - Supply Chain Attacks:', TYPO.body, true);
  addParagraph('Every npm install downloads code that runs with your application\'s privileges. Malicious package can steal environment variables, exfiltrate data, mine crypto. MANDATORY STEPS: (1) Run npm audit before every deployment—zero high/critical vulnerabilities allowed. (2) Review new dependencies—check GitHub activity, maintainer reputation, number of downloads. (3) Pin dependency versions—avoid wildcards like "^4.0.0" that auto-update. (4) Use Dependabot/Renovate to get notified of security updates. (5) Audit node_modules: 300 dependencies is suspicious for simple app—unnecessary attack surface.');
  
  addText('Security Testing Requirements:', TYPO.body, true);
  addParagraph('Every pull request must include: (1) Unit tests for authentication/authorization logic. (2) Tests attempting to access other users\' data (should fail). (3) Input validation tests with malicious payloads (SQL injection strings, XSS payloads, extremely long strings). (4) SAST scan passing (ESLint security plugin, SonarQube). (5) Manual security review for any changes to RLS policies, Edge Functions with elevated privileges, payment processing code.');

  // 3. Phishing Simulation Program
  doc.addPage();
  yPos = margin;
  addHeading('3. Phishing Simulation Program - Testing Under Fire', 1);
  addHorizontalLine();
  
  addHeading('3.1 Monthly Simulation Campaigns - Learning By Doing', 2);
  addText('Every employee receives 1-2 simulated phishing emails monthly. These are safe tests designed to train your detection skills. Clicking has no real consequences—it\'s a learning opportunity.', TYPO.body, true);
  
  addText('Campaign Types Deployed:', TYPO.body, true);
  addParagraph('GENERIC CREDENTIAL PHISHING (40% of campaigns): "Your Kumii password will expire in 24 hours. Click here to renew." Tests basic awareness. Success rate target: 95% correctly identify and report without clicking.');
  addParagraph('SPEAR PHISHING (30% of campaigns): Personalized attacks using your name, job title, recent company events. Example: "Hi Sarah, congratulations on the product launch last week. I found a bug in the demo video, see screenshot attached." Tests whether you verify sender before opening attachments. Target: 90% correct identification.');
  addParagraph('EXECUTIVE IMPERSONATION (20% of campaigns): Email appears to be from CEO/CFO requesting urgent action. "I need you to purchase 10 gift cards for client appreciation, send me the codes." Tests authority verification procedures. Target: 95% verify via phone before complying.');
  addParagraph('VENDOR COMPROMISE (10% of campaigns): Appears to be from legitimate vendor with invoice or payment update. "Your payment method for Supabase subscription has failed. Update billing details to avoid service interruption." Tests verification of financial requests. Target: 100% verify through official channels.');
  
  addHeading('3.2 Performance Metrics & Transparency', 2);
  addText('Your individual results are private. Department-level metrics are shared transparently:', TYPO.body, true);
  addParagraph('CLICK RATE: Percentage who clicked malicious link. Current company average: 8.3%. Industry average: 14%. Target: <5%. Development team leads at 3.1%, Operations at 12.4%. Quarterly improvement expected.');
  addParagraph('CREDENTIAL ENTRY RATE: Clicked AND entered username/password on fake page. Current: 2.1%. Target: <1%. Most serious metric—demonstrates failure to verify even after suspicious behavior.');
  addParagraph('REPORTING RATE: Percentage who reported phishing attempt to security@kumii.com. Current: 67%. Target: >85%. High reporting rate indicates strong security culture. We want cautious employees who report suspicious emails even if unsure.');
  addParagraph('TIME TO REPORT: Average time between receiving phishing email and reporting. Current: 3.2 hours. Target: <30 minutes. Faster reporting enables quicker response to real attacks.');
  
  addHeading('3.3 Response to Failed Simulations - No Shame, Just Training', 2);
  addText('Failing a simulation is not a disciplinary issue—it\'s a training opportunity. However, repeated failures indicate need for additional support:', TYPO.body, true);
  addParagraph('FIRST FAILURE: Immediate micro-training popup explains what you missed. 5-minute video showing red flags specific to that email. No manager notification.');
  addParagraph('SECOND FAILURE: Mandatory 20-minute remedial training module covering advanced phishing detection. Must be completed within 7 days. Manager notification.');
  addParagraph('THIRD FAILURE: One-on-one session with Security Champion (30 minutes). Review actual phishing attempts targeting our industry. Identify personal vulnerabilities (time pressure, authority compliance, curiosity about attachments). Create personalized improvement plan.');
  addParagraph('FOURTH AND SUBSEQUENT FAILURES: Meeting with CISO. May indicate need for role reassessment if employee routinely handles sensitive data but cannot identify threats. Possible reassignment to lower-risk role (not termination).');
  
  addHeading('3.4 Reporting Real Phishing - Hero Status', 2);
  addText('How to report suspicious emails received:', TYPO.body, true);
  addParagraph('METHOD 1 - PhishAlert Button (Preferred): Click "PhishAlert" button in Outlook/Gmail toolbar. Email automatically forwarded to security team with full headers for analysis. Original email moved to secure quarantine.');
  addParagraph('METHOD 2 - Manual Forward: Forward suspicious email to security@kumii.com with [PHISHING] in subject line. Include any additional context ("This seemed weird because..."). Do not reply to sender or click anything.');
  addParagraph('METHOD 3 - Urgent Reporting: If you already clicked link or entered credentials, call +27 11 XXX-XXXX immediately. We can reset your credentials and monitor for unauthorized access. Time-critical.');
  
  addText('Rewards & Recognition Program:', TYPO.body, true);
  addParagraph('Employees who report REAL phishing attempts (not simulations) receive: (1) "Security Guardian" recognition in monthly company newsletter with their name and photo (with permission). (2) Entry into monthly prize draw (R1,000 Takealot voucher). (3) One entry per real phishing reported, unlimited entries. (4) Annual "Security Champion Award" for employee with most confirmed reports (R5,000 bonus + plaque). Last year\'s winner: Thandi Mokoena, Customer Success, 23 confirmed real phishing reports saved company from potential R2.7 million breach.');

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
