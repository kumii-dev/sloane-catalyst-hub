import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { config, getRandomUser, getAuthHeaders, getAnonHeaders } from './config.js';

// Custom metrics
const applicationTime = new Trend('application_submission_time');
const applicationSuccess = new Counter('application_success');

export const options = {
  scenarios: {
    funding_application: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 5 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    'application_submission_time': ['p(95)<3000'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function() {
  let authToken;
  let userId;
  let startupId;
  let opportunityId;

  // Authentication
  group('Authentication', function() {
    const user = getRandomUser();
    const signInRes = http.post(
      `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: getAnonHeaders() }
    );

    if (signInRes.status === 200) {
      const authData = JSON.parse(signInRes.body);
      authToken = authData.access_token;
      userId = authData.user.id;
    } else {
      return;
    }
  });

  sleep(1);

  // Get Startup Profile
  group('Get Startup Profile', function() {
    const startupRes = http.get(
      `${config.supabaseUrl}/rest/v1/startup_profiles?user_id=eq.${userId}&select=id`,
      { headers: getAuthHeaders(authToken) }
    );

    if (startupRes.status === 200) {
      const startups = JSON.parse(startupRes.body);
      if (startups.length > 0) {
        startupId = startups[0].id;
      }
    }
  });

  sleep(1);

  // Browse Funding Opportunities
  group('Browse Opportunities', function() {
    const opportunitiesRes = http.get(
      `${config.supabaseUrl}/rest/v1/funding_opportunities?status=eq.active&select=*,funder:funders(organization_name)&limit=10`,
      { headers: getAuthHeaders(authToken) }
    );

    check(opportunitiesRes, {
      'opportunities loaded': (r) => r.status === 200,
      'has opportunities': (r) => JSON.parse(r.body).length > 0,
    });

    if (opportunitiesRes.status === 200) {
      const opportunities = JSON.parse(opportunitiesRes.body);
      if (opportunities.length > 0) {
        opportunityId = opportunities[0].id;
      }
    }
  });

  sleep(2);

  // View Opportunity Details
  group('View Opportunity', function() {
    if (!opportunityId) return;

    const detailRes = http.get(
      `${config.supabaseUrl}/rest/v1/funding_opportunities?id=eq.${opportunityId}&select=*,funder:funders(*)`,
      { headers: getAuthHeaders(authToken) }
    );

    check(detailRes, {
      'opportunity details loaded': (r) => r.status === 200,
    });
  });

  sleep(2);

  // Submit Application
  group('Submit Application', function() {
    if (!opportunityId || !startupId) return;

    const applicationStart = Date.now();

    const applicationPayload = JSON.stringify({
      opportunity_id: opportunityId,
      startup_id: startupId,
      applicant_id: userId,
      status: 'submitted',
      requested_amount: 50000,
      application_data: {
        businessPlan: 'Comprehensive business plan for load test',
        useOfFunds: 'Product development and marketing',
        milestones: ['Q1: Product launch', 'Q2: Market expansion'],
        teamInfo: 'Experienced team with 10+ years in industry',
        financialProjections: {
          year1Revenue: 200000,
          year2Revenue: 500000,
          year3Revenue: 1000000,
        },
      },
      submitted_at: new Date().toISOString(),
    });

    const applicationRes = http.post(
      `${config.supabaseUrl}/rest/v1/funding_applications`,
      applicationPayload,
      {
        headers: {
          ...getAuthHeaders(authToken),
          'Prefer': 'return=representation',
        }
      }
    );

    const appTime = Date.now() - applicationStart;
    applicationTime.add(appTime);

    const appSuccessful = check(applicationRes, {
      'application submitted': (r) => r.status === 201,
      'application has id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) && body.length > 0 && body[0].id !== undefined;
        } catch {
          return false;
        }
      },
    });

    if (appSuccessful) {
      applicationSuccess.add(1);
    }
  });

  sleep(3);
}

export function handleSummary(data) {
  return {
    'k6-results/funding-application-summary.json': JSON.stringify(data),
  };
}
