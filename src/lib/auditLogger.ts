/**
 * Audit Logging Utility
 * 
 * Provides comprehensive audit logging for security-relevant events.
 * Logs are stored in the `audit_logs` table with immutable security.
 * 
 * @module auditLogger
 */

import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 
  | 'user_login'
  | 'user_logout'
  | 'user_signup'
  | 'password_reset_request'
  | 'password_changed'
  | 'profile_updated'
  | 'profile_deleted'
  | 'role_assigned'
  | 'role_revoked'
  | 'credit_assessment_created'
  | 'credit_assessment_viewed'
  | 'credit_assessment_shared'
  | 'file_uploaded'
  | 'file_downloaded'
  | 'file_deleted'
  | 'payment_initiated'
  | 'payment_completed'
  | 'credit_deducted'
  | 'credit_added'
  | 'session_booked'
  | 'message_sent'
  | 'unauthorized_access_attempt'
  | 'rls_policy_violation'
  | 'api_error'
  | 'data_export'
  | 'admin_action';

export type AuditLevel = 'INFO' | 'WARN' | 'ERROR';

export interface AuditLogEntry {
  action: AuditAction;
  level?: AuditLevel;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Sanitize sensitive data before logging
 */
const sanitizeDetails = (details: Record<string, any>): Record<string, any> => {
  const sensitiveFields = [
    'password',
    'token',
    'api_key',
    'secret',
    'credit_card',
    'ssn',
    'id_number',
  ];

  const sanitized = { ...details };

  Object.keys(sanitized).forEach((key) => {
    const keyLower = key.toLowerCase();
    if (sensitiveFields.some((field) => keyLower.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeDetails(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Get client IP address (best effort)
 * Note: May not work behind proxies/CDNs
 */
const getClientIp = (): string | null => {
  // In browser, IP is not directly accessible
  // Would need backend endpoint or CloudFlare header
  return null; // TODO: Implement via backend if needed
};

/**
 * Log an audit event
 * 
 * @param entry - Audit log entry details
 * @returns Promise resolving to the created log entry ID
 * 
 * @example
 * ```typescript
 * await logAuditEvent({
 *   action: 'credit_assessment_created',
 *   level: 'INFO',
 *   resource_type: 'credit_assessment',
 *   resource_id: assessmentId,
 *   details: { score: 75, risk_level: 'medium' }
 * });
 * ```
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<string | null> => {
  try {
    // Only log in production to avoid cluttering dev/test databases
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', entry.action, entry.details);
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const sanitizedDetails = entry.details ? sanitizeDetails(entry.details) : null;

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        details: sanitizedDetails,
        ip_address: getClientIp(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[AUDIT] Failed to log event:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('[AUDIT] Unexpected error:', error);
    return null;
  }
};

/**
 * Convenience wrapper for INFO level logs
 */
export const logInfo = (action: AuditAction, details?: Record<string, any>) => {
  return logAuditEvent({ action, level: 'INFO', details });
};

/**
 * Convenience wrapper for WARN level logs
 */
export const logWarn = (action: AuditAction, details?: Record<string, any>) => {
  return logAuditEvent({ action, level: 'WARN', details });
};

/**
 * Convenience wrapper for ERROR level logs
 */
export const logError = (action: AuditAction, details?: Record<string, any>) => {
  return logAuditEvent({ action, level: 'ERROR', details });
};

/**
 * Log user authentication events
 */
export const logAuthEvent = async (
  action: Extract<AuditAction, 'user_login' | 'user_logout' | 'user_signup' | 'password_changed'>,
  details?: Record<string, any>
) => {
  return logInfo(action, details);
};

/**
 * Log data access events (for compliance)
 */
export const logDataAccess = async (
  resourceType: string,
  resourceId: string,
  action: Extract<AuditAction, 'credit_assessment_viewed' | 'file_downloaded' | 'data_export'>,
  details?: Record<string, any>
) => {
  return logInfo(action, {
    ...details,
    resource_type: resourceType,
    resource_id: resourceId,
  });
};

/**
 * Log security events (unauthorized access, policy violations)
 */
export const logSecurityEvent = async (
  action: Extract<AuditAction, 'unauthorized_access_attempt' | 'rls_policy_violation'>,
  details: Record<string, any>
) => {
  return logError(action, details);
};

/**
 * Log administrative actions
 */
export const logAdminAction = async (
  action: Extract<AuditAction, 'role_assigned' | 'role_revoked' | 'profile_deleted' | 'admin_action'>,
  details: Record<string, any>
) => {
  return logInfo(action, details);
};

/**
 * Log financial transactions
 */
export const logFinancialEvent = async (
  action: Extract<AuditAction, 'payment_initiated' | 'payment_completed' | 'credit_deducted' | 'credit_added'>,
  details: Record<string, any>
) => {
  return logInfo(action, details);
};

export default {
  logAuditEvent,
  logInfo,
  logWarn,
  logError,
  logAuthEvent,
  logDataAccess,
  logSecurityEvent,
  logAdminAction,
  logFinancialEvent,
};
