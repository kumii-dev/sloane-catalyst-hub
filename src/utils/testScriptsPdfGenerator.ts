import jsPDF from 'jspdf';

interface TestScript {
  name: string;
  description: string;
  code: string;
}

export const generateTestScriptsPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 5;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add text with word wrap and page breaks
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCode: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      if (isCode) {
        pdf.setTextColor(60, 60, 60);
        pdf.text(line, margin + 5, yPosition);
      } else {
        pdf.setTextColor(0, 0, 0);
        pdf.text(line, margin, yPosition);
      }
      
      yPosition += lineHeight;
    });
  };

  const addSection = (title: string, content: string) => {
    // Add some spacing before section
    yPosition += 5;
    
    // Add title
    addText(title, 12, true);
    yPosition += 2;
    
    // Add horizontal line
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    // Add content
    addText(content, 9, false, true);
    yPosition += 3;
  };

  // Cover Page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Kumii Platform', pageWidth / 2, 40, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.text('Load Testing Suite', pageWidth / 2, 50, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Comprehensive k6 Test Scripts', pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 70, { align: 'center' });

  // Add logo placeholder
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(pageWidth / 2 - 20, 80, 40, 40);
  pdf.text('KUMII', pageWidth / 2, 103, { align: 'center' });

  pdf.addPage();
  yPosition = margin;

  // Table of Contents
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', margin, yPosition);
  yPosition += 10;

  const toc = [
    '1. Overview',
    '2. Configuration',
    '3. Authentication Flow Test',
    '4. Mentorship Booking Flow Test',
    '5. Credit Assessment Flow Test',
    '6. Marketplace Flow Test',
    '7. Funding Application Flow Test',
    '8. Main Load Test',
    '9. Setup Instructions',
  ];

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  toc.forEach(item => {
    pdf.text(item, margin + 5, yPosition);
    yPosition += 7;
  });

  pdf.addPage();
  yPosition = margin;

  // 1. Overview
  addSection('1. OVERVIEW', `
The Kumii Platform Load Testing Suite is a comprehensive set of k6 tests designed to assess the performance, reliability, and scalability of the eCommerce platform under various load conditions.

Key Features:
- Multiple test scenarios (baseline, stress, spike, soak)
- Authentication and session management testing
- End-to-end user journey validation
- Credit transaction and payment flow testing
- AI-powered credit assessment performance testing
- Real-time metrics and reporting

Test Suites Included:
1. Authentication Flow - Tests user sign-in and session management
2. Mentorship Booking - Tests the complete booking workflow
3. Credit Assessment - Tests AI-powered assessment generation
4. Marketplace Browsing - Tests listing and search performance
5. Funding Application - Tests application submission flow
6. Main Load Test - Mixed realistic user journeys
`);

  // 2. Configuration
  addSection('2. CONFIGURATION (config.js)', `
// Supabase Configuration
export const config = {
  supabaseUrl: 'https://qypazgkngxhazgkuevwq.supabase.co',
  supabaseAnonKey: '[ANON_KEY]',
  
  // Test Users
  testUsers: [
    { email: 'loadtest1@example.com', password: 'TestPass123!' },
    { email: 'loadtest2@example.com', password: 'TestPass123!' },
    // ... more users
  ],

  // Performance Thresholds
  thresholds: {
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
    'http_req_failed': ['rate<0.05'],
    'booking_duration': ['p(95)<3000'],
    'assessment_duration': ['p(95)<5000'],
  },
};
`);

  // 3. Authentication Flow
  addSection('3. AUTHENTICATION FLOW TEST (auth-flow.js)', `
Purpose: Test user authentication and session management
Expected Performance: <1s response time, <1% failure rate

Key Test Points:
- User sign-in with email/password
- Access token generation
- Session validation
- User data retrieval

Usage:
k6 run auth-flow.js

Example Code:
import { config, getRandomUser, getAnonHeaders } from './config.js';

export default function() {
  const user = getRandomUser();
  
  const signInRes = http.post(
    \`\${config.supabaseUrl}/auth/v1/token?grant_type=password\`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: getAnonHeaders() }
  );

  check(signInRes, {
    'sign in successful': (r) => r.status === 200,
    'access token received': (r) => JSON.parse(r.body).access_token !== undefined,
  });
}
`);

  // 4. Mentorship Booking Flow
  addSection('4. MENTORSHIP BOOKING FLOW TEST (mentorship-flow.js)', `
Purpose: Test complete mentorship booking journey
Expected Performance: <3s booking time, <5% failure rate

Test Journey:
1. User Authentication
2. Browse Available Mentors
3. View Mentor Profile
4. Check Mentor Availability
5. Check Credit Balance
6. Create Booking Session

Key Metrics:
- booking_duration: Time to complete booking
- booking_success: Number of successful bookings
- booking_failure: Number of failed bookings

Usage:
k6 run mentorship-flow.js

Critical Path:
Auth → Browse → Profile → Availability → Credits → Book → Payment
`);

  // 5. Credit Assessment Flow
  addSection('5. CREDIT ASSESSMENT FLOW TEST (credit-assessment-flow.js)', `
Purpose: Test AI-powered credit assessment generation
Expected Performance: <5s analysis time (includes AI processing)

Test Journey:
1. User Authentication
2. Get/Create Startup Profile
3. Submit Assessment Data (10 domains)
4. Trigger AI Analysis via Edge Function
5. Validate Score Generation

Assessment Domains:
- Business Profile (age, industry, model)
- Financial Health (revenue, burn rate, margins)
- Repayment Behaviour (credit history)
- Market Access (customer base, growth)
- Operational Capacity (team, management)
- Technology & Innovation
- Compliance (regulatory, tax)
- Skills & Certifications
- Governance Structure
- Social & Environmental Impact

Usage:
k6 run credit-assessment-flow.js
`);

  // 6. Marketplace Flow
  addSection('6. MARKETPLACE FLOW TEST (marketplace-flow.js)', `
Purpose: Test marketplace browsing and search functionality
Expected Performance: <1.5s response time

Test Journey:
1. User Authentication
2. Browse Active Listings (with joins)
3. Filter by Category
4. Search Listings
5. View Listing Details (with reviews)

Key Performance Indicators:
- marketplace_browse_time: Time to load listings
- marketplace_search_time: Search query performance

Database Query Patterns:
- Complex joins (listings + categories + providers)
- Full-text search on titles
- Filter by multiple criteria
- Pagination and sorting

Usage:
k6 run marketplace-flow.js
`);

  // 7. Funding Application Flow
  addSection('7. FUNDING APPLICATION FLOW TEST (funding-application-flow.js)', `
Purpose: Test funding opportunity application process
Expected Performance: <3s application submission

Test Journey:
1. User Authentication
2. Get Startup Profile
3. Browse Funding Opportunities
4. View Opportunity Details
5. Submit Application with Data

Application Data Includes:
- Business plan summary
- Use of funds
- Milestones and timelines
- Team information
- Financial projections (3-year)
- Requested funding amount

Metrics:
- application_submission_time: Time to submit
- application_success: Successful submissions

Usage:
k6 run funding-application-flow.js
`);

  // 8. Main Load Test
  addSection('8. MAIN LOAD TEST (main-load-test.js)', `
Purpose: Simulate realistic mixed user traffic
Expected Performance: Varies by scenario

Traffic Distribution:
- 40% Marketplace Browsing
- 20% Mentorship Journey
- 15% Funding Opportunities
- 10% Credit Assessments
- 15% Public Browsing (unauthenticated)

Load Scenarios:

BASELINE (Normal Daily Traffic):
- 0 → 20 users (2 min)
- 20 → 50 users (5 min)
- 50 → 100 users (3 min)
- Cool down to 0 (4 min)

STRESS TEST (Peak Traffic):
- Ramps to 100 concurrent users
- Sustained peak load
- Tests breaking points

SPIKE TEST (Traffic Surge):
- 10 → 200 users (10 seconds!)
- Sustained spike (3 min)
- Tests auto-scaling

SOAK TEST (24-Hour Stability):
- 20 constant users
- 30 minutes duration
- Detects memory leaks

Usage:
k6 run main-load-test.js
k6 run --env SCENARIO=stress main-load-test.js
k6 run --env SCENARIO=spike main-load-test.js
k6 run --env SCENARIO=soak main-load-test.js
`);

  // 9. Setup Instructions
  addSection('9. SETUP INSTRUCTIONS', `
PREREQUISITES:

1. Install k6:
   macOS: brew install k6
   Windows: choco install k6
   Linux: apt-get install k6

2. Create Test Users:
   - Create 5 users in Supabase Auth
   - Email pattern: loadtest1@example.com
   - Password: TestPass123!

3. Prepare Test Data:
   - Profile records for each test user
   - Startup profiles
   - Credit wallets with 1000 credits
   - Active mentors and listings

4. Create Results Directory:
   mkdir -p k6-results

RUNNING TESTS:

Basic Test:
k6 run auth-flow.js

With Custom VUs:
k6 run --vus 50 --duration 5m main-load-test.js

With Results Export:
k6 run --out json=k6-results/results.json main-load-test.js

MONITORING:

Real-time Metrics:
- http_reqs: Total HTTP requests
- http_req_duration: Response times
- http_req_failed: Error rate
- vus: Virtual users (concurrent)
- iterations: Test iterations completed

Custom Metrics:
- auth_duration: Authentication time
- booking_duration: Booking completion
- assessment_duration: AI assessment
- application_submission_time: Funding apps

THRESHOLDS:

Pass Criteria:
✓ Success Rate > 95%
✓ P95 Response Time < 2s
✓ P99 Response Time < 5s
✓ Error Rate < 5%

Warning Criteria:
⚠ Success Rate 90-95%
⚠ P95 Response Time 2-5s
⚠ Error Rate 5-10%

Failure Criteria:
✗ Success Rate < 90%
✗ P95 Response Time > 5s
✗ Error Rate > 10%

TROUBLESHOOTING:

High Failure Rate:
- Check Supabase connection limits
- Verify test users exist
- Check RLS policies
- Monitor Supabase dashboard

Slow Response Times:
- Check database indexes
- Monitor edge function cold starts
- Review N+1 queries
- Check network latency

Database Connection Errors:
- Reduce concurrent VUs
- Implement connection pooling
- Add delays between operations
- Consider Supabase Pro tier

Edge Function Timeouts:
- Optimize AI processing
- Break into smaller functions
- Add retry logic
- Monitor function logs

BEST PRACTICES:

1. Start with baseline, increase gradually
2. Monitor Supabase dashboard during tests
3. Clean test data between runs
4. Use realistic user behavior patterns
5. Document performance baselines
6. Test in stages before full suite
7. Schedule tests during low traffic

PERFORMANCE TARGETS:

Page Load: < 2s
API Response: < 500ms (avg), < 2s (p95)
Database Query: < 500ms
Booking Flow: < 3s
Assessment: < 5s (with AI)
Success Rate: > 99%

CONTACT & SUPPORT:

For issues or questions:
- Check k6 documentation: k6.io/docs
- Review Supabase performance docs
- Monitor edge function logs
- Check database query performance
`);

  // Footer on last page
  yPosition = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Kumii Platform Load Testing Suite', pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(`Generated: ${new Date().toLocaleDateString()} | © ${new Date().getFullYear()} Kumii`, pageWidth / 2, yPosition + 5, { align: 'center' });

  // Save the PDF
  pdf.save('kumii-load-testing-suite.pdf');
};
