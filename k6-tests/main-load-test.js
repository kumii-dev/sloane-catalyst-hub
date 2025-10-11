import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { config, getRandomUser, getAuthHeaders, getAnonHeaders } from './config.js';

// Main load test that simulates realistic user journeys
export const options = {
  scenarios: {
    // Mix of different user journeys
    mixed_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },  // Warm up
        { duration: '5m', target: 50 },  // Normal load
        { duration: '3m', target: 100 }, // Peak load
        { duration: '2m', target: 50 },  // Cool down
        { duration: '2m', target: 0 },   // Ramp down
      ],
    },
  },
  thresholds: config.thresholds,
};

export default function() {
  // Randomly choose a user journey
  const journeyType = Math.floor(Math.random() * 100);
  
  if (journeyType < 40) {
    // 40% - Browse marketplace
    browseMarketplace();
  } else if (journeyType < 60) {
    // 20% - Mentorship journey
    mentorshipJourney();
  } else if (journeyType < 75) {
    // 15% - Browse funding
    browseFunding();
  } else if (journeyType < 85) {
    // 10% - Credit assessment
    creditAssessment();
  } else {
    // 15% - Just browsing (unauthenticated)
    publicBrowsing();
  }
  
  sleep(Math.random() * 3 + 2); // Random think time 2-5 seconds
}

function browseMarketplace() {
  const user = getRandomUser();
  let authToken;

  // Sign in
  const signInRes = http.post(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: getAnonHeaders() }
  );

  if (signInRes.status === 200) {
    authToken = JSON.parse(signInRes.body).access_token;
  } else {
    return;
  }

  sleep(1);

  // Browse listings
  http.get(
    `${config.supabaseUrl}/rest/v1/listings?status=eq.active&select=*&limit=20`,
    { headers: getAuthHeaders(authToken) }
  );

  sleep(2);

  // View category
  http.get(
    `${config.supabaseUrl}/rest/v1/listing_categories?is_active=eq.true&select=*`,
    { headers: getAuthHeaders(authToken) }
  );

  sleep(1);
}

function mentorshipJourney() {
  const user = getRandomUser();
  let authToken;

  const signInRes = http.post(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: getAnonHeaders() }
  );

  if (signInRes.status === 200) {
    authToken = JSON.parse(signInRes.body).access_token;
  } else {
    return;
  }

  sleep(1);

  // Browse mentors
  const mentorsRes = http.get(
    `${config.supabaseUrl}/rest/v1/mentors?status=eq.available&select=*,profiles(*)&limit=10`,
    { headers: getAuthHeaders(authToken) }
  );

  sleep(2);

  // View mentor profile
  if (mentorsRes.status === 200) {
    const mentors = JSON.parse(mentorsRes.body);
    if (mentors.length > 0) {
      http.get(
        `${config.supabaseUrl}/rest/v1/mentors?id=eq.${mentors[0].id}&select=*`,
        { headers: getAuthHeaders(authToken) }
      );
    }
  }

  sleep(2);
}

function browseFunding() {
  const user = getRandomUser();
  let authToken;

  const signInRes = http.post(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: getAnonHeaders() }
  );

  if (signInRes.status === 200) {
    authToken = JSON.parse(signInRes.body).access_token;
  } else {
    return;
  }

  sleep(1);

  // Browse opportunities
  http.get(
    `${config.supabaseUrl}/rest/v1/funding_opportunities?status=eq.active&select=*,funder:funders(*)&limit=20`,
    { headers: getAuthHeaders(authToken) }
  );

  sleep(3);
}

function creditAssessment() {
  const user = getRandomUser();
  let authToken;

  const signInRes = http.post(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: getAnonHeaders() }
  );

  if (signInRes.status === 200) {
    authToken = JSON.parse(signInRes.body).access_token;
  } else {
    return;
  }

  sleep(1);

  // Load assessment form
  http.get(
    `${config.supabaseUrl}/rest/v1/scoring_criteria?is_active=eq.true&select=*`,
    { headers: getAuthHeaders(authToken) }
  );

  sleep(5); // User filling out form
}

function publicBrowsing() {
  // Browse without authentication
  http.get(`${config.supabaseUrl}/rest/v1/mentors?status=eq.available&select=*&limit=10`, {
    headers: getAnonHeaders()
  });

  sleep(2);

  http.get(`${config.supabaseUrl}/rest/v1/resources?is_active=eq.true&select=*&limit=10`, {
    headers: getAnonHeaders()
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'k6-results/main-load-test-summary.json': JSON.stringify(data),
    'k6-results/main-load-test-summary.html': htmlReport(data),
  };
}

function htmlReport(data) {
  const successRate = ((1 - data.metrics.http_req_failed.values.rate) * 100).toFixed(2);
  const avgDuration = data.metrics.http_req_duration.values.avg.toFixed(0);
  const p95Duration = data.metrics.http_req_duration.values['p(95)'].toFixed(0);
  const totalRequests = data.metrics.http_reqs.values.count;

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Load Test Report - Kumii Platform</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .success { color: #22c55e; }
    .warning { color: #f59e0b; }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <h1>🚀 Kumii Platform Load Test Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  
  <div class="metric">
    <h2>📊 Overall Metrics</h2>
    <p><strong>Total Requests:</strong> ${totalRequests}</p>
    <p><strong>Success Rate:</strong> <span class="${successRate > 95 ? 'success' : successRate > 90 ? 'warning' : 'error'}">${successRate}%</span></p>
    <p><strong>Average Response Time:</strong> ${avgDuration}ms</p>
    <p><strong>95th Percentile:</strong> ${p95Duration}ms</p>
  </div>

  <div class="metric">
    <h2>✅ Performance Assessment</h2>
    <ul>
      <li>Success Rate: ${successRate > 95 ? '✅ Excellent' : successRate > 90 ? '⚠️ Good' : '❌ Needs Improvement'}</li>
      <li>Response Time: ${p95Duration < 2000 ? '✅ Fast' : p95Duration < 5000 ? '⚠️ Acceptable' : '❌ Slow'}</li>
    </ul>
  </div>
</body>
</html>
  `;
}
