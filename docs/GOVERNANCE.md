# Governance Framework

## ISO 27001 Aligned Policies for Kumii Platform

**Document Version:** 1.0  
**Last Updated:** 2025-11-03  
**Review Cycle:** Quarterly  
**Owner:** Chief Information Security Officer

---

## 1. Access Control Policy

### 1.1 Purpose
Ensure authorized access to platform resources while preventing unauthorized access.

### 1.2 Scope
All users, systems, applications, and data within the Kumii ecosystem.

### 1.3 Policy Statements

#### User Access Management
- **Role-Based Access Control (RBAC)**: All access rights assigned via `user_roles` table
- **Principle of Least Privilege**: Users granted minimum permissions necessary
- **Role Types**: `admin`, `mentor`, `startup`, `funder`, `software_provider`, `software_provider_pending`
- **Access Review**: Quarterly review of all privileged accounts
- **Termination Process**: Immediate revocation upon role change or account deactivation

#### Authentication Requirements
- **Multi-Factor Authentication (MFA)**: Required for all admin accounts
- **Password Policy**: 
  - Minimum 12 characters
  - Complexity requirements enforced via Supabase Auth
  - Password history: Last 5 passwords cannot be reused
  - Maximum age: 90 days for privileged accounts
- **Session Management**: 
  - Automatic timeout after 30 minutes of inactivity
  - JWT tokens with 1-hour expiration
  - Refresh tokens valid for 7 days

#### Database Access
- **Row-Level Security (RLS)**: Enabled on all tables
- **Security Definer Functions**: Used to prevent RLS recursion
- **Service Accounts**: Separate credentials for edge functions
- **Audit Trail**: All database changes logged

### 1.4 Technical Implementation
```sql
-- Access control enforced via RLS policies
-- Example: User can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Role-based access via security definer functions
SELECT public.has_role(auth.uid(), 'admin');
```

### 1.5 Compliance Mapping
- ISO 27001: A.9 (Access Control)
- POPIA: Section 19 (Security Safeguards)
- GDPR: Article 32 (Security of Processing)

---

## 2. Data Retention & Disposal Policy

### 2.1 Purpose
Define lifecycle management for all data types to ensure compliance and optimize storage.

### 2.2 Retention Schedule

| Data Type | Retention Period | Disposal Method |
|-----------|------------------|-----------------|
| User Profiles | Active + 2 years after account closure | Soft delete, then hard delete |
| Credit Assessments | 7 years (financial records) | Encrypted archival, then secure deletion |
| Mentorship Sessions | 3 years after session completion | Archival to cold storage |
| Messages/Conversations | Active + 1 year | Cascading deletion |
| Audit Logs | 7 years (compliance requirement) | Write-once storage, encrypted |
| Financial Transactions | 7 years (tax/audit requirements) | Encrypted archival |
| Assessment Documents | 5 years | Encrypted storage bucket with lifecycle policy |
| Analytics Data | 2 years | Aggregated anonymously after 90 days |
| Error Logs (Sentry) | 90 days | Automatic deletion |
| Edge Function Logs | 7 days | Supabase automatic retention |

### 2.3 Data Classification

#### Critical Data (Tier 1)
- Personal Identifiable Information (PII)
- Financial data
- Authentication credentials
- Credit assessment results
- **Encryption**: At rest (AES-256) and in transit (TLS 1.3)
- **Backup**: Daily, encrypted, geo-redundant

#### Sensitive Data (Tier 2)
- Business documents
- Mentorship session notes
- User communications
- **Encryption**: At rest and in transit
- **Backup**: Daily, encrypted

#### Public Data (Tier 3)
- Service listings
- Public profiles (with consent)
- **Encryption**: In transit only
- **Backup**: Daily

### 2.4 Right to Erasure (GDPR Article 17)
- **Request Process**: Via support ticket or email
- **Response Time**: 30 days maximum
- **Scope**: All personal data except legal/regulatory retention
- **Implementation**: 
  ```sql
  -- Anonymization function for GDPR compliance
  UPDATE profiles SET
    first_name = 'Deleted',
    last_name = 'User',
    email = 'deleted_' || id || '@anonymized.local',
    phone = NULL,
    bio = NULL
  WHERE user_id = <deleted_user_id>;
  ```

### 2.5 Compliance Mapping
- ISO 27001: A.11.2.7 (Disposal of Media)
- POPIA: Section 14 (Data Retention)
- GDPR: Article 17 (Right to Erasure)

---

## 3. Vendor Management Policy

### 3.1 Purpose
Manage third-party vendor risks and ensure compliance with data protection requirements.

### 3.2 Vendor Categories

#### Critical Vendors (Tier 1)
- Supabase (Database, Auth, Storage)
- Daily.co (Video infrastructure)
- Sentry (Error monitoring)

#### Important Vendors (Tier 2)
- OpenAI (AI services)
- ElevenLabs (Voice synthesis)
- Resend (Email delivery)

#### Standard Vendors (Tier 3)
- Lovable Platform (Hosting)
- Third-party libraries (npm packages)

### 3.3 Vendor Assessment Requirements

**Pre-Onboarding Checklist:**
- [ ] SOC 2 Type II certification review
- [ ] ISO 27001 certification verification
- [ ] Data Processing Agreement (DPA) signed
- [ ] Security questionnaire completed
- [ ] Sub-processor disclosure obtained
- [ ] Data location confirmation
- [ ] Incident response procedures documented
- [ ] Business continuity plan reviewed
- [ ] Insurance coverage verified (minimum $2M cyber liability)

**Annual Review:**
- [ ] Certification renewal verification
- [ ] Security incident review
- [ ] SLA compliance assessment
- [ ] Cost-benefit analysis
- [ ] Alternative vendor research

### 3.4 Data Processing Agreements (DPA)
All Tier 1 and Tier 2 vendors must have signed DPAs covering:
- Purpose limitation
- Data minimization
- Storage limitation
- Confidentiality and security
- Sub-processor management
- Data subject rights
- Cross-border transfer mechanisms (where applicable)
- Audit rights
- Breach notification (within 24 hours)

### 3.5 Vendor Exit Strategy
- **Data Export**: Must be possible in standard formats (JSON, CSV)
- **Data Deletion**: Certified deletion within 30 days of termination
- **Transition Period**: Minimum 90 days for critical vendors
- **Backup Vendor**: Identified for all critical services

### 3.6 Compliance Mapping
- ISO 27001: A.15 (Supplier Relationships)
- POPIA: Section 20 (Processing by Operator)
- GDPR: Article 28 (Processor)

---

## 4. Incident Response Policy

### 4.1 Incident Classification

| Severity | Description | Response Time | Escalation |
|----------|-------------|---------------|------------|
| **Critical** | Data breach, system-wide outage, ransomware | Immediate (< 15 min) | CEO, CISO, Legal |
| **High** | Service degradation, unauthorized access attempt | < 1 hour | CISO, DevOps Lead |
| **Medium** | Performance issues, failed backups | < 4 hours | DevOps Lead |
| **Low** | Minor bugs, user complaints | < 24 hours | Support Team |

### 4.2 Incident Response Team (IRT)
- **Incident Commander**: CTO
- **Security Lead**: CISO
- **Technical Lead**: Lead Developer
- **Communications Lead**: COO
- **Legal Counsel**: External/Internal Legal
- **On-Call**: 24/7 rotation for Critical/High incidents

### 4.3 Response Procedures

#### Phase 1: Detection & Analysis (0-1 hour)
1. Alert received via Sentry, monitoring, or user report
2. Initial triage by on-call engineer
3. Severity classification
4. IRT activation if High/Critical

#### Phase 2: Containment (1-4 hours)
1. Isolate affected systems
2. Preserve evidence (logs, snapshots)
3. Implement temporary mitigations
4. Document timeline

#### Phase 3: Eradication (4-24 hours)
1. Root cause analysis
2. Remove threat/vulnerability
3. Patch systems
4. Verify remediation

#### Phase 4: Recovery (24-72 hours)
1. Restore normal operations
2. Monitor for recurrence
3. Validate system integrity

#### Phase 5: Post-Incident Review (Within 7 days)
1. Lessons learned meeting
2. Update runbooks
3. Implement preventive controls
4. Report to stakeholders

### 4.4 Breach Notification Requirements
- **POPIA**: 72 hours to Information Regulator
- **GDPR**: 72 hours to supervisory authority (if EU users affected)
- **Users**: Without undue delay if high risk to rights and freedoms
- **Regulatory**: As per sector-specific requirements

### 4.5 Communication Templates
Stored in: `docs/incident-response-templates/`
- Breach notification (internal)
- Breach notification (users)
- Breach notification (regulator)
- Status page updates
- Post-mortem report

### 4.6 Compliance Mapping
- ISO 27001: A.16 (Information Security Incident Management)
- POPIA: Section 22 (Security Compromises)
- GDPR: Articles 33-34 (Breach Notification)

---

## 5. Change Management Policy

### 5.1 Purpose
Ensure all changes to production systems are controlled, tested, and documented.

### 5.2 Change Categories

| Type | Approval Required | Testing | Rollback Plan | Example |
|------|-------------------|---------|---------------|---------|
| **Emergency** | CTO post-implementation | Minimal | Mandatory | Security patch, critical bug |
| **Standard** | Tech Lead | Full test suite | Mandatory | Feature updates, migrations |
| **Minor** | Peer review | Unit tests | Optional | UI tweaks, copy changes |

### 5.3 Change Process

#### Development → Staging → Production
1. **Development**: Feature branch with comprehensive testing
2. **Staging**: Full integration testing with production-like data
3. **Production**: Phased rollout with monitoring

#### Database Migrations
- All migrations in `supabase/migrations/`
- Backward compatible for zero-downtime deployments
- Tested on staging environment first
- Rollback script prepared
- Executed during low-traffic windows

#### Edge Functions
- Deployed via Supabase CLI
- Versioned and tested
- Canary deployments for high-risk changes
- Monitoring active for 24 hours post-deployment

### 5.4 Rollback Procedures
- **Code**: Git revert + redeployment (< 15 minutes)
- **Database**: Migration rollback scripts (< 30 minutes)
- **Edge Functions**: Previous version redeployment (< 5 minutes)
- **Decision Maker**: On-call engineer for emergencies, Tech Lead otherwise

### 5.5 Documentation Requirements
Every production change must include:
- Change description and rationale
- Risk assessment
- Testing results
- Rollback procedure
- Post-deployment validation steps

### 5.6 Compliance Mapping
- ISO 27001: A.12.1.2 (Change Management)
- ISO 27001: A.14.2 (Security in Development)

---

## 6. Business Continuity Policy

### 6.1 Critical Business Functions

| Function | RTO | RPO | Priority |
|----------|-----|-----|----------|
| User Authentication | 1 hour | 0 (live replication) | P0 |
| Mentorship Sessions | 4 hours | 15 minutes | P1 |
| Credit Assessments | 8 hours | 1 hour | P1 |
| Marketplace Listings | 24 hours | 4 hours | P2 |
| Messaging | 4 hours | 15 minutes | P1 |
| File Storage | 24 hours | 1 hour | P2 |

### 6.2 Infrastructure Resilience
- **Database**: Supabase multi-region replication
- **Edge Functions**: Auto-scaling, multiple availability zones
- **Storage**: Geo-redundant (3 copies minimum)
- **CDN**: Global distribution via Supabase CDN
- **Monitoring**: Sentry + Supabase Analytics (99.9% uptime)

### 6.3 Backup Strategy
- **Database**: 
  - Continuous Point-in-Time Recovery (PITR)
  - Daily full backups (retained 30 days)
  - Weekly backups (retained 90 days)
  - Monthly backups (retained 1 year)
- **Storage Buckets**: 
  - Cross-region replication
  - Versioning enabled
- **Code**: 
  - Git version control (multiple remotes)
  - Docker images stored in registry

### 6.4 Disaster Scenarios & Response

#### Scenario 1: Supabase Regional Outage
- **Detection**: Health check failure
- **Response**: Automatic failover to secondary region (if configured)
- **Manual**: Restore from PITR to new instance
- **RTO**: 2 hours

#### Scenario 2: Database Corruption
- **Detection**: Integrity check failure
- **Response**: Restore from last known good backup
- **Data Loss**: Maximum 15 minutes (RPO)
- **RTO**: 4 hours

#### Scenario 3: Ransomware/Malicious Deletion
- **Detection**: Abnormal deletion patterns, Sentry alerts
- **Response**: Isolate affected systems, restore from immutable backups
- **RTO**: 8 hours

#### Scenario 4: Total Data Center Loss (Catastrophic)
- **Detection**: Complete service unavailability
- **Response**: Rebuild infrastructure in new region from backups
- **RTO**: 24 hours
- **RPO**: 1 hour

### 6.5 Testing Schedule
- **Backup Restoration**: Monthly
- **Failover Procedures**: Quarterly
- **Full DR Simulation**: Annually
- **Tabletop Exercises**: Bi-annually

### 6.6 Compliance Mapping
- ISO 27001: A.17 (Business Continuity)
- ISO 22301 (Business Continuity Management)

---

## 7. Privacy & Data Protection Policy

### 7.1 Legal Basis for Processing (GDPR)
- **Consent**: Marketing communications, optional profile fields
- **Contract**: Service delivery, mentorship sessions
- **Legal Obligation**: Tax records, audit logs
- **Legitimate Interest**: Fraud prevention, analytics (anonymized)

### 7.2 Data Subject Rights
| Right | Process | Response Time |
|-------|---------|---------------|
| Access | Email request → data export | 30 days |
| Rectification | Self-service in profile settings | Immediate |
| Erasure | Support ticket → anonymization | 30 days |
| Portability | Data export in JSON format | 30 days |
| Objection | Opt-out mechanisms | Immediate |
| Restriction | Temporary account suspension | 24 hours |

### 7.3 Cross-Border Transfers
- **Primary Region**: EU (via Supabase EU region)
- **Sub-processors**: US-based (OpenAI, ElevenLabs, Sentry)
- **Mechanism**: Standard Contractual Clauses (SCCs)
- **Data Localization**: South African user data stored in EU with adequacy decision

### 7.4 Privacy by Design
- **Data Minimization**: Only collect necessary fields
- **Anonymization**: Analytics data anonymized after 90 days
- **Encryption**: End-to-end for sensitive communications
- **Default Settings**: Privacy-protective defaults (opt-in for marketing)

### 7.5 Compliance Mapping
- POPIA (Protection of Personal Information Act - South Africa)
- GDPR (General Data Protection Regulation - EU)
- ISO 27701 (Privacy Information Management)

---

## 8. Monitoring & Review

### 8.1 Policy Review Cycle
- **Quarterly**: Access control reviews, vendor assessments
- **Bi-annually**: Incident response drills, policy updates
- **Annually**: Full governance framework audit, DR testing

### 8.2 Key Performance Indicators (KPIs)
- Mean Time to Detect (MTTD): < 15 minutes
- Mean Time to Respond (MTTR): < 1 hour for critical
- Backup Success Rate: > 99.5%
- RLS Policy Coverage: 100% of tables
- Vulnerability Patch Time: < 48 hours for critical
- Security Training Completion: 100% of staff annually

### 8.3 Audit Trail
All policy violations and exceptions logged in audit system with:
- Timestamp
- User/system involved
- Policy violated
- Justification (for approved exceptions)
- Approver

### 8.4 Continuous Improvement
- Post-incident reviews feed into policy updates
- Quarterly risk assessments inform priority changes
- Industry best practices monitored and adopted
- Regulatory changes incorporated within 90 days

---

## 9. Roles & Responsibilities

| Role | Responsibilities |
|------|------------------|
| **CEO** | Ultimate accountability, resource allocation |
| **CISO** | Policy ownership, compliance oversight, risk management |
| **CTO** | Technical implementation, architecture decisions |
| **Data Protection Officer** | GDPR/POPIA compliance, data subject requests |
| **DevOps Lead** | Infrastructure security, monitoring, DR testing |
| **Legal Counsel** | Contract review, regulatory interpretation |
| **All Staff** | Policy adherence, incident reporting, security awareness |

---

## 10. Document Control

**Approved By:** CEO  
**Effective Date:** 2025-11-03  
**Next Review:** 2026-02-03  

**Version History:**
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-03 | Initial governance framework | CISO |

**Distribution:**
- Executive Team
- All Development Staff
- Board of Directors
- External Auditors (upon request)

---

*This document is confidential and proprietary to Kumii. Unauthorized distribution is prohibited.*
