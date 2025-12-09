# Live Chat Support System - Deployment Guide

## Overview
This guide covers deploying the live chat support system integrated with incident management, security operations, and SIEM dashboard with AI-powered analysis.

## Prerequisites
- Supabase project access with admin privileges
- Database migration file: `supabase/migrations/20251204000000_live_chat_support_system.sql`
- Admin or support_agent role configured in user_roles table

---

## Part 1: Database Deployment

### Step 1: Deploy the Migration

1. **Open Supabase Dashboard**: Navigate to your project at https://supabase.com/dashboard
2. **Go to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Create New Query**: Click "New Query"
4. **Copy Migration Content**: Open `supabase/migrations/20251204000000_live_chat_support_system.sql`
5. **Paste and Execute**: Paste the entire file contents and click "Run"

### Step 2: Verify Database Tables

Run this verification query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'chat_%';
```

**Expected Output:**
- chat_sessions
- chat_messages
- chat_session_activity

### Step 3: Verify Functions

```sql
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%chat%';
```

**Expected Output:**
- log_chat_activity (FUNCTION)
- analyze_chat_session (FUNCTION)
- flag_chat_security (FUNCTION)
- generate_chat_session_number (FUNCTION)
- update_chat_updated_at (FUNCTION)
- log_chat_session_creation (FUNCTION)
- log_chat_message_creation (FUNCTION)

### Step 4: Verify RLS Policies

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'chat_%'
ORDER BY tablename, policyname;
```

**Expected Output:** 11 policies total
- chat_sessions: 5 policies
- chat_messages: 4 policies
- chat_session_activity: 2 policies

### Step 5: Enable Realtime

```sql
-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_session_activity;
```

Verify realtime is enabled:

```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename LIKE 'chat_%';
```

---

## Part 2: Test Live Chat Interface

### Step 1: Start Development Server

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/firebase sloane hub/pilot/sloane-catalyst-hub"
npm run dev
```

### Step 2: Test User Chat Flow

1. Navigate to: http://localhost:8080/help/live-chat-support
2. Login as a regular user
3. Verify:
   - Session automatically created
   - Session ID displayed (CHAT-001000 format)
   - Can send messages
   - Messages appear instantly
   - Session info sidebar shows status/priority

### Step 3: Verify Database Records

```sql
-- Check created session
SELECT session_number, user_email, status, priority, created_at 
FROM chat_sessions 
ORDER BY created_at DESC 
LIMIT 1;

-- Check messages
SELECT sender_type, message, created_at 
FROM chat_messages 
WHERE session_id = (SELECT id FROM chat_sessions ORDER BY created_at DESC LIMIT 1)
ORDER BY created_at;

-- Check activity log
SELECT activity_type, actor_type, description, created_at
FROM chat_session_activity
WHERE session_id = (SELECT id FROM chat_sessions ORDER BY created_at DESC LIMIT 1)
ORDER BY created_at;
```

---

## Part 3: Integrate with Incident Management

### What Needs to Be Added

The IncidentManagement page needs a new tab for chat session analysis. This will allow admins to:
1. View unanalyzed chat sessions
2. Click "Analyze" button
3. Review session messages
4. Generate AI analysis
5. Link to incidents if needed

### Implementation Steps

1. **Add Chat Analysis Tab** to `src/pages/IncidentManagement.tsx`:
   - New TabsContent with value="chat-analysis"
   - Query chat_sessions WHERE is_analyzed = FALSE
   - Display table with session info
   - "Analyze" button for each session

2. **Create Analysis Dialog**:
   - Load all messages for selected session
   - Show AI analysis form:
     * Summary textarea
     * Sentiment dropdown
     * Risk score slider (0-100)
     * Detected issues checklist
     * Recommended actions
   - Call `analyze_chat_session()` function

3. **Link to Incidents**:
   - "Create Incident" button
   - Auto-populate incident with chat context
   - Set linked_incident_id

### Sample Code Structure

```typescript
// Add to IncidentManagement.tsx tabs
<TabsContent value="chat-analysis">
  <ChatAnalysisTab 
    onAnalyze={handleAnalyzeSession}
    onCreateIncident={handleCreateIncidentFromChat}
  />
</TabsContent>

// Analysis handler
const handleAnalyzeSession = async (sessionId: string, analysis: {
  summary: string;
  sentiment: any;
  riskScore: number;
  issues: any[];
  actions: any[];
}) => {
  const { error } = await supabase.rpc('analyze_chat_session', {
    p_session_id: sessionId,
    p_analyzer_id: user.id,
    p_ai_summary: analysis.summary,
    p_ai_sentiment: analysis.sentiment,
    p_ai_risk_score: analysis.riskScore,
    p_ai_detected_issues: analysis.issues,
    p_ai_recommended_actions: actions
  });
  
  if (!error) {
    toast.success('Session analyzed successfully');
    refetchSessions();
  }
};
```

---

## Part 4: Integrate with Security Operations

### What Needs to Be Added

SecurityOperations page needs to display flagged chat sessions.

### Implementation Steps

1. **Add Security-Flagged Chat Card**:
   - Query `security_flagged_chat_sessions` view
   - Display session_number, user_email, flag_reason, risk_score
   - Click to view full session details

2. **Add Realtime Subscription**:
   - Subscribe to chat_sessions WHERE security_flagged = TRUE
   - Show toast notification on new flagged session

### Sample Code

```typescript
// Add to SecurityOperations.tsx
const [flaggedChats, setFlaggedChats] = useState([]);

useEffect(() => {
  loadFlaggedChats();
  subscribeToFlaggedChats();
}, []);

const loadFlaggedChats = async () => {
  const { data } = await supabase
    .from('security_flagged_chat_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  setFlaggedChats(data || []);
};

const subscribeToFlaggedChats = () => {
  const channel = supabase
    .channel('flagged_chats')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'chat_sessions',
      filter: 'security_flagged=eq.true'
    }, (payload) => {
      toast.error('New security-flagged chat session!');
      loadFlaggedChats();
    })
    .subscribe();
  
  return () => supabase.removeChannel(channel);
};
```

---

## Part 5: Integrate with SIEM Dashboard

### What Needs to Be Added

SIEM Dashboard needs to show chat security events in the timeline.

### Implementation Steps

1. **Add Chat Event Type**:
   - Include chat_session_activity in event feed
   - Filter by security-related activities:
     * security_flagged
     * analyzed (if risk_score > 75)
     * incident_created

2. **Display in Timeline**:
   - Show with chat icon
   - Color code by risk level
   - Link to chat session and related incident

### Sample Code

```typescript
// Add to SIEMDashboard.tsx event query
const loadSecurityEvents = async () => {
  // Existing events...
  
  // Add chat security events
  const { data: chatEvents } = await supabase
    .from('chat_session_activity')
    .select(`
      *,
      chat_sessions (
        session_number,
        user_email,
        ai_risk_score,
        security_flag_reason
      )
    `)
    .in('activity_type', ['security_flagged', 'analyzed', 'incident_created'])
    .order('created_at', { ascending: false })
    .limit(50);
  
  // Merge with existing events and sort by timestamp
  const allEvents = [...existingEvents, ...chatEvents].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  
  setEvents(allEvents);
};
```

---

## Part 6: AI Analysis Workflow

### Complete Workflow

1. **User Opens Chat** → Session created with is_analyzed = FALSE
2. **User Sends Messages** → Messages logged, activity tracked
3. **Admin Views Unanalyzed Sessions** → Sees session in IncidentManagement "Chat Analysis" tab
4. **Admin Clicks "Analyze"** → Opens dialog with all messages
5. **Admin Reviews & Generates AI Summary** → Fills form with analysis
6. **Admin Clicks "Save Analysis"** → Calls analyze_chat_session() function
7. **Database Updates** → Sets is_analyzed = TRUE, stores AI data
8. **AI Agents Process** → Now visible to AI agents for incident correlation
9. **If High Risk** → Auto-flag for security review
10. **Admin Creates Incident** → Links chat to incident, appears in SIEM

### Manual vs Automated

**Manual Steps (Admin Required):**
- Click "Analyze" button
- Review messages
- Enter AI summary
- Set risk score
- Save analysis

**Automated Steps (After Analysis):**
- AI agents detect patterns
- Correlate with other incidents
- Auto-flag high-risk sessions (risk_score > 75)
- Log to SIEM
- Update SecurityOperations dashboard

---

## Part 7: Testing Checklist

### User Flow Tests
- [ ] User can start chat session
- [ ] User can send messages
- [ ] Messages appear in real-time
- [ ] Session info displays correctly
- [ ] Session persists across page refreshes

### Admin Flow Tests
- [ ] Admin sees unanalyzed sessions
- [ ] Admin can click "Analyze"
- [ ] Analysis form displays all messages
- [ ] Can generate AI summary
- [ ] Analysis saves successfully
- [ ] Session marked as analyzed

### Security Integration Tests
- [ ] High-risk sessions auto-flagged
- [ ] Flagged sessions appear in SecurityOperations
- [ ] Can create incident from chat
- [ ] Incident linked to chat session

### SIEM Integration Tests
- [ ] Chat events appear in SIEM timeline
- [ ] Events color-coded by risk
- [ ] Can click event to view session
- [ ] Correlation with other security events

---

## Part 8: Monitoring & Maintenance

### Database Queries for Monitoring

```sql
-- Active chat sessions
SELECT COUNT(*) FROM chat_sessions WHERE status IN ('active', 'waiting', 'assigned');

-- Average resolution time (in minutes)
SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) 
FROM chat_sessions 
WHERE resolved_at IS NOT NULL;

-- High-risk sessions (need attention)
SELECT session_number, user_email, ai_risk_score, security_flag_reason
FROM chat_sessions
WHERE ai_risk_score > 75
AND status NOT IN ('resolved', 'closed')
ORDER BY ai_risk_score DESC;

-- Today's statistics
SELECT * FROM chat_session_stats;

-- Security events today
SELECT COUNT(*) 
FROM chat_session_activity 
WHERE activity_type IN ('security_flagged', 'incident_created')
AND created_at > CURRENT_DATE;
```

### Performance Optimization

1. **Archive Old Sessions**:
```sql
UPDATE chat_sessions 
SET is_archived = TRUE, archived_at = NOW()
WHERE status = 'closed' 
AND resolved_at < NOW() - INTERVAL '90 days';
```

2. **Index Maintenance**:
```sql
REINDEX TABLE chat_sessions;
REINDEX TABLE chat_messages;
REINDEX TABLE chat_session_activity;
```

---

## Part 9: Security Considerations

### Data Protection
- ✅ RLS policies enforce user isolation
- ✅ Admin/agent roles required for full access
- ✅ Internal messages hidden from customers
- ✅ Activity log tracks all actions
- ✅ IP address and user agent logged

### Compliance (ISO 27001)
- ✅ Complete audit trail via chat_session_activity
- ✅ Data retention with archival system
- ✅ AI analysis requires manual admin trigger
- ✅ Security flagging workflow
- ✅ Incident linkage for compliance reporting

### Access Control
```sql
-- Verify user has correct role
SELECT * FROM user_roles 
WHERE user_id = auth.uid() 
AND role IN ('admin', 'support_agent');
```

---

## Part 10: Troubleshooting

### Issue: Session not creating
**Check:**
```sql
SELECT * FROM auth.users WHERE id = 'USER_ID';
```
**Solution:** Ensure user is authenticated

### Issue: Messages not appearing
**Check realtime:**
```sql
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```
**Solution:** Enable realtime (Part 1, Step 5)

### Issue: RLS blocking access
**Check policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';
```
**Solution:** Verify user_roles table has correct entries

### Issue: Analysis function fails
**Check:**
```sql
SELECT * FROM chat_sessions WHERE id = 'SESSION_ID';
```
**Solution:** Ensure session exists and user has admin role

---

## Part 11: Next Steps

### Immediate Actions
1. ✅ Deploy database migration (Part 1)
2. ✅ Test live chat interface (Part 2)
3. ⏳ Build ChatAnalysisTab component (Part 3)
4. ⏳ Add flagged chats to SecurityOperations (Part 4)
5. ⏳ Integrate SIEM events (Part 5)

### Future Enhancements
- AI-powered auto-analysis (OpenAI/Azure AI integration)
- Sentiment analysis using ML models
- Automated security pattern detection
- Chat bot for common questions
- Multi-language support
- Voice/video chat capabilities

---

## Support

For questions or issues:
- Check Supabase logs in Dashboard → Logs
- Review browser console for frontend errors
- Check PostgreSQL logs for database issues
- Verify RLS policies are not blocking access

---

**Last Updated:** December 4, 2024
**Version:** 1.0.0
**Status:** Database Ready, LiveChat Built, Integration Pending
