import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Github, Mail, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/kumii-logo.png';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Helper to detect iframe (Preview environment)
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Get proper redirect URL for iframe/preview scenarios
const getRedirectUrl = (path: string = '/onboarding') => {
  // Always use kumii.africa for production domains
  const currentOrigin = window.location.origin;
  const isProduction = currentOrigin.includes('kumii.africa') || currentOrigin.includes('kumii-test.com');
  
  if (isProduction) {
    return `https://kumii.africa${path}`;
  }
  
  if (isInIframe()) {
    try {
      return `${window.top!.location.origin}${path}`;
    } catch (e) {
      return `${window.location.origin}${path}`;
    }
  }
  return `${window.location.origin}${path}`;
};

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const checkAndRedirect = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    navigate(roleData ? '/admin/performance' : '/onboarding');
  };

  useEffect(() => {
    // Check if this is a password reset flow
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const resetParam = params.get('reset');
    const accessToken = params.get('access_token') || hash.get('access_token');
    const type = params.get('type') || hash.get('type');
    const error = hash.get('error');
    const errorCode = hash.get('error_code');
    
    // If there's an error (like expired OTP), show the forgot password form
    if (error === 'access_denied' && errorCode === 'otp_expired') {
      setShowForgotPassword(true);
      toast({
        title: "Reset link expired",
        description: "Your password reset link has expired. Please request a new one.",
        variant: "destructive",
      });
      // Clean up the URL
      window.history.replaceState({}, document.title, '/auth');
      return;
    }
    
    if ((resetParam === 'true' || type === 'recovery') && accessToken) {
      setIsResettingPassword(true);
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Defer Supabase calls to avoid deadlocks in the callback
        setTimeout(() => {
          checkAndRedirect(session.user.id);
        }, 0);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectUrl = getRedirectUrl('/onboarding');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      setShowSignupSuccess(true);
      setLoading(false);
      // Clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("Attempting sign in...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Sign in response:", { data, error });

    if (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.session) {
      console.log("Sign in successful, session:", data.session);
      toast({
        title: "Success!",
        description: "Signed in successfully",
      });
      await checkAndRedirect(data.session.user.id);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    if (isInIframe()) {
      // For iframe (Preview), get OAuth URL and redirect top window
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/onboarding'),
          skipBrowserRedirect: true
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.url) {
        window.top!.location.href = data.url;
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('/onboarding')
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    
    if (isInIframe()) {
      // For iframe (Preview), get OAuth URL and redirect top window
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getRedirectUrl('/onboarding'),
          skipBrowserRedirect: true
        }
      });

      if (error) {
        toast({
          title: "GitHub sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.url) {
        window.top!.location.href = data.url;
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getRedirectUrl('/onboarding')
        }
      });

      if (error) {
        toast({
          title: "GitHub sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: getRedirectUrl('/auth?reset=true'),
    });

    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your password has been updated",
      });
      setIsResettingPassword(false);
      setNewPassword('');
      navigate('/onboarding');
    }
    setLoading(false);
  };

  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center main-gradient-light p-4">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="Kumii" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Set New Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-center">
            <Button 
              variant="link" 
              onClick={() => {
                setIsResettingPassword(false);
                navigate('/auth');
              }}
              className="text-sm mx-auto"
            >
              Back to sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center main-gradient-light p-4">
      {showSignupSuccess ? (
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="Kumii" className="h-16 w-auto" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert variant="friendly" className="border-primary/20">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <AlertTitle className="text-primary">Success!</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-foreground">
                  Your account has been created successfully. Welcome to Kumii!
                </p>
                <p className="text-muted-foreground">
                  We've sent a confirmation email to verify your account. Please check your inbox and click the confirmation link to activate your account.
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  After confirming your email, you'll be automatically redirected to sign in.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder.
              </p>
              <Button 
                variant="default" 
                onClick={() => setShowSignupSuccess(false)}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-sm mx-auto"
            >
              Back to home
            </Button>
          </CardFooter>
        </Card>
      ) : (
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Kumii" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Welcome</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join our digital marketplace community
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              {showForgotPassword ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Reset your password</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email and we'll send you a reset link
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" variant="default" className="w-full" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Back to Sign In
                    </Button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs p-0 h-auto"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="default" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" variant="default" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Separator className="my-4" />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Or continue with
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleGithubSignIn}
                disabled={loading}
                className="w-full"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="text-center">
          <Button 
            variant="link" 
            onClick={() => navigate('/')}
            className="text-sm mx-auto"
          >
            Back to home
          </Button>
        </CardFooter>
      </Card>
      )}
    </div>
  );
};

export default Auth;