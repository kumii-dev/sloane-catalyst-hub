# Customer Support System - Quick Reference Guide

**For Support Agents**  
**Version 1.0** | December 2, 2025

---

## 🚀 Getting Started

### Access the Admin Console
1. Log in to Sloane Catalyst Hub
2. Navigate to: **Admin Dashboard** → **Support Console**  
   OR go directly to: `/admin/support`
3. Verify you see the statistics dashboard (if not, contact admin to grant support_agent role)

---

## 📊 Dashboard Overview

### Statistics Cards (Top of Page)

| Metric | What It Means | Action Required |
|--------|---------------|-----------------|
| **Open Tickets** | New tickets awaiting response | Prioritize these first |
| **In Progress** | Tickets currently being handled | Complete within 24h |
| **Avg Resolution** | Average time to resolve tickets | Target: < 24 hours |
| **Urgent Tickets** | High-priority tickets (RED) | Respond within 1 hour |

---

## 🎫 Working with Tickets

### Ticket List Filters

**Search Box**: Find tickets by ticket number, subject, or customer email

**Category Filter**:
- Technical Issue
- Billing & Payments
- Account Management
- Feature Request
- Bug Report
- General Inquiry
- Security Concern
- Compliance

**Priority Filter**:
- Urgent (1 hour response)
- High (4 hour response)
- Medium (24 hour response)
- Low (72 hour response)

**Status Tabs**:
- **Active**: Open, In Progress, Waiting
- **Resolved**: Marked resolved by agent
- **Closed**: Customer confirmed or auto-closed

### Reading a Ticket

**Header Information**:
- Ticket Number (e.g., TKT-000123)
- Subject
- Category badge
- Customer name/email
- Created date

**Status Badge Colors**:
- 🔵 **Blue** = Open or In Progress
- ⏱️ **Gray** = Waiting (on customer or admin)
- ✅ **Green** = Resolved or Closed
- 🔴 **Red** = Escalated

**Priority Colors**:
- 🔴 **Red** = Urgent
- 🟠 **Orange** = High
- 🟡 **Yellow** = Medium
- 🔵 **Blue** = Low

---

## 💬 Responding to Tickets

### Assign Ticket to Yourself
1. Click ticket to open
2. Click **"Assign to Me"** button
3. Status automatically changes to "In Progress"

### Send Response
1. Type message in text box at bottom
2. **Regular Message**: Customer sees it
3. **Internal Note**: Check "Internal note" box → Only support team sees it
4. Press **Enter** to send (or Shift+Enter for new line)

### Internal Notes (Yellow Highlight)
Use internal notes for:
- Troubleshooting steps taken
- Escalation reasons
- Technical details customer doesn't need
- Communication between support agents
- Private reminders

**✅ DO**: Use for internal communication  
**❌ DON'T**: Put customer-facing responses in internal notes

### Update Ticket Status

**Status Dropdown** (top right of ticket):

| Status | When to Use |
|--------|-------------|
| **Open** | Newly created, not yet assigned |
| **In Progress** | You're actively working on it |
| **Waiting on Customer** | Need more info from customer |
| **Waiting on Admin** | Need escalation/approval |
| **Resolved** | Issue fixed, awaiting customer confirmation |
| **Closed** | Customer confirmed resolution |
| **Escalated** | Technical issue requiring senior support |

---

## 🎯 Response Time SLAs

| Priority | First Response | Resolution Target |
|----------|----------------|-------------------|
| **Urgent** | 1 hour | 4 hours |
| **High** | 4 hours | 24 hours |
| **Medium** | 24 hours | 72 hours |
| **Low** | 72 hours | 7 days |

**Tip**: Use "Urgent" tab in ticket list to catch high-priority items immediately.

---

## 📝 Best Practices

### ✅ DO

1. **Assign tickets to yourself** when you start working
2. **Use internal notes** for private communication
3. **Update status** as you progress (In Progress → Waiting → Resolved)
4. **Be specific** in responses (avoid "I'll look into it")
5. **Set expectations** (e.g., "I'll have an update for you by 3pm")
6. **Follow up** on tickets marked "Waiting on Customer" after 48 hours
7. **Mark resolved** when fixed, let customer confirm
8. **Escalate** if you need help (Status → Escalated + Internal Note)

### ❌ DON'T

1. **Don't leave tickets unassigned** if you're working on them
2. **Don't close tickets** without customer confirmation
3. **Don't use internal notes** for customer-facing responses
4. **Don't ignore urgent tickets** (respond within 1 hour)
5. **Don't duplicate work** (check if ticket already assigned)
6. **Don't forget to update status** (keeps dashboard accurate)

---

## 🔧 Common Scenarios

### Scenario 1: New Technical Issue
```
1. Click ticket → Review description
2. Click "Assign to Me"
3. Status → "In Progress"
4. Add internal note: "Investigating [issue description]"
5. Reproduce issue or gather info
6. Respond to customer with findings
7. Status → "Resolved" when fixed
8. Wait for customer confirmation
9. Status → "Closed" after 48h if no response
```

### Scenario 2: Billing Question
```
1. Click ticket → Review question
2. Click "Assign to Me"
3. Check billing records (if needed)
4. Respond with clear answer
5. If complex, add internal note: "Checked billing system, [findings]"
6. Status → "Resolved"
7. Customer confirms → Status → "Closed"
```

### Scenario 3: Need More Info
```
1. Click ticket → Initial review incomplete
2. Click "Assign to Me"
3. Status → "Waiting on Customer"
4. Respond: "To help you better, I need [specific info]"
5. Wait for customer response
6. When they reply, continue working
7. Status → "In Progress"
```

### Scenario 4: Escalation Needed
```
1. Click ticket → Issue beyond your scope
2. Click "Assign to Me"
3. Add internal note: "Escalating because [reason]. Steps taken: [list]"
4. Status → "Escalated"
5. Notify senior support via Slack/email
6. Include ticket number (TKT-XXXXXX)
7. Monitor for updates
```

---

## 🔍 Finding Tickets

### Quick Searches

| Search For | Type This |
|------------|-----------|
| Ticket by number | TKT-000123 |
| All urgent tickets | Filter: Priority → Urgent |
| Customer's tickets | customer@email.com |
| Technical issues | Filter: Category → Technical |
| Your assigned tickets | (Future feature: Filter by assignee) |

### Using Multiple Filters

1. **Category** + **Priority**: Find urgent billing issues
2. **Search** + **Status Tab**: Find specific customer's closed tickets
3. **Priority** + **Status Tab**: All urgent active tickets

---

## 📞 Escalation Process

### When to Escalate

- Security vulnerability reported
- Data breach suspected
- System-wide outage affecting multiple customers
- Compliance issue (GDPR, ISO 27001)
- Customer threatens legal action
- Technical issue beyond your expertise
- VIP customer with urgent need

### How to Escalate

1. **Set Status** → "Escalated"
2. **Add Internal Note**:
   ```
   ESCALATION REASON: [Brief description]
   STEPS TAKEN: [What you've tried]
   CUSTOMER IMPACT: [Severity/urgency]
   RECOMMENDED ACTION: [Your suggestion]
   ```
3. **Notify**:
   - Senior Support: senior-support@sloaneHub.com
   - Security Issues: security@sloaneHub.com
   - Compliance Issues: compliance@sloaneHub.com
4. **Include Ticket Number**: TKT-XXXXXX
5. **Monitor**: Check back every 2 hours for updates

---

## 🤝 Customer Communication Tips

### Opening Responses

**Good**:
> "Hi [Name], I'm [Your Name] from Sloane support. I've reviewed your ticket and will help you resolve [issue]. Let me look into this right away."

**Bad**:
> "I got your ticket. I'll check it."

### Providing Updates

**Good**:
> "I've identified the issue. It's [explanation]. I'm working on [solution] and expect to have this resolved by [time/date]."

**Bad**:
> "Still working on it."

### Resolving Issues

**Good**:
> "Great news! I've [action taken] and your [issue] should be resolved. Can you please confirm everything is working correctly?"

**Bad**:
> "Fixed."

### Following Up

**Good**:
> "I haven't heard back from you. Just checking if my previous response resolved your issue. If not, I'm happy to help further."

**Bad**:
> "Did you see my last message?"

---

## 🛠️ Troubleshooting

### Can't See Tickets
- **Check**: Do you have `support_agent` or `admin` role?
- **Solution**: Contact admin to grant role

### Real-time Updates Not Working
- **Check**: Refresh browser
- **Solution**: Clear cache, re-login

### Can't Send Message
- **Check**: Is ticket closed?
- **Solution**: Reopen ticket first (Status → "Open")

### Ticket Number Missing
- **Check**: Database issue
- **Solution**: Report to tech team immediately

---

## 📊 Performance Metrics (Personal Goals)

### Daily Targets
- [ ] Respond to all urgent tickets within 1 hour
- [ ] Resolve at least 80% of tickets assigned to you
- [ ] Maintain average resolution time < 24 hours
- [ ] Zero tickets left unassigned overnight

### Weekly Targets
- [ ] Close 95% of resolved tickets
- [ ] Follow up on all "Waiting on Customer" > 48 hours
- [ ] Maintain customer satisfaction > 4.5/5 stars
- [ ] Escalate appropriately (not too early, not too late)

---

## 📚 Additional Resources

### Internal Links
- **Help Center**: `/help-center` (Customer FAQs)
- **Admin Dashboard**: `/admin` (Platform overview)
- **System Status**: `/system-status` (Outage info)

### Contact
- **Senior Support**: senior-support@sloaneHub.com
- **IT/Tech Team**: tech@sloaneHub.com
- **Security Team**: security@sloaneHub.com
- **Escalation Hotline**: +27 (0)XX XXX XXXX

### Documentation
- Full deployment guide: `docs/CUSTOMER_SUPPORT_DEPLOYMENT.md`
- ISO 27001 compliance: `docs/CUSTOMER_SUPPORT_ISO27001_COMPLIANCE.md`

---

## 🆘 Emergency Procedures

### Security Incident
1. **Immediately**: Status → "Escalated"
2. **Internal Note**: "SECURITY INCIDENT: [details]"
3. **Email**: security@sloaneHub.com with ticket number
4. **Do NOT**: Discuss details with customer until security team advises

### System Outage
1. **Check**: System Status page
2. **If Known Issue**: Inform customer, provide status page link
3. **If Unknown**: Escalate immediately to tech team
4. **Update**: Ticket with status updates from tech team

### Angry/Threatening Customer
1. **Stay Calm**: Professional tone always
2. **De-escalate**: Acknowledge frustration, apologize
3. **Escalate**: Status → "Escalated" + Internal Note
4. **Notify**: Senior support immediately
5. **Document**: Everything in internal notes

---

## ✅ Quick Checklist (Start of Shift)

- [ ] Log in to Support Console: `/admin/support`
- [ ] Check **Urgent Tickets** count (should be 0 or working on them)
- [ ] Review **Open Tickets** (assign yourself if available)
- [ ] Follow up on **"Waiting on Customer"** > 48 hours old
- [ ] Check your **In Progress** tickets (aim to resolve today)
- [ ] Review **Statistics Dashboard** (understand current load)

---

## ✅ Quick Checklist (End of Shift)

- [ ] All urgent tickets responded to
- [ ] No unassigned tickets in your queue
- [ ] All "In Progress" tickets updated with status
- [ ] Escalated tickets have internal notes
- [ ] Handoff notes added to tickets continuing tomorrow
- [ ] Statistics reviewed (hit your targets?)

---

**Questions?** Ask senior support or check full documentation.

**Remember**: Fast, friendly, and professional support builds customer trust! 🌟
