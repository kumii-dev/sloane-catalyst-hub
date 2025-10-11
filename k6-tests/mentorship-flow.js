import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { config, getRandomUser, getAuthHeaders, getAnonHeaders } from './config.js';

// Custom metrics
const bookingDuration = new Trend('booking_duration');
const bookingSuccess = new Counter('booking_success');
const bookingFailure = new Counter('booking_failure');

export const options = {
  scenarios: {
    mentorship_booking: config.scenarios.baseline,
  },
  thresholds: config.thresholds,
};

export default function() {
  let authToken;
  let userId;
  let mentorId;

  // STEP 1: Authentication
  group('Authentication', function() {
    const user = getRandomUser();
    const signInRes = http.post(
      `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: getAnonHeaders() }
    );

    check(signInRes, { 'authenticated': (r) => r.status === 200 });
    
    if (signInRes.status === 200) {
      const authData = JSON.parse(signInRes.body);
      authToken = authData.access_token;
      userId = authData.user.id;
    } else {
      return; // Exit if auth fails
    }
  });

  sleep(1);

  // STEP 2: Browse Mentors
  group('Browse Mentors', function() {
    const mentorsRes = http.get(
      `${config.supabaseUrl}/rest/v1/mentors?select=*,profiles(first_name,last_name,profile_picture_url)&status=eq.available&limit=10`,
      { headers: getAuthHeaders(authToken) }
    );

    check(mentorsRes, {
      'mentors loaded': (r) => r.status === 200,
      'mentors available': (r) => JSON.parse(r.body).length > 0,
    });

    if (mentorsRes.status === 200) {
      const mentors = JSON.parse(mentorsRes.body);
      if (mentors.length > 0) {
        mentorId = mentors[0].id;
      }
    }
  });

  sleep(2);

  // STEP 3: View Mentor Profile
  group('View Mentor Profile', function() {
    if (!mentorId) return;

    const profileRes = http.get(
      `${config.supabaseUrl}/rest/v1/mentors?select=*,profiles(*)&id=eq.${mentorId}`,
      { headers: getAuthHeaders(authToken) }
    );

    check(profileRes, {
      'profile loaded': (r) => r.status === 200,
      'profile has details': (r) => JSON.parse(r.body).length > 0,
    });
  });

  sleep(1);

  // STEP 4: Check Availability
  group('Check Availability', function() {
    if (!mentorId) return;

    const availabilityRes = http.get(
      `${config.supabaseUrl}/rest/v1/mentor_availability?mentor_id=eq.${mentorId}&is_active=eq.true`,
      { headers: getAuthHeaders(authToken) }
    );

    check(availabilityRes, {
      'availability loaded': (r) => r.status === 200,
    });
  });

  sleep(2);

  // STEP 5: Check Credit Balance
  group('Check Credits', function() {
    const walletRes = http.get(
      `${config.supabaseUrl}/rest/v1/credits_wallet?user_id=eq.${userId}&select=balance`,
      { headers: getAuthHeaders(authToken) }
    );

    check(walletRes, {
      'wallet loaded': (r) => r.status === 200,
    });
  });

  sleep(1);

  // STEP 6: Create Booking
  group('Create Booking', function() {
    if (!mentorId) return;

    const bookingStart = Date.now();
    
    const bookingPayload = JSON.stringify({
      mentor_id: mentorId,
      mentee_id: userId,
      session_type: 'strategy',
      title: 'Strategy Session - Load Test',
      description: 'Load testing booking flow',
      scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      session_status: 'pending',
    });

    const bookingRes = http.post(
      `${config.supabaseUrl}/rest/v1/mentoring_sessions`,
      bookingPayload,
      {
        headers: {
          ...getAuthHeaders(authToken),
          'Prefer': 'return=representation',
        }
      }
    );

    const bookingTime = Date.now() - bookingStart;
    bookingDuration.add(bookingTime);

    const bookingSuccessful = check(bookingRes, {
      'booking created': (r) => r.status === 201,
      'booking has id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) && body.length > 0 && body[0].id !== undefined;
        } catch {
          return false;
        }
      },
    });

    if (bookingSuccessful) {
      bookingSuccess.add(1);
    } else {
      bookingFailure.add(1);
    }
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'k6-results/mentorship-flow-summary.json': JSON.stringify(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  let summary = '\n' + indent + '=== Mentorship Booking Flow Summary ===\n\n';
  
  summary += indent + `✓ Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `✓ Success Rate: ${((1 - data.metrics.http_req_failed.values.rate) * 100).toFixed(2)}%\n`;
  summary += indent + `✓ Avg Booking Time: ${data.metrics.booking_duration?.values.avg.toFixed(0)}ms\n`;
  summary += indent + `✓ P95 Booking Time: ${data.metrics.booking_duration?.values['p(95)'].toFixed(0)}ms\n`;
  
  return summary;
}
