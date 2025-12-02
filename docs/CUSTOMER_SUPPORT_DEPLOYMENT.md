# Customer Support System Deployment Guide

## Overview
This guide provides instructions for deploying the ISO 27001-compliant customer support ticketing system with chat-based messaging to the Sloane Catalyst Hub platform.

## Database Migration

### Option 1: Supabase Dashboard SQL Editor (Recommended)

1. **Navigate to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj
   - Go to SQL Editor

2. **Execute Migration File**
   - Copy the entire contents of: `supabase/migrations/20251202000001_customer_support_system.sql`
   - Paste into a new query in SQL Editor
   - Click "Run" to execute
   - Wait for confirmation (all statements should execute successfully)

3. **Enable Realtime**
   - After migration completes, enable Realtime for the support tables:
   
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
   ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_activity;
   ```

### Option 2: Supabase CLI

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/firebase sloane hub/pilot/sloane-catalyst-hub"
supabase db push
```

**Note**: Requires local Docker and Supabase CLI configured with remote database access.

## Database Schema Summary

### Tables Created

1. **support_tickets**
   - Primary customer support ticket records
   - Auto-generated ticket numbers (TKT-000000 format)
   - Status tracking: open → in_progress → resolved → closed
   - 8 categories: technical, billing, account, feature_request, bug_report, general, security, compliance
   - 4 priority levels: low, medium, high, urgent
   - Customer satisfaction ratings (1-5 stars)
   - Complete audit trail (IP, user agent, metadata)

2. **support_messages**
   - Chat-based messages within tickets
   - Sender types: customer, admin, system
   - Internal notes flag (admin-only visibility)
   - Attachment support (JSONB array)
   - Read receipts and edit tracking

3. **support_ticket_activity**
   - Complete audit log of all ticket actions
   - 13 activity types: created, status_changed, assigned, unassigned, message_added, note_added, priority_changed, category_changed, resolved, closed, reopened, escalated, rated
   - Actor tracking (customer/admin/system)
   - Change history (old_value/new_value)

### Security Features (ISO 27001 Compliant)

1. **Row Level Security (RLS)**
   - Customers can only view their own tickets
   - Admins can view all tickets
   - Internal notes hidden from customers
   - Role-based access using `user_roles` table

2. **Audit Logging**
   - Every action logged with timestamp
   - IP address and user agent captured
   - Complete change history maintained
   - Automated activity logging via triggers

3. **Data Retention**
   - Tickets archived after 6 months (resolved/closed)
   - Archived tickets deleted after 2 years
   - Complies with GDPR and ISO 27001 requirements

4. **Access Control**
   - Helper functions with SECURITY DEFINER
   - Role checks: admin, support_agent
   - Authenticated users only

### Helper Functions

1. **log_ticket_activity()**
   - Records activity with automatic last_activity_at update
   - Usage: `SELECT log_ticket_activity(ticket_id, 'status_changed', user_id, 'admin', 'open', 'in_progress', 'Assigned to support agent')`

2. **update_ticket_status()**
   - Changes ticket status with automatic logging
   - Usage: `SELECT update_ticket_status(ticket_id, 'resolved', user_id)`

3. **assign_ticket()**
   - Assigns ticket to support agent with logging
   - Usage: `SELECT assign_ticket(ticket_id, agent_id, admin_id)`

### Reporting View

**support_ticket_stats**
- Real-time aggregated statistics
- Open/in-progress/resolved/closed counts
- Urgent and high priority ticket counts
- Average resolution time (in hours)
- Tickets created in last 24 hours and 7 days
- Average customer satisfaction rating

## Application Deployment

### Frontend Components Created

1. **src/pages/CustomerSupport.tsx**
   - User-facing support ticket interface
   - Create new tickets with category/priority
   - View ticket list (active/closed tabs)
   - Real-time chat with support team
   - Search and filter capabilities
   - Route: `/support`

2. **src/pages/AdminSupportDashboard.tsx**
   - Admin support console
   - View all tickets across users
   - Filter by category, priority, status
   - Assign tickets to self
   - Update ticket status
   - Internal notes (admin-only)
   - Real-time statistics dashboard
   - Route: `/admin/support`

### Routing Configuration

Routes added to `src/App.tsx`:
- `/support` → CustomerSupport (user-facing)
- `/admin/support` → AdminSupportDashboard (admin console)

### Navigation Integration

**AppSidebar** updated with:
- New primary nav item: "Support" with HeadphonesIcon
- Secondary nav items:
  - My Tickets → `/support`
  - Help Center → `/help-center`
  - Contact Us → `/contact-us`

**AdminDashboard** updated with:
- Quick Action button: "Support Console" → `/admin/support`

## Verification Steps

### 1. Database Verification

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'support_%';

-- Verify RLS policies
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename LIKE 'support_%';

-- Check helper functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%ticket%';

-- Test reporting view
SELECT * FROM support_ticket_stats;
```

### 2. Frontend Verification

```bash
# Check for TypeScript errors
cd "/Applications/XAMPP/xamppfiles/htdocs/firebase sloane hub/pilot/sloane-catalyst-hub"
npm run typecheck

# Start development server
npm run dev
```

Access:
- User support: http://localhost:8080/support
- Admin console: http://localhost:8080/admin/support

### 3. Functional Testing

**User Flow:**
1. Navigate to `/support`
2. Click "New Ticket" button
3. Fill in subject, category, priority, description
4. Submit ticket
5. Verify ticket appears in "Active" tab
6. Click ticket to open chat interface
7. Send message to support
8. Verify message appears in thread

**Admin Flow:**
1. Navigate to `/admin/support`
2. Verify statistics cards display correctly
3. View all tickets in list
4. Filter by category/priority/status
5. Click ticket to view details
6. Click "Assign to Me"
7. Change ticket status via dropdown
8. Send response message
9. Toggle "Internal note" checkbox
10. Add internal note (verify customer doesn't see it)

**Real-time Testing:**
1. Open user view in one browser
2. Open admin view in another browser
3. Send message from user
4. Verify message appears in admin view instantly
5. Send response from admin
6. Verify response appears in user view instantly

## ISO 27001 Compliance Verification

### 1. Access Control Testing

```sql
-- Test customer can only see own tickets
SET role TO authenticated;
SET request.jwt.claims TO '{"sub": "user-id-123"}';
SELECT * FROM support_tickets; -- Should only return tickets for user-id-123

-- Test admin can see all tickets
SET role TO authenticated;
-- Verify user has admin role in user_roles table
SELECT * FROM support_tickets; -- Should return all tickets
```

### 2. Audit Logging Verification

```sql
-- Check activity logs are created
SELECT * FROM support_ticket_activity 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify IP address and user agent captured
SELECT 
  ticket_id,
  activity_type,
  actor_type,
  ip_address,
  user_agent,
  created_at
FROM support_ticket_activity
WHERE ip_address IS NOT NULL;
```

### 3. Data Retention Testing

```sql
-- Manually test archival function
SELECT archive_old_tickets(); -- Returns count of archived tickets

-- Test deletion function
SELECT delete_old_archived_tickets(); -- Returns count of deleted tickets
```

**Schedule automated retention:**
- Set up Supabase cron job or external scheduler
- Run `archive_old_tickets()` monthly
- Run `delete_old_archived_tickets()` quarterly

## Troubleshooting

### Issue: RLS policies blocking legitimate access

**Solution:**
```sql
-- Check user roles
SELECT * FROM user_roles WHERE user_id = 'your-user-id';

-- Add admin role if missing
INSERT INTO user_roles (user_id, role) VALUES ('your-user-id', 'admin');
```

### Issue: Realtime updates not working

**Solution:**
```sql
-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_activity;

-- Verify publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Issue: Ticket numbers not generating

**Solution:**
```sql
-- Check sequence exists
SELECT * FROM information_schema.sequences WHERE sequence_name = 'support_ticket_seq';

-- Reset sequence if needed
SELECT setval('support_ticket_seq', 1000, false);

-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'set_ticket_number';
```

### Issue: Helper functions not working

**Solution:**
```sql
-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_ticket_activity TO authenticated;
GRANT EXECUTE ON FUNCTION update_ticket_status TO authenticated;
GRANT EXECUTE ON FUNCTION assign_ticket TO authenticated;

-- Test function directly
SELECT log_ticket_activity(
  'ticket-id',
  'status_changed',
  'user-id',
  'admin',
  'open',
  'in_progress',
  'Testing activity log'
);
```

## Security Hardening Checklist

- [ ] RLS policies enabled on all tables
- [ ] Helper functions use SECURITY DEFINER appropriately
- [ ] Admin role checks implemented
- [ ] Realtime subscriptions use RLS
- [ ] IP addresses and user agents captured
- [ ] Data retention policies scheduled
- [ ] Audit logs immutable (no UPDATE/DELETE allowed)
- [ ] Internal notes hidden from customers
- [ ] Sensitive data encrypted at rest (Supabase default)
- [ ] SSL/TLS enforced for connections (Supabase default)

## Performance Optimization

### Indexes Created

```sql
-- support_tickets indexes (8 total)
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_last_activity ON support_tickets(last_activity_at DESC);

-- support_messages indexes (4 total)
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_sender_id ON support_messages(sender_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at ASC);
CREATE INDEX idx_support_messages_internal ON support_messages(is_internal);

-- support_ticket_activity indexes (3 total)
CREATE INDEX idx_support_ticket_activity_ticket_id ON support_ticket_activity(ticket_id);
CREATE INDEX idx_support_ticket_activity_created_at ON support_ticket_activity(created_at DESC);
CREATE INDEX idx_support_ticket_activity_actor_id ON support_ticket_activity(actor_id);
```

### Query Optimization Tips

1. Use pagination for large ticket lists
2. Filter by status/category/priority before fetching
3. Limit message history to recent messages (e.g., last 100)
4. Use `support_ticket_stats` view for dashboards instead of aggregating manually
5. Consider partitioning `support_ticket_activity` by month for high-volume systems

## Monitoring

### Key Metrics to Track

1. **Ticket Volume**
   - New tickets per day/week/month
   - Open ticket backlog
   - Tickets by category
   - Tickets by priority

2. **Response Time**
   - First response time
   - Average resolution time
   - Tickets exceeding SLA

3. **Customer Satisfaction**
   - Average rating (from customer_rating)
   - Rating distribution
   - Unrated resolved tickets

4. **Agent Performance**
   - Tickets assigned per agent
   - Average resolution time per agent
   - Tickets resolved per agent

5. **System Health**
   - Failed message deliveries
   - Realtime connection drops
   - Database query performance

### Sample Queries

```sql
-- New tickets in last 24 hours
SELECT COUNT(*) FROM support_tickets 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Average first response time
SELECT AVG(
  EXTRACT(EPOCH FROM (sm.created_at - st.created_at)) / 3600
) AS avg_first_response_hours
FROM support_tickets st
JOIN support_messages sm ON sm.ticket_id = st.id
WHERE sm.sender_type = 'admin'
AND sm.created_at = (
  SELECT MIN(created_at) FROM support_messages 
  WHERE ticket_id = st.id AND sender_type = 'admin'
);

-- Unresolved tickets by priority
SELECT priority, COUNT(*) 
FROM support_tickets 
WHERE status NOT IN ('resolved', 'closed')
GROUP BY priority
ORDER BY 
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

## Next Steps

1. **Deploy Database Migration** ✅ Priority 1
   - Execute migration in Supabase Dashboard SQL Editor
   - Enable Realtime for support tables

2. **Test Application** ✅ Priority 1
   - Run typecheck
   - Start dev server
   - Test user ticket creation flow
   - Test admin response flow
   - Verify real-time updates work

3. **Create ISO 27001 Documentation** ⏳ Priority 2
   - Document support ticket handling procedures
   - Add to security operations manual
   - Update incident response plan to include support escalation

4. **Production Deployment** ⏳ Priority 3
   - Build production bundle: `npm run build`
   - Deploy to hosting (Netlify/Vercel/etc.)
   - Verify environment variables set correctly
   - Test in production environment

5. **Training & Documentation** ⏳ Priority 4
   - Create user guide for ticket creation
   - Create admin manual for support console
   - Record video tutorial for support team
   - Add to help center

## Support

For issues with deployment or questions:
- Check troubleshooting section above
- Review Supabase logs in Dashboard
- Check browser console for frontend errors
- Review application logs
- Contact: support@sloaneHub.com

---
**Last Updated**: December 2, 2025
**Migration Version**: 20251202000001_customer_support_system
**ISO 27001 Compliant**: ✅ Yes
