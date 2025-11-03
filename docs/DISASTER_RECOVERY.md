# Disaster Recovery Plan

## 22 On Sloane Platform - Business Continuity & Disaster Recovery

**Document Version:** 1.0  
**Last Updated:** 2025-11-03  
**Owner:** CTO  
**Classification:** Confidential

---

## 1. Executive Summary

This Disaster Recovery Plan (DRP) outlines procedures to restore the 22 On Sloane platform following a disruption. The plan defines Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for critical systems, assigns responsibilities, and provides step-by-step recovery procedures.

**Key Metrics:**
- **Primary RTO**: 4 hours (for P0/P1 services)
- **Primary RPO**: 15 minutes (for critical data)
- **Maximum Tolerable Downtime**: 24 hours
- **Last Tested**: [To be scheduled - Quarterly]
- **Next Test Date**: [To be scheduled]

---

## 2. Recovery Objectives

### 2.1 Service Priority Matrix

| Service | Priority | RTO | RPO | Business Impact |
|---------|----------|-----|-----|-----------------|
| **Authentication** | P0 | 1 hour | 0 (live replication) | Complete platform inaccessible |
| **Database (Core)** | P0 | 1 hour | 15 minutes | All services impacted |
| **Mentorship Sessions** | P1 | 4 hours | 15 minutes | Revenue loss, user dissatisfaction |
| **Credit Assessments** | P1 | 8 hours | 1 hour | Business operations disrupted |
| **Messaging** | P1 | 4 hours | 15 minutes | User communication breakdown |
| **Marketplace Listings** | P2 | 24 hours | 4 hours | Service discovery impacted |
| **File Storage** | P2 | 24 hours | 1 hour | Document access disrupted |
| **Analytics/Reporting** | P3 | 72 hours | 24 hours | Minimal immediate impact |

### 2.2 RTO/RPO Definitions

**Recovery Time Objective (RTO):** Maximum acceptable time to restore a service after disruption.

**Recovery Point Objective (RPO):** Maximum acceptable data loss measured in time.

**Maximum Tolerable Downtime (MTD):** Point at which business cannot continue operations.

---

## 3. Disaster Scenarios

### 3.1 Scenario Classification

| Scenario | Likelihood | Impact | Priority |
|----------|-----------|--------|----------|
| **Regional Cloud Outage** | Low | Critical | P0 |
| **Database Corruption** | Medium | High | P0 |
| **Ransomware/Cyberattack** | Medium | Critical | P0 |
| **Accidental Data Deletion** | High | Medium | P1 |
| **Edge Function Failure** | Medium | Medium | P1 |
| **Storage Bucket Compromise** | Low | Medium | P2 |
| **Third-Party API Outage** | High | Low-Medium | P2-P3 |
| **Human Error (Code Deployment)** | High | Low-High | P1-P2 |

---

## 4. Recovery Procedures

### 4.1 Scenario: Regional Cloud Outage (Supabase)

**Detection:**
- Health check monitoring fails
- Users report inability to access platform
- Supabase status page indicates outage

**Immediate Response (0-15 minutes):**
1. **Verify Outage:**
   ```bash
   # Check Supabase status
   curl https://status.supabase.com/api/v2/status.json
   
   # Verify database connectivity
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Activate Incident Response:**
   - Notify Incident Commander (CTO)
   - Alert stakeholders (CEO, CISO, DevOps Lead)
   - Post status update to users (status page/social media)

3. **Assess Scope:**
   - Which regions are affected?
   - Is it partial or complete outage?
   - Estimated resolution time from Supabase?

**Recovery Steps (15 minutes - 2 hours):**

**Option A: Wait for Supabase Recovery (Preferred)**
- If Supabase ETA < 2 hours, monitor and communicate
- Continue status updates every 30 minutes

**Option B: Failover to Secondary Region (If configured)**
1. **Update DNS:**
   ```bash
   # Point domain to secondary Supabase project
   # Update CNAME records in DNS provider
   ```

2. **Verify Data Replication:**
   ```bash
   # Check replication lag
   psql $SECONDARY_DATABASE_URL -c "
     SELECT now() - pg_last_xact_replay_timestamp() AS lag;
   "
   ```

3. **Update Environment Variables:**
   ```bash
   # Update all edge functions and frontend
   SUPABASE_URL=<secondary_url>
   SUPABASE_ANON_KEY=<secondary_key>
   ```

4. **Redeploy Frontend:**
   ```bash
   # Update production build
   git checkout main
   git pull
   # Deploy via Lovable platform
   ```

**Option C: Restore to New Supabase Project (Last Resort)**
1. **Create New Supabase Project:**
   - Go to https://supabase.com/dashboard
   - Create new project in different region

2. **Restore Database from Backup:**
   ```bash
   # Download latest backup from Supabase
   supabase db dump --db-url $OLD_DATABASE_URL > backup.sql
   
   # Restore to new project
   psql $NEW_DATABASE_URL < backup.sql
   ```

3. **Migrate Storage Buckets:**
   ```bash
   # Script to copy all storage objects
   # (Implement migration script)
   ```

4. **Update All Configurations:**
   - Environment variables
   - DNS records
   - API keys

**Validation (30 minutes):**
```bash
# Health checks
curl https://yourplatform.com/health

# Test authentication
# Test database reads/writes
# Test edge functions
# Test storage access
```

**Post-Recovery:**
- Conduct incident retrospective within 48 hours
- Document lessons learned
- Update DRP with improvements
- Test failover procedures

**RTO Achievement:** 2-4 hours  
**RPO Achievement:** 15 minutes (PITR)

---

### 4.2 Scenario: Database Corruption

**Detection:**
- Database errors in logs
- Data integrity check failures
- User reports of missing/incorrect data

**Immediate Response (0-15 minutes):**
1. **Isolate Issue:**
   ```sql
   -- Check for corruption
   SELECT pg_database.datname, pg_database_size(pg_database.datname)
   FROM pg_database;
   
   -- Check table integrity
   SELECT schemaname, tablename, pg_relation_size(schemaname||'.'||tablename)
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

2. **Stop All Writes:**
   ```sql
   -- Revoke write permissions temporarily
   REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;
   ```

3. **Take Snapshot:**
   ```bash
   # Immediate backup before any recovery attempts
   pg_dump $DATABASE_URL > corruption_snapshot_$(date +%Y%m%d_%H%M%S).sql
   ```

**Recovery Steps (15 minutes - 4 hours):**

**Option A: Point-in-Time Recovery (Preferred)**
1. **Identify Last Known Good Time:**
   ```sql
   -- Review audit logs
   SELECT * FROM audit_logs
   WHERE timestamp < now() - interval '1 hour'
   ORDER BY timestamp DESC
   LIMIT 100;
   ```

2. **Restore via Supabase Dashboard:**
   - Go to Database → Backups
   - Select PITR (Point-in-Time Recovery)
   - Choose timestamp before corruption
   - Initiate restore (creates new database)

3. **Validate Restored Data:**
   ```sql
   -- Check critical tables
   SELECT count(*) FROM profiles;
   SELECT count(*) FROM credit_assessments;
   SELECT max(created_at) FROM profiles;
   ```

**Option B: Restore from Daily Backup**
1. **Download Backup:**
   - Supabase Dashboard → Database → Backups
   - Select most recent daily backup

2. **Create New Database:**
   ```bash
   createdb recovery_db
   ```

3. **Restore Backup:**
   ```bash
   psql recovery_db < backup_file.sql
   ```

4. **Merge Recent Data (Manual):**
   - Export data created after backup timestamp
   - Manual merge into restored database
   - Validate with stakeholders

**Validation:**
```sql
-- Data integrity checks
SELECT 
  'profiles' as table_name,
  count(*) as row_count,
  max(created_at) as latest_record
FROM profiles
UNION ALL
SELECT 
  'credit_assessments',
  count(*),
  max(created_at)
FROM credit_assessments;

-- Check for orphaned records
SELECT * FROM messages 
WHERE conversation_id NOT IN (SELECT id FROM conversations);
```

**Post-Recovery:**
- Root cause analysis (corrupted migration? hardware failure?)
- Restore write permissions
- Monitor database health for 48 hours
- Update backup/monitoring procedures

**RTO Achievement:** 4 hours  
**RPO Achievement:** 1 hour (depending on backup)

---

### 4.3 Scenario: Ransomware/Cyberattack

**Detection:**
- Unusual encryption activity
- Mass file deletions
- Ransom demand notice
- Security monitoring alerts

**Immediate Response (0-5 minutes - CRITICAL):**
1. **ISOLATE IMMEDIATELY:**
   ```bash
   # Disconnect affected systems
   # Revoke all API keys
   supabase secrets unset --all
   
   # Disable authentication temporarily
   # (via Supabase Dashboard → Authentication → Settings)
   ```

2. **Activate Incident Response Team:**
   - CTO (Incident Commander)
   - CISO (Security Lead)
   - Legal Counsel
   - External Security Consultant (if needed)

3. **Preserve Evidence:**
   - Do NOT modify affected systems
   - Capture memory dumps
   - Save all logs
   - Document timeline

**Assessment (5-30 minutes):**
1. **Determine Scope:**
   - Which systems are compromised?
   - When did breach occur?
   - What data was accessed/encrypted?
   - Is ransomware still active?

2. **Identify Attack Vector:**
   - Review access logs
   - Check for unauthorized accounts
   - Analyze malware (if safe)

**Recovery Steps (1-24 hours):**

**DO NOT PAY RANSOM**

1. **Eradicate Threat:**
   - Identify and remove malware
   - Close attack vector (patch vulnerability)
   - Reset ALL credentials
   - Rotate ALL API keys
   - Change ALL passwords

2. **Restore from Clean Backups:**
   ```bash
   # Use backup from BEFORE infection date
   # Verify backup is clean (scan for malware)
   
   # Restore database
   psql $NEW_DATABASE_URL < clean_backup.sql
   
   # Restore storage (from immutable backups)
   # Use Supabase backup system
   ```

3. **Rebuild Compromised Systems:**
   - Fresh Supabase project (if needed)
   - Redeploy all edge functions from version control
   - Redeploy frontend from clean build

4. **Strengthen Security:**
   ```sql
   -- Enable MFA for all admin accounts
   -- Implement stricter RLS policies
   -- Add additional monitoring
   ```

**Validation:**
- Full security scan
- Penetration testing
- Third-party security audit
- Monitor for 7 days before declaring "all clear"

**Communication:**
- **Internal:** Immediate notification to all staff
- **Users:** Within 24 hours if data compromised
- **Regulatory:** Within 72 hours (POPIA/GDPR)
- **Law Enforcement:** Report cybercrime

**Post-Incident:**
- Full forensic analysis
- Implement additional security controls
- Update incident response procedures
- Consider cyber insurance claim

**RTO Achievement:** 8-24 hours  
**RPO Achievement:** Varies (depends on last clean backup)

---

### 4.4 Scenario: Accidental Data Deletion

**Detection:**
- User reports missing data
- Admin notices deletion in logs
- Audit logs show unexpected DELETE operations

**Immediate Response (0-10 minutes):**
1. **Verify Deletion:**
   ```sql
   -- Check audit logs
   SELECT * FROM audit_logs
   WHERE action = 'DELETE'
     AND timestamp > now() - interval '1 hour'
   ORDER BY timestamp DESC;
   ```

2. **Stop Further Deletions:**
   ```sql
   -- Temporarily revoke delete permissions
   REVOKE DELETE ON affected_table FROM authenticated;
   ```

**Recovery Steps (10 minutes - 2 hours):**

**Option A: Restore from PITR (If within 7 days)**
1. **Identify Deletion Time:**
   - Check audit logs for exact timestamp

2. **Export Deleted Records:**
   ```bash
   # Create temporary recovery database with PITR
   # Query deleted records
   psql $PITR_DATABASE_URL -c "
     SELECT * FROM profiles WHERE id IN (<deleted_ids>);
   " > deleted_records.sql
   ```

3. **Restore to Production:**
   ```sql
   -- Insert deleted records back
   INSERT INTO profiles SELECT * FROM deleted_records;
   ```

**Option B: Restore from Backup (If older than 7 days)**
- Use daily backup closest to deletion
- Extract deleted records manually
- Merge with current database

**Validation:**
```sql
-- Verify restored records
SELECT count(*) FROM profiles WHERE id IN (<deleted_ids>);

-- Check related records (foreign keys)
SELECT * FROM startup_profiles WHERE user_id IN (<deleted_ids>);
```

**Prevention:**
- Implement soft deletes (deleted_at column)
- Require admin approval for bulk deletions
- Add confirmation dialogs in UI
- Implement delete throttling

**RTO Achievement:** 1-2 hours  
**RPO Achievement:** 0-15 minutes

---

### 4.5 Scenario: Edge Function Failure

**Detection:**
- Sentry alerts for function errors
- Users report feature unavailable
- Health checks failing

**Immediate Response (0-15 minutes):**
1. **Check Logs:**
   ```bash
   # View edge function logs
   supabase functions logs <function-name> --limit 100
   ```

2. **Identify Issue:**
   - Code error?
   - API dependency down (OpenAI, ElevenLabs)?
   - Rate limit exceeded?
   - Configuration issue?

**Recovery Steps (15 minutes - 1 hour):**

**Option A: Rollback to Previous Version**
```bash
# Redeploy last working version
git log --oneline supabase/functions/<function-name>/
git checkout <previous-commit>
supabase functions deploy <function-name>

# Verify
curl -X POST https://<project>.supabase.co/functions/v1/<function-name> \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"test": true}'
```

**Option B: Quick Fix & Deploy**
```bash
# Fix code
vim supabase/functions/<function-name>/index.ts

# Test locally (if possible)
# Deploy
supabase functions deploy <function-name>

# Monitor for errors
supabase functions logs <function-name> --stream
```

**Option C: Disable Temporarily**
- Remove function calls from frontend
- Display maintenance message
- Route to alternative solution (if available)

**Validation:**
- Test end-to-end functionality
- Check error rates in Sentry
- Monitor for 30 minutes

**RTO Achievement:** 1 hour  
**RPO Achievement:** N/A (no data loss)

---

## 5. Backup Strategy

### 5.1 Database Backups

**Automated (Supabase):**
- **Continuous PITR**: Every transaction logged, 7-day retention
- **Daily Full Backups**: Automated, 30-day retention
- **Weekly Backups**: Automated, 90-day retention
- **Monthly Backups**: Manual export, 1-year retention

**Manual Backups (Before Major Changes):**
```bash
# Full database dump
pg_dump $DATABASE_URL > manual_backup_$(date +%Y%m%d).sql

# Compress
gzip manual_backup_$(date +%Y%m%d).sql

# Upload to secure storage
# (S3, Google Cloud Storage, or encrypted external drive)
```

**Backup Testing:**
- Monthly: Restore to test environment and validate
- Quarterly: Full DR drill with production backup

### 5.2 Storage Backups

**Supabase Storage:**
- **Cross-Region Replication**: Enabled by default (3 copies)
- **Versioning**: Enabled for all buckets
- **Lifecycle Policies**: Archive to cold storage after 90 days

**Critical Files Backup:**
```bash
# Weekly backup script
for bucket in profile-pictures assessment-documents listing-images files; do
  supabase storage download $bucket --recursive --destination ./backups/$bucket/
done

# Upload to external storage
rclone sync ./backups/ remote:22onsloane-backups/
```

### 5.3 Code Backups

**Version Control (Primary):**
- Git repository (GitHub/GitLab)
- Multiple remotes (origin + backup remote)
- Daily automated pushes

**Configuration Backups:**
```bash
# Export all Supabase configuration
supabase db dump --schema-only > schema_backup.sql
supabase secrets list > secrets_list.txt (names only, not values)

# Edge functions code
tar -czf edge_functions_$(date +%Y%m%d).tar.gz supabase/functions/
```

### 5.4 Backup Locations

| Backup Type | Primary Location | Secondary Location | Retention |
|-------------|------------------|-------------------|-----------|
| Database PITR | Supabase (same region) | N/A | 7 days |
| Database Daily | Supabase (cross-region) | External S3 bucket | 30 days |
| Storage Files | Supabase Storage | External backup service | 90 days |
| Code | GitHub | GitLab mirror | Indefinite |
| Configuration | Supabase | Encrypted local copy | Indefinite |

---

## 6. Communication Plan

### 6.1 Internal Notification Tree

```
                    ┌──────────┐
                    │   CTO    │ (Incident Commander)
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │  CISO   │    │   CEO   │    │ DevOps  │
    │         │    │         │    │  Lead   │
    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │
         │              │              ▼
         │              │         ┌─────────┐
         │              │         │Dev Team │
         │              │         └─────────┘
         │              ▼
         │         ┌─────────┐
         │         │  COO    │
         │         └────┬────┘
         │              │
         │              ▼
         │         ┌─────────┐
         │         │ Support │
         │         │  Team   │
         │         └─────────┘
         ▼
    ┌─────────┐
    │  Legal  │
    └─────────┘
```

### 6.2 External Communication

**Users:**
- **Status Page**: https://status.22onsloane.com (create with Statuspage.io or similar)
- **Email**: To all active users (if > 1 hour downtime)
- **Social Media**: Twitter/LinkedIn updates
- **In-App Banner**: When platform partially operational

**Templates:**
- Initial incident notification
- Hourly updates during outage
- Resolution notification
- Post-mortem summary (24-48 hours after)

**Regulatory:**
- POPIA/GDPR breach notification (if data compromised)
- Industry-specific regulators (if applicable)

**Media:**
- Only via designated spokesperson (CEO/COO)
- Pre-approved statements only

### 6.3 Communication Channels

| Scenario | Internal | External |
|----------|----------|----------|
| **P0 Incident** | Slack #incident-response, Phone calls | Status page, Email blast |
| **P1 Incident** | Slack #incident-response | Status page |
| **P2 Incident** | Slack #engineering | In-app banner |
| **P3 Incident** | Slack #engineering | Release notes |

---

## 7. Roles & Responsibilities

### 7.1 Incident Response Team

| Role | Primary | Backup | Responsibilities |
|------|---------|--------|------------------|
| **Incident Commander** | CTO | DevOps Lead | Overall coordination, decision making |
| **Technical Lead** | Lead Developer | Senior Developer | Execute recovery procedures |
| **Communications Lead** | COO | Marketing Manager | Internal/external communication |
| **Security Lead** | CISO | Security Consultant | Security assessment, threat analysis |
| **Documentation Lead** | DevOps Lead | Technical Writer | Timeline documentation, post-mortem |

### 7.2 On-Call Schedule
- **24/7 Rotation**: DevOps engineers
- **Business Hours**: Full IRT available
- **After Hours**: On-call engineer + escalation to CTO for P0/P1
- **Contact Methods**: Phone (primary), SMS, Slack

---

## 8. Testing & Validation

### 8.1 Testing Schedule

| Test Type | Frequency | Last Conducted | Next Scheduled |
|-----------|-----------|----------------|----------------|
| **Backup Restoration** | Monthly | TBD | TBD |
| **Failover Drill** | Quarterly | TBD | TBD |
| **Tabletop Exercise** | Bi-annually | TBD | TBD |
| **Full DR Simulation** | Annually | TBD | TBD |

### 8.2 Test Scenarios

**Monthly: Backup Restoration Test**
1. Select random backup from last 30 days
2. Restore to test environment
3. Validate data integrity
4. Document time taken vs. RTO
5. Record any issues encountered

**Quarterly: Failover Drill**
1. Simulate primary region failure
2. Execute failover procedures
3. Validate all services operational
4. Measure RTO/RPO achievement
5. Conduct team retrospective

**Annually: Full DR Simulation**
1. Unannounced drill (during low-traffic period)
2. Simulate catastrophic failure
3. Execute complete recovery
4. Involve all IRT members
5. Comprehensive post-mortem

### 8.3 Success Criteria

✅ **Pass:**
- RTO achieved for all P0/P1 services
- RPO within acceptable limits
- All services fully operational
- No data loss beyond RPO
- Communication plan executed successfully

❌ **Fail:**
- RTO exceeded by > 50%
- Data loss beyond RPO
- Critical services remain unavailable
- Poor communication/coordination

---

## 9. Continuous Improvement

### 9.1 Post-Incident Review Process

**Within 48 Hours:**
1. Incident timeline documentation
2. Root cause analysis
3. IRT retrospective meeting

**Within 7 Days:**
4. Post-mortem report (5 Whys, Fishbone diagram)
5. Action items identified and assigned
6. DRP updates proposed

**Within 30 Days:**
7. Action items completed
8. DRP updated and approved
9. Team training conducted
10. Lessons learned shared company-wide

### 9.2 Metrics & KPIs

Track over time:
- **Mean Time to Detect (MTTD)**: How quickly incidents identified
- **Mean Time to Respond (MTTR)**: How quickly recovery initiated
- **RTO Achievement Rate**: % of incidents meeting RTO
- **RPO Achievement Rate**: % of incidents meeting RPO
- **Backup Success Rate**: % of successful backups
- **Test Drill Performance**: Time vs. target for each drill

**Target:**
- MTTD: < 15 minutes
- MTTR: < 1 hour for P0, < 4 hours for P1
- RTO Achievement: > 95%
- Backup Success: > 99.5%

### 9.3 Annual Review

**Checklist:**
- [ ] Review all RTOs/RPOs against current business needs
- [ ] Update contact information for all IRT members
- [ ] Verify backup and monitoring systems operational
- [ ] Review third-party dependencies and alternatives
- [ ] Update threat landscape assessment
- [ ] Validate insurance coverage
- [ ] Update documentation with lessons learned
- [ ] Conduct stakeholder review and approval

---

## 10. Dependencies & Alternatives

### 10.1 Critical Third-Party Services

| Service | Purpose | Alternative | Failover Plan |
|---------|---------|-------------|---------------|
| **Supabase** | Database, Auth, Storage | Self-hosted PostgreSQL + Auth0 + S3 | 72-hour migration plan documented |
| **Daily.co** | Video calls | Zoom API, Agora.io | Feature degradation acceptable |
| **OpenAI** | AI analysis | Anthropic Claude, local models | Graceful degradation |
| **ElevenLabs** | Voice synthesis | Google Cloud Text-to-Speech | Feature optional |
| **Resend** | Email delivery | SendGrid, Amazon SES | 4-hour switchover |
| **Sentry** | Error monitoring | LogRocket, Datadog | Not critical for operations |

### 10.2 Vendor Continuity Contacts

- **Supabase Support**: support@supabase.com (Premium SLA)
- **Daily.co Support**: support@daily.co
- **OpenAI Support**: Via dashboard
- **Lovable Platform**: support@lovable.dev

---

## 11. Appendices

### Appendix A: Contact List
[To be populated with emergency contacts]

### Appendix B: System Architecture Diagram
[Reference: docs/ARCHITECTURE.md]

### Appendix C: Backup Restoration Scripts
[Stored in: scripts/disaster-recovery/]

### Appendix D: Communication Templates
[Stored in: docs/incident-response-templates/]

### Appendix E: Regulatory Requirements
- POPIA Section 22: Breach notification within reasonable time
- GDPR Article 33: Breach notification within 72 hours
- ISO 27001 A.17: Business continuity requirements

---

**Document Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | [Name] | [Signature] | 2025-11-03 |
| CISO | [Name] | [Signature] | 2025-11-03 |
| CEO | [Name] | [Signature] | 2025-11-03 |

**Distribution:**
- Executive Team
- IT Staff
- Security Team
- Board of Directors

---

*This document contains confidential information. Handle according to data classification policy.*
