import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { config, getRandomUser, getAuthHeaders, getAnonHeaders } from './config.js';

// Custom metrics
const assessmentDuration = new Trend('assessment_duration');
const assessmentSuccess = new Counter('assessment_success');
const assessmentFailure = new Counter('assessment_failure');

export const options = {
  scenarios: {
    credit_assessment: {
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
    'assessment_duration': ['p(95)<5000'], // Assessment can take longer due to AI
    'http_req_failed': ['rate<0.05'],
  },
};

export default function() {
  let authToken;
  let userId;
  let startupId;

  // STEP 1: Authentication
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

  // STEP 2: Get or Create Startup Profile
  group('Startup Profile', function() {
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

  // STEP 3: Submit Assessment
  group('Submit Assessment', function() {
    if (!startupId) {
      console.log('No startup profile found, skipping assessment');
      return;
    }

    const assessmentStart = Date.now();

    const assessmentData = {
      // Business Profile Domain
      businessAge: 3,
      industry: 'Technology',
      legalStructure: 'Private Company',
      businessModel: 'SaaS',
      
      // Financial Health Domain
      annualRevenue: 500000,
      monthlyBurnRate: 50000,
      profitMargin: 15,
      cashReserves: 200000,
      
      // Repayment Behaviour Domain
      creditHistory: 'Good',
      previousLoans: 2,
      loanRepaymentRecord: 'On time',
      
      // Market Access Domain
      customerBase: 'Growing',
      marketPenetration: 25,
      salesGrowth: 40,
      
      // Operational Capacity Domain
      teamSize: 15,
      managementExperience: 8,
      operationalEfficiency: 'High',
      
      // Technology & Innovation Domain
      techStack: 'Modern',
      innovationLevel: 'High',
      digitalPresence: 'Strong',
      
      // Compliance Domain
      regulatoryCompliance: 'Compliant',
      taxCompliance: 'Up to date',
      licenses: 'Valid',
      
      // Skills Domain
      keySkills: ['Leadership', 'Technical', 'Marketing'],
      certificationsHeld: 3,
      trainingPrograms: 5,
      
      // Governance Domain
      boardStructure: 'Established',
      governanceFramework: 'Strong',
      transparencyLevel: 'High',
      
      // Social & Environmental Impact Domain
      socialImpact: 'Positive',
      environmentalPractices: 'Sustainable',
      communityEngagement: 'Active',
    };

    // Create assessment record
    const createRes = http.post(
      `${config.supabaseUrl}/rest/v1/credit_assessments`,
      JSON.stringify({
        user_id: userId,
        startup_id: startupId,
        status: 'draft',
        assessment_data: assessmentData,
      }),
      {
        headers: {
          ...getAuthHeaders(authToken),
          'Prefer': 'return=representation',
        }
      }
    );

    check(createRes, {
      'assessment created': (r) => r.status === 201,
    });

    if (createRes.status === 201) {
      const assessment = JSON.parse(createRes.body)[0];
      
      // Trigger AI analysis (Edge Function)
      const analyzeRes = http.post(
        `${config.supabaseUrl}/functions/v1/analyze-credit-assessment`,
        JSON.stringify({
          assessmentData: assessmentData,
          userId: userId,
          startupId: startupId,
        }),
        {
          headers: {
            ...getAuthHeaders(authToken),
            'Content-Type': 'application/json',
          }
        }
      );

      const assessmentTime = Date.now() - assessmentStart;
      assessmentDuration.add(assessmentTime);

      const analysisSuccessful = check(analyzeRes, {
        'analysis completed': (r) => r.status === 200,
        'score generated': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.analysis?.overallScore !== undefined;
          } catch {
            return false;
          }
        },
      });

      if (analysisSuccessful) {
        assessmentSuccess.add(1);
      } else {
        assessmentFailure.add(1);
      }
    }
  });

  sleep(3);
}

export function handleSummary(data) {
  return {
    'k6-results/credit-assessment-summary.json': JSON.stringify(data),
  };
}
