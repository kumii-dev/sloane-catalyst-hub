import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { config, getRandomUser, getAnonHeaders } from './config.js';

// Custom metrics
const authDuration = new Trend('auth_duration');

export const options = {
  scenarios: {
    auth_load: config.scenarios.baseline,
  },
  thresholds: {
    'auth_duration': ['p(95)<1000'], // Auth should be fast
    'http_req_failed': ['rate<0.01'], // Very low failure rate for auth
  },
};

export default function() {
  const user = getRandomUser();
  
  // Sign In Flow
  const signInStart = Date.now();
  
  const signInPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const signInRes = http.post(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    signInPayload,
    { headers: getAnonHeaders() }
  );

  const signInDuration = Date.now() - signInStart;
  authDuration.add(signInDuration);

  check(signInRes, {
    'sign in successful': (r) => r.status === 200,
    'access token received': (r) => JSON.parse(r.body).access_token !== undefined,
    'session created': (r) => JSON.parse(r.body).user !== undefined,
  });

  if (signInRes.status === 200) {
    const authData = JSON.parse(signInRes.body);
    const token = authData.access_token;
    
    // Get user session
    const sessionRes = http.get(
      `${config.supabaseUrl}/auth/v1/user`,
      {
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    check(sessionRes, {
      'session valid': (r) => r.status === 200,
      'user data retrieved': (r) => JSON.parse(r.body).id !== undefined,
    });
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6-results/auth-flow-summary.json': JSON.stringify(data),
  };
}
