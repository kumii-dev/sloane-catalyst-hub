import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirect component for /admin/support -> /admin/support-console
 * The AdminSupportDashboard uses support_tickets (old system)
 * The AdminSupportConsole uses chat_sessions (live chat system - deployed)
 */
const AdminSupportRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the live chat support console
    navigate('/admin/support-console', { replace: true });
  }, [navigate]);

  return null;
};

export default AdminSupportRedirect;
