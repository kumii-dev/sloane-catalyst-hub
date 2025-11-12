# Kumii - Employee Security Awareness & Training Program

## Employee Security Training for Kumii Platform

**Document Version:** 1.0  
**Last Updated:** 2025-11-03  
**Owner:** CISO  
**Training Frequency:** Annual (mandatory), Quarterly updates  
**Classification:** Internal Use

---

## 1. Program Overview

### 1.1 Purpose
Ensure all Kumii employees understand their security responsibilities and can identify, prevent, and respond to security threats.

### 1.2 Scope
- **Mandatory for**: All employees, contractors, and vendors with system access
- **Training Types**: Onboarding, annual refresher, role-specific, incident response
- **Delivery**: Online modules, live workshops, phishing simulations
- **Tracking**: LMS (Learning Management System) or spreadsheet

### 1.3 Objectives
By completing this program, employees will be able to:
- ✅ Recognize common security threats (phishing, social engineering, malware)
- ✅ Follow secure development practices
- ✅ Handle sensitive data appropriately
- ✅ Respond correctly to security incidents
- ✅ Understand compliance requirements (POPIA, GDPR)

---

## 2. Training Curriculum

### 2.1 Onboarding Training (Day 1 - All Employees)

**Duration**: 2 hours  
**Format**: Self-paced online + live Q&A  
**Completion Required**: Before system access granted

**Module 1: Security Fundamentals (30 minutes)**
- Information security triad (Confidentiality, Integrity, Availability)
- Company security policies overview
- Employee responsibilities
- Reporting security incidents

**Module 2: Password & Authentication Security (20 minutes)**
- Password best practices (length, complexity, uniqueness)
- Multi-Factor Authentication (MFA) setup
- Password manager usage (recommended: Bitwarden, 1Password)
- Avoiding password reuse
- Recognizing credential phishing

**Hands-on Exercise:**
- Set up MFA on company accounts
- Create strong password in password manager

**Module 3: Phishing & Social Engineering (30 minutes)**
- Types of phishing (email, SMS, voice)
- Red flags to identify phishing
- Social engineering tactics
- Case studies (real-world examples)
- Reporting suspicious emails

**Interactive Quiz:**
- Identify phishing emails (10 examples)
- Must score 80% to pass

**Module 4: Data Protection & Privacy (30 minutes)**
- Data classification (Public, Internal, Confidential, Restricted)
- Handling PII (Personally Identifiable Information)
- POPIA and GDPR basics
- Data breach scenarios
- Secure file sharing practices

**Module 5: Incident Response (10 minutes)**
- What is a security incident?
- Who to contact (CISO, IT Helpdesk)
- Do's and Don'ts during an incident
- Incident reporting form walkthrough

**Assessment**: 20-question quiz (80% pass rate required)

---

### 2.2 Annual Refresher Training (All Employees)

**Duration**: 1 hour  
**Format**: Online modules + live webinar  
**Due Date**: Anniversary of hire date  
**Non-Completion Consequence**: Account access suspended

**Topics:**
- Security policy updates
- New threat landscape (current year trends)
- Lessons learned from incidents (anonymized)
- Compliance updates (POPIA, GDPR changes)
- Best practices review

**Includes:**
- 30-minute video recap
- 15-minute case study discussion
- 15-question assessment

---

### 2.3 Role-Specific Training

#### 2.3.1 Developers & Engineers (3 hours)

**Secure Development Practices**

**Module 1: Secure Coding Fundamentals (45 minutes)**
- OWASP Top 10 vulnerabilities
- Input validation and sanitization
- SQL injection prevention
- Cross-Site Scripting (XSS) prevention
- Cross-Site Request Forgery (CSRF) protection

**Code Examples:**
```typescript
// ❌ BAD: SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${userInput}'`;

// ✅ GOOD: Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userInput);
```

```typescript
// ❌ BAD: XSS vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD: Sanitized output
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Module 2: Authentication & Authorization (30 minutes)**
- Supabase Auth best practices
- Row-Level Security (RLS) policies
- JWT token handling
- Security definer functions
- Preventing privilege escalation

**Hands-on Lab:**
- Write secure RLS policy
- Test policy with different user roles
- Identify vulnerability in sample code

**Module 3: Secrets Management (20 minutes)**
- Never commit secrets to Git
- Using Supabase Secrets for API keys
- Environment variable best practices
- Rotating API keys
- Detecting leaked secrets (GitHub secret scanning)

**Module 4: Dependency Security (20 minutes)**
- npm audit and vulnerability scanning
- Keeping dependencies updated
- Evaluating third-party libraries
- Supply chain attacks (awareness)

**Module 5: Security Testing (25 minutes)**
- Writing security-focused tests
- Penetration testing basics
- Bug bounty program (future)
- Using security linters (ESLint security plugins)

**Assessment**: Secure code review exercise (identify 10 vulnerabilities)

---

#### 2.3.2 Administrators & DevOps (2 hours)

**Infrastructure Security**

**Module 1: Access Control Management (30 minutes)**
- Principle of least privilege
- Role-based access control (RBAC)
- Managing user roles in Supabase
- Reviewing access logs
- Revoking access promptly

**Module 2: Database Security (30 minutes)**
- PostgreSQL security hardening
- RLS policy auditing
- Backup and recovery procedures
- Encryption at rest and in transit
- Database monitoring and alerting

**Module 3: Cloud Security (30 minutes)**
- Supabase security configuration
- Storage bucket policies
- Edge function security
- API key rotation
- Monitoring dashboard setup

**Module 4: Incident Response for Admins (30 minutes)**
- First responder responsibilities
- Isolating compromised systems
- Preserving evidence
- Communication protocols
- Post-incident reviews

**Assessment**: Incident response simulation

---

#### 2.3.3 Data Analysts & Business Users (1 hour)

**Data Privacy & Compliance**

**Module 1: Data Handling Best Practices (20 minutes)**
- Classifying data correctly
- Secure data export procedures
- Anonymization techniques
- Sharing data externally (DPAs required)

**Module 2: POPIA & GDPR Compliance (20 minutes)**
- Data subject rights (access, deletion)
- Consent management
- Cross-border data transfers
- Data retention policies

**Module 3: Reporting & Analytics Security (20 minutes)**
- Avoiding PII in reports
- Dashboard access controls
- Secure data visualization
- Third-party BI tool integration

**Assessment**: Data handling scenario quiz

---

#### 2.3.4 Executives & Leadership (1.5 hours)

**Security Governance & Risk Management**

**Module 1: Security Strategy Overview (30 minutes)**
- Security posture assessment
- Risk management framework
- Compliance landscape (ISO 27001, POPIA, GDPR)
- Board reporting on security

**Module 2: Incident Command (30 minutes)**
- Executive role during incidents
- Decision-making under pressure
- Communication with stakeholders
- Legal and regulatory obligations

**Module 3: Vendor Risk Management (30 minutes)**
- Evaluating third-party vendors
- DPA requirements
- Vendor security assessments
- Supply chain security

**Assessment**: Tabletop exercise (ransomware scenario)

---

### 2.4 Specialized Training

#### 2.4.1 Incident Handling Workshop (4 hours - IRT Members)

**Attendees**: Incident Response Team members  
**Frequency**: Bi-annually  
**Format**: Hands-on lab

**Topics:**
- Incident detection and analysis
- Containment strategies
- Evidence preservation (forensics basics)
- Eradication and recovery
- Post-incident reporting
- Communication during crisis

**Exercises:**
- Simulated data breach scenario
- Ransomware response drill
- DDoS attack mitigation

---

#### 2.4.2 Privacy Officer Training (8 hours - DPO)

**Attendees**: Data Protection Officer, Legal, HR  
**Frequency**: Annually  
**Format**: External certification course

**Topics:**
- POPIA (Protection of Personal Information Act) deep dive
- GDPR for non-EU companies
- Data subject requests handling
- Privacy impact assessments (PIA)
- International data transfers
- Breach notification procedures

**Certification**: IAPP (International Association of Privacy Professionals)

---

## 3. Phishing Simulation Program

### 3.1 Simulated Phishing Campaigns

**Frequency**: Monthly  
**Tool**: KnowBe4, Cofense, or similar  
**Purpose**: Test employee awareness and identify training gaps

**Campaign Types:**
1. **Generic Phishing**: "Your password expires today, click here"
2. **Spear Phishing**: Targeted emails using public info (LinkedIn)
3. **Credential Harvesting**: Fake login pages
4. **Attachment-Based**: Malicious file downloads (safe simulations)
5. **CEO Fraud**: Impersonation of executives

**Metrics Tracked:**
- Click rate (target: < 5%)
- Credential entry rate (target: < 2%)
- Reporting rate (target: > 80%)
- Improvement over time

**Response to Failed Tests:**
- Click once: Automatic micro-training module
- Click twice: Manager notification + remedial training
- Click thrice: Meeting with CISO

---

### 3.2 Phishing Reporting Process

**How to Report:**
1. **Don't click** any links or download attachments
2. **Forward suspicious email** to security@kumii.com
3. **Delete original email** after reporting
4. **Report via button**: (If integrated in email client)

**What Happens Next:**
- Security team analyzes within 1 hour
- Response sent to reporter (Thank you or false alarm)
- If real phishing: Company-wide alert sent
- Blocklist updated

**Rewards Program:**
- Employees who report real phishing: Recognition in monthly newsletter
- Top reporters: Small gift cards

---

## 4. Secure Development Lifecycle (SDL)

### 4.1 Security Requirements Phase

**Every new feature must include:**
- Threat modeling (STRIDE methodology)
- Security requirements documented
- Privacy impact assessment (if handling PII)
- Compliance checklist (POPIA, GDPR)

**Example Threat Model Template:**
```
Feature: Credit Assessment Submission
Threats:
- S (Spoofing): Attacker impersonates user
- T (Tampering): Assessment data modified in transit
- R (Repudiation): User denies submitting assessment
- I (Information Disclosure): Assessment data leaked
- D (Denial of Service): System overwhelmed with submissions
- E (Elevation of Privilege): User accesses others' assessments

Mitigations:
- S: Supabase Auth (JWT tokens)
- T: HTTPS (TLS 1.3)
- R: Audit logs (timestamps, user_id)
- I: RLS policies, encryption at rest
- D: Rate limiting (100 req/min per user)
- E: RLS policies (user can only access own assessments)
```

---

### 4.2 Secure Code Review Checklist

**Before merging to main:**

**Authentication & Authorization:**
- [ ] User input validated and sanitized
- [ ] RLS policies enforce least privilege
- [ ] No hardcoded credentials or API keys
- [ ] JWT tokens validated on backend
- [ ] Session management secure (timeouts, HTTPS only)

**Data Protection:**
- [ ] Sensitive data encrypted (at rest and in transit)
- [ ] PII handling complies with POPIA/GDPR
- [ ] No sensitive data logged to console
- [ ] Database queries use parameterized statements
- [ ] File uploads validated (type, size, content)

**Error Handling:**
- [ ] Errors don't leak sensitive information
- [ ] All errors logged to Sentry
- [ ] User-friendly error messages (not technical details)

**Dependencies:**
- [ ] No known vulnerabilities (npm audit clean)
- [ ] Dependencies from trusted sources
- [ ] Minimal dependencies (attack surface reduction)

**Testing:**
- [ ] Unit tests for security-critical functions
- [ ] Integration tests for auth flows
- [ ] Manual security testing completed

---

### 4.3 Security Testing Guidelines

**Automated Testing:**
```typescript
// Example: Test RLS policy
describe('Credit Assessment RLS', () => {
  it('should not allow user to view others assessments', async () => {
    const { data, error } = await supabase
      .from('credit_assessments')
      .select('*')
      .eq('user_id', 'different_user_id');
    
    expect(data).toHaveLength(0);
    expect(error).toBeDefined(); // RLS should block
  });
});
```

**Manual Testing:**
- Try accessing resources without authentication
- Attempt privilege escalation (change user_id in requests)
- Test input validation with malicious payloads
- Verify rate limiting effectiveness

**Penetration Testing:**
- Quarterly: Internal security scans
- Annually: External penetration test by third-party

---

## 5. Incident Response Training

### 5.1 What is a Security Incident?

**Examples:**
- ✅ **IS an incident**: Suspicious login from unfamiliar location
- ✅ **IS an incident**: Phishing email sent to multiple employees
- ✅ **IS an incident**: Unauthorized access to database
- ✅ **IS an incident**: Data breach or leak
- ✅ **IS an incident**: Malware detected on employee device
- ❌ **NOT an incident**: Forgotten password
- ❌ **NOT an incident**: Legitimate email from vendor

---

### 5.2 How to Report an Incident

**Immediate Reporting:**
- **Email**: security@kumii.com
- **Phone**: +27-XXX-XXX-XXXX (CISO on-call)
- **Slack**: #security-incidents (for urgent issues)

**Incident Report Form**: https://forms.kumii.com/security-incident

**Information to Include:**
- Date and time discovered
- Description of incident
- Systems/data affected
- Actions taken (if any)
- Your contact information

---

### 5.3 Do's and Don'ts During an Incident

**✅ DO:**
- Report immediately (don't wait)
- Preserve evidence (screenshots, logs)
- Disconnect affected device from network (if malware)
- Follow instructions from security team
- Document everything

**❌ DON'T:**
- Try to "fix it yourself" (may destroy evidence)
- Delete logs or files
- Pay ransom (if ransomware)
- Discuss publicly (social media, etc.)
- Ignore or downplay the issue

---

## 6. Compliance Training

### 6.1 POPIA (Protection of Personal Information Act) Overview

**Key Principles:**
1. **Accountability**: We are responsible for protecting personal information
2. **Processing Limitation**: Only collect what we need, with consent
3. **Purpose Specification**: Clear purpose for data collection
4. **Further Processing**: Don't use data for unintended purposes
5. **Information Quality**: Keep data accurate and up-to-date
6. **Openness**: Be transparent about data usage
7. **Security Safeguards**: Protect data from loss, damage, unauthorized access
8. **Data Subject Participation**: Users can access, correct, delete their data

**Your Responsibilities:**
- Obtain consent before collecting personal information
- Secure personal data (don't leave on desk, send via unsecured email)
- Report data breaches to CISO immediately
- Respect user requests for data access/deletion

**Examples of Personal Information:**
- Names, surnames, ID numbers
- Contact details (email, phone, address)
- Financial information (bank details, credit scores)
- Health information
- Biometric data
- Online identifiers (IP addresses, cookies)

---

### 6.2 GDPR (General Data Protection Regulation) Basics

**Applies When:**
- We have customers/users in the EU
- We process data of EU residents

**Key Differences from POPIA:**
- Stricter consent requirements (explicit, granular)
- Right to data portability (export in machine-readable format)
- Shorter breach notification timeline (72 hours)
- Higher fines (up to 4% of global revenue or €20M)

**Our Approach:**
- Supabase EU region for data residency
- DPAs with all processors
- Privacy-by-design in all features
- Audit logs for all data access

---

## 7. Training Delivery & Tracking

### 7.1 Training Schedule

| Employee Type | Onboarding | Annual Refresher | Role-Specific | Phishing Sims |
|---------------|------------|------------------|---------------|---------------|
| **All Employees** | Day 1 (2 hours) | Annually (1 hour) | N/A | Monthly |
| **Developers** | + Week 1 (3 hours) | Bi-annually | Secure Coding (3h) | Monthly |
| **Admins** | + Week 1 (2 hours) | Bi-annually | Infrastructure (2h) | Monthly |
| **Executives** | Day 1 (1.5 hours) | Annually | Governance (1.5h) | Monthly |
| **IRT Members** | + Week 1 | Bi-annually | Incident Handling (4h) | Quarterly |

---

### 7.2 Tracking & Compliance

**Learning Management System (LMS):**
- TalentLMS, Moodle, or Google Classroom
- Tracks completion rates, quiz scores, certificates

**Metrics Dashboard:**
- Training completion rate (target: 100%)
- Average quiz score (target: > 85%)
- Phishing click rate (target: < 5%)
- Incident response time (target: < 15 min)

**Reporting:**
- Monthly: CISO reviews completion rates
- Quarterly: Executive dashboard (KPIs)
- Annually: Board presentation on security posture

---

### 7.3 Enforcement

**Non-Completion Consequences:**
1. **Week 1 Overdue**: Automated reminder email
2. **Week 2 Overdue**: Manager notified
3. **Week 4 Overdue**: System access suspended
4. **Persistent Non-Compliance**: Disciplinary action

**Exceptions:**
- Must be approved by CISO
- Valid reasons: Medical leave, extended absence
- Alternate completion date assigned

---

## 8. Resources & Support

### 8.1 Security Champions Program

**What is it?**
- Volunteer employees (1 per team) who champion security
- Act as liaison between security team and their department
- Help disseminate security best practices

**Benefits:**
- Extra training and certification opportunities
- Recognition in company communications
- Closer collaboration with CISO

**How to Join:**
- Express interest to CISO
- Complete Security Champion training (8 hours)
- Commit to 2-hour monthly meetings

---

### 8.2 Security Resources Library

**Internal Wiki**: https://wiki.kumii.com/security

**Contents:**
- Security policies and procedures
- Secure coding guidelines
- Incident response playbooks
- Privacy templates (consent forms, DPAs)
- Compliance checklists
- Threat intelligence reports

**External Resources:**
- OWASP (Open Web Application Security Project): https://owasp.org
- SANS Institute (Security Training): https://sans.org
- IAPP (Privacy Training): https://iapp.org
- Supabase Security Docs: https://supabase.com/docs/guides/platform/security

---

### 8.3 Getting Help

**Questions?**
- **Email**: security@kumii.com
- **Slack**: #security-questions
- **Office Hours**: Thursdays 2-3 PM (CISO available)

**Report Security Concerns Anonymously:**
- Whistleblower hotline: +27-XXX-XXX-XXXX
- Anonymous form: https://forms.kumii.com/anonymous-report

---

## 9. Certification & Acknowledgment

### 9.1 Training Completion Certificate

Upon completing each training module, employees receive:
- Digital certificate (stored in LMS)
- Badge (displayed on internal profile)
- CPE credits (for relevant certifications like CISSP)

---

### 9.2 Security Awareness Acknowledgment

**All employees must sign annually:**

> I, [Employee Name], acknowledge that I have completed the Kumii Security Awareness Training. I understand my responsibilities regarding:
> - Protecting company and customer data
> - Identifying and reporting security threats
> - Following secure development practices
> - Complying with POPIA and GDPR
> - Responding appropriately to security incidents
>
> I understand that failure to follow these guidelines may result in disciplinary action, up to and including termination.
>
> **Signature:** __________________  
> **Date:** __________________

---

## 10. Continuous Improvement

### 10.1 Training Effectiveness Measurement

**Metrics:**
- **Training Completion Rate**: % of employees who completed on time
- **Quiz Scores**: Average across all assessments
- **Phishing Click Rate**: % who fell for simulated phishing
- **Real Incident Reporting Rate**: % of actual threats reported
- **Time to Report**: How quickly incidents are reported

**Quarterly Review:**
- Analyze metrics vs. targets
- Identify knowledge gaps
- Update training content based on new threats
- Gather feedback from employees (surveys)

---

### 10.2 Annual Training Updates

**Review Process:**
- Update threat landscape section (new attack types)
- Add lessons learned from real incidents
- Incorporate regulatory changes (new laws, guidelines)
- Refresh examples and case studies
- Update technology-specific content (new frameworks, tools)

**Next Review Date**: 2026-01-15

---

## 11. Appendices

### Appendix A: Security Policy Summary
[Link to full Security Policy document]

### Appendix B: Incident Response Plan
[Link to docs/DISASTER_RECOVERY.md]

### Appendix C: Secure Coding Standards
[Link to development guidelines]

### Appendix D: Privacy Policy (Employee)
[Link to employee privacy notice]

### Appendix E: Glossary of Security Terms
- **Phishing**: Fraudulent emails attempting to steal credentials
- **Malware**: Malicious software (viruses, ransomware, spyware)
- **RLS (Row-Level Security)**: Database access control at row level
- **DPA (Data Processing Agreement)**: Contract for data processors
- **POPIA**: South African data protection law
- **GDPR**: EU data protection regulation
- **MFA (Multi-Factor Authentication)**: Login requiring 2+ factors

---

**Document Control:**

**Approved By:** CISO  
**Effective Date:** 2025-11-03  
**Next Review:** 2026-11-03  
**Version:** 1.0

**Distribution:**
- All Employees (via LMS)
- HR Department
- Management Team

---

*This training program is mandatory for all employees. Non-compliance may result in disciplinary action.*
