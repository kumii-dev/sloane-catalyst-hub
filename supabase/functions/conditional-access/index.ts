// Conditional Access Evaluation Edge Function
// Evaluates authentication context and enforces security policies

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RiskContext {
  ip_address: string;
  user_agent: string;
  device_fingerprint: string;
  geolocation: { country: string; city: string };
  isp: string;
  is_vpn: boolean;
  is_tor: boolean;
  login_velocity: number;
  impossible_travel: boolean;
  unusual_time: boolean;
  new_device: boolean;
  ip_reputation: 'clean' | 'suspicious' | 'malicious';
  credential_leak: boolean;
  session_age: number;
  privilege_level: string;
  sensitive_action: boolean;
}

interface PolicyDecision {
  action: 'allow' | 'challenge' | 'block' | 'terminate';
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Invalid token', { status: 401 });
    }

    // 2. Extract request body
    const body = await req.json();
    const { session_id, action_type } = body;

    if (!session_id) {
      return new Response('session_id required', { status: 400 });
    }

    // 3. Extract context
    const context = await extractRiskContext(
      user.id,
      session_id,
      req,
      supabase,
      action_type
    );

    // 4. Calculate risk score
    const riskScore = calculateRiskScore(context);
    const riskLevel = getRiskLevel(riskScore);

    // 5. Evaluate policies
    const policyDecision = evaluatePolicies(context, riskScore);

    // 6. Log authentication context
    await supabase.from('auth_context_log').insert({
      user_id: user.id,
      session_id: session_id,
      ip_address: context.ip_address,
      user_agent: context.user_agent,
      device_fingerprint: context.device_fingerprint,
      country_code: context.geolocation.country,
      city: context.geolocation.city,
      is_vpn: context.is_vpn,
      is_tor: context.is_tor,
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_factors: {
        impossible_travel: context.impossible_travel,
        new_device: context.new_device,
        ip_reputation: context.ip_reputation,
        credential_leak: context.credential_leak,
        unusual_time: context.unusual_time,
      },
      policy_decision: policyDecision.action,
      policy_reason: policyDecision.reason,
      is_new_device: context.new_device,
      is_impossible_travel: context.impossible_travel,
      login_velocity: context.login_velocity,
    });

    // 7. Take action based on decision
    if (policyDecision.action === 'terminate') {
      await terminateSession(supabase, user.id, session_id);
    }

    // 8. Return decision
    return new Response(
      JSON.stringify({
        allowed: policyDecision.action === 'allow',
        action: policyDecision.action,
        reason: policyDecision.reason,
        risk_score: riskScore,
        risk_level: riskLevel,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Conditional access error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function extractRiskContext(
  userId: string,
  sessionId: string,
  request: Request,
  supabase: any,
  actionType?: string
): Promise<RiskContext> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const deviceFingerprint = request.headers.get('x-device-fingerprint') || '';

  // Get geolocation (mock for now, integrate with IP geolocation service)
  const geo = { country: 'ZA', city: 'Johannesburg' };

  // Check if device is new
  const isNewDevice = await isDeviceNew(supabase, userId, deviceFingerprint);

  // Check login velocity
  const loginVelocity = await getLoginVelocity(supabase, userId);

  // Get user role
  const privilegeLevel = await getUserRole(supabase, userId);

  // Determine if sensitive action
  const sensitiveAction = isSensitiveAction(actionType);

  return {
    ip_address: ip,
    user_agent: userAgent,
    device_fingerprint: deviceFingerprint,
    geolocation: geo,
    isp: 'Unknown ISP',
    is_vpn: false,
    is_tor: false,
    login_velocity: loginVelocity,
    impossible_travel: false,
    unusual_time: isUnusualTime(),
    new_device: isNewDevice,
    ip_reputation: 'clean',
    credential_leak: false,
    session_age: 0,
    privilege_level: privilegeLevel,
    sensitive_action: sensitiveAction,
  };
}

function calculateRiskScore(context: RiskContext): number {
  let score = 0;

  // Network risk (0-30 points)
  if (context.is_tor) score += 30;
  else if (context.is_vpn) score += 15;
  if (context.ip_reputation === 'malicious') score += 30;
  else if (context.ip_reputation === 'suspicious') score += 20;

  // Behavioral risk (0-40 points)
  if (context.impossible_travel) score += 40;
  if (context.login_velocity > 5) score += 20;
  if (context.unusual_time) score += 10;
  if (context.new_device) score += 15;

  // Credential risk (0-30 points)
  if (context.credential_leak) score += 30;

  return Math.min(score, 100);
}

function getRiskLevel(score: number): string {
  if (score <= 20) return 'low';
  if (score <= 40) return 'medium';
  if (score <= 60) return 'high';
  if (score <= 80) return 'very_high';
  return 'critical';
}

function evaluatePolicies(
  context: RiskContext,
  riskScore: number
): PolicyDecision {
  // Admin from new device
  if (context.privilege_level === 'admin' && context.new_device) {
    return {
      action: 'challenge',
      reason: 'Admin access from unrecognized device requires MFA',
    };
  }

  // Impossible travel
  if (context.impossible_travel) {
    return {
      action: 'terminate',
      reason: 'User location changed impossibly fast (potential account takeover)',
    };
  }

  // Malicious IP
  if (context.ip_reputation === 'malicious') {
    return {
      action: 'block',
      reason: 'Access from known malicious IP address',
    };
  }

  // Leaked credentials
  if (context.credential_leak) {
    return {
      action: 'terminate',
      reason: 'Password found in credential breach database',
    };
  }

  // Sensitive action from Tor
  if (context.is_tor && context.sensitive_action) {
    return {
      action: 'block',
      reason: 'Sensitive operations blocked from Tor network',
    };
  }

  // Risk-based decision
  if (riskScore >= 81) {
    return { action: 'terminate', reason: 'Critical risk level detected' };
  } else if (riskScore >= 61) {
    return { action: 'block', reason: 'Very high risk level detected' };
  } else if (riskScore >= 41) {
    return { action: 'challenge', reason: 'High risk level, MFA required' };
  }

  return { action: 'allow' };
}

async function isDeviceNew(
  supabase: any,
  userId: string,
  deviceFingerprint: string
): Promise<boolean> {
  if (!deviceFingerprint) return true;

  const { data, error } = await supabase
    .from('auth_context_log')
    .select('id')
    .eq('user_id', userId)
    .eq('device_fingerprint', deviceFingerprint)
    .limit(1);

  if (error) return true;
  return data.length === 0;
}

async function getLoginVelocity(supabase: any, userId: string): Promise<number> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('auth_events')
    .select('id')
    .eq('user_id', userId)
    .eq('event_type', 'login_success')
    .gte('created_at', hourAgo.toISOString());

  if (error) return 0;
  return data.length;
}

async function getUserRole(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return 'user';
  return data.role;
}

function isSensitiveAction(actionType?: string): boolean {
  const sensitiveActions = [
    'delete_user',
    'change_password',
    'update_billing',
    'revoke_access',
    'export_data',
  ];
  return actionType ? sensitiveActions.includes(actionType) : false;
}

function isUnusualTime(): boolean {
  const hour = new Date().getHours();
  // Consider 2 AM - 6 AM as unusual
  return hour >= 2 && hour < 6;
}

async function terminateSession(
  supabase: any,
  userId: string,
  sessionId: string
): Promise<void> {
  await supabase
    .from('user_sessions')
    .update({
      is_active: false,
      terminated_at: new Date().toISOString(),
      termination_reason: 'Terminated by conditional access policy',
    })
    .eq('session_id', sessionId);

  await supabase.from('auth_events').insert({
    user_id: userId,
    session_id: sessionId,
    event_type: 'session_terminated',
    event_category: 'security',
    severity: 'high',
    metadata: { reason: 'Conditional access policy violation' },
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-device-fingerprint',
};
