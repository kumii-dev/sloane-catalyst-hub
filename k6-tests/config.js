// k6 Load Test Configuration
export const config = {
  // Supabase Configuration
  supabaseUrl: 'https://qypazgkngxhazgkuevwq.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cGF6Z2tuZ3hoYXpna3VldndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTY4NjUsImV4cCI6MjA3NDYzMjg2NX0.3NgO6VJFYn143_qgl_UncfWpTDmA4hVV85zXneOeMxo',
  
  // Test Users (create these in your Supabase project)
  testUsers: [
    { email: 'loadtest1@example.com', password: 'TestPass123!' },
    { email: 'loadtest2@example.com', password: 'TestPass123!' },
    { email: 'loadtest3@example.com', password: 'TestPass123!' },
    { email: 'loadtest4@example.com', password: 'TestPass123!' },
    { email: 'loadtest5@example.com', password: 'TestPass123!' },
  ],

  // Load Test Scenarios
  scenarios: {
    // Baseline: Normal daily traffic
    baseline: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },  // Ramp up to 10 users
        { duration: '5m', target: 10 },  // Stay at 10 users
        { duration: '2m', target: 0 },   // Ramp down
      ],
    },

    // Stress: Peak traffic (launch day, marketing campaign)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Stress level
        { duration: '2m', target: 100 },  // Peak stress
        { duration: '5m', target: 100 },  // Sustained peak
        { duration: '3m', target: 0 },    // Recovery
      ],
    },

    // Spike: Sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 10 },   // Normal load
        { duration: '10s', target: 200 }, // Sudden spike!
        { duration: '3m', target: 200 },  // Sustained spike
        { duration: '10s', target: 10 },  // Back to normal
        { duration: '2m', target: 10 },   // Recovery
      ],
    },

    // Soak: Long-running test for memory leaks
    soak: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30m',
    },
  },

  // Performance Thresholds
  thresholds: {
    // HTTP metrics
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'], // 95% under 2s, 99% under 5s
    'http_req_failed': ['rate<0.05'], // Less than 5% failure rate
    
    // Custom metrics
    'booking_duration': ['p(95)<3000'], // Booking flow under 3s
    'assessment_duration': ['p(95)<5000'], // Assessment under 5s
    'auth_duration': ['p(95)<1000'], // Auth under 1s
    
    // Database metrics
    'db_query_duration': ['p(95)<500'], // DB queries under 500ms
  },
};

// Helper: Get random test user
export function getRandomUser() {
  return config.testUsers[Math.floor(Math.random() * config.testUsers.length)];
}

// Helper: Get headers for authenticated requests
export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'apikey': config.supabaseAnonKey,
    'Authorization': `Bearer ${token}`,
  };
}

// Helper: Get headers for unauthenticated requests
export function getAnonHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': config.supabaseAnonKey,
  };
}
