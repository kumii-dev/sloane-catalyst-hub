import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: {
    id: string;
    title: string;
    funder: { organization_name: string };
    industry_focus: string[];
    stage_requirements: string[];
    min_credit_score: number | null;
    geographic_restrictions: string[];
    amount_min: number;
    amount_max: number;
  };
}

export function ApplyDialog({ open, onOpenChange, opportunity }: ApplyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [qualified, setQualified] = useState(false);
  const [qualificationReasons, setQualificationReasons] = useState<string[]>([]);
  const [disqualificationReasons, setDisqualificationReasons] = useState<string[]>([]);
  const [startupProfile, setStartupProfile] = useState<any>(null);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    if (open && user) {
      checkQualification();
    }
  }, [open, user]);

  const checkQualification = async () => {
    setChecking(true);
    try {
      // Fetch user's startup profile
      const { data: profile, error: profileError } = await supabase
        .from("startup_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileError) {
        toast({
          title: "Profile Required",
          description: "Please complete your startup profile before applying.",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }

      setStartupProfile(profile);

      // Check qualifications
      const reasons: string[] = [];
      const disqualifications: string[] = [];
      let isQualified = true;

      // Check industry focus
      if (opportunity.industry_focus && opportunity.industry_focus.length > 0) {
        if (opportunity.industry_focus.includes(profile.industry)) {
          reasons.push(`✓ Your industry (${profile.industry}) matches the opportunity focus`);
        } else {
          disqualifications.push(`✗ Industry mismatch: Required ${opportunity.industry_focus.join(", ")}, but you're in ${profile.industry}`);
          isQualified = false;
        }
      }

      // Check stage requirements
      if (opportunity.stage_requirements && opportunity.stage_requirements.length > 0) {
        if (opportunity.stage_requirements.includes(profile.stage)) {
          reasons.push(`✓ Your company stage (${profile.stage}) is eligible`);
        } else {
          disqualifications.push(`✗ Stage mismatch: Required ${opportunity.stage_requirements.join(", ")}, but you're at ${profile.stage}`);
          isQualified = false;
        }
      }

      // Check credit score
      if (opportunity.min_credit_score && opportunity.min_credit_score > 0) {
        if (profile.credit_score && profile.credit_score >= opportunity.min_credit_score) {
          reasons.push(`✓ Your credit score (${profile.credit_score}) meets the minimum (${opportunity.min_credit_score})`);
        } else {
          disqualifications.push(`✗ Credit score too low: Required minimum ${opportunity.min_credit_score}${profile.credit_score ? `, you have ${profile.credit_score}` : ", but you haven't completed a credit assessment"}`);
          isQualified = false;
        }
      }

      // Check geographic restrictions
      if (opportunity.geographic_restrictions && opportunity.geographic_restrictions.length > 0) {
        if (profile.location && opportunity.geographic_restrictions.some(geo => 
          profile.location.toLowerCase().includes(geo.toLowerCase())
        )) {
          reasons.push(`✓ Your location (${profile.location}) is within the eligible areas`);
        } else {
          disqualifications.push(`✗ Geographic restriction: Only accepting applications from ${opportunity.geographic_restrictions.join(", ")}${profile.location ? `, you're in ${profile.location}` : ""}`);
          isQualified = false;
        }
      }

      setQualified(isQualified);
      setQualificationReasons(reasons);
      setDisqualificationReasons(disqualifications);
    } catch (error) {
      console.error("Error checking qualification:", error);
      toast({
        title: "Error",
        description: "Failed to check qualification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !startupProfile) return;

    setLoading(true);
    try {
      // Create application
      const { data: application, error: appError } = await supabase
        .from("funding_applications")
        .insert({
          applicant_id: user.id,
          startup_id: startupProfile.id,
          opportunity_id: opportunity.id,
          requested_amount: parseFloat(requestedAmount) || null,
          application_data: {
            motivation,
            qualification_reasons: qualificationReasons,
          },
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (appError) throw appError;

      // Create confirmation message
      await supabase.from("messages").insert({
        user_id: user.id,
        subject: `Application Submitted: ${opportunity.title}`,
        body: `Your application for "${opportunity.title}" from ${opportunity.funder.organization_name} has been successfully submitted. 

Requested Amount: ${requestedAmount ? `R${parseFloat(requestedAmount).toLocaleString()}` : "Not specified"}

You will receive updates about your application status in this inbox. Good luck!`,
        message_type: "application_confirmation",
        related_entity_type: "funding_application",
        related_entity_id: application.id,
      });

      toast({
        title: "Application Submitted!",
        description: "Check your inbox for confirmation details.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {opportunity.title}</DialogTitle>
          <DialogDescription>
            {opportunity.funder.organization_name}
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Checking qualification...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Qualification Status */}
            <Alert variant={qualified ? "default" : "destructive"}>
              <div className="flex items-start">
                {qualified ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      {qualified 
                        ? "✓ You're eligible to apply for this opportunity!" 
                        : "Unfortunately, you don't meet the requirements"}
                    </div>
                    
                    {qualificationReasons.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {qualificationReasons.map((reason, idx) => (
                          <li key={idx} className="text-sm">{reason}</li>
                        ))}
                      </ul>
                    )}
                    
                    {disqualificationReasons.length > 0 && (
                      <div>
                        <div className="font-semibold mt-3 mb-2">Reasons:</div>
                        <ul className="space-y-1">
                          {disqualificationReasons.map((reason, idx) => (
                            <li key={idx} className="text-sm">{reason}</li>
                          ))}
                        </ul>
                        <div className="mt-4 text-sm">
                          <strong>What you can do:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {disqualificationReasons.some(r => r.includes("credit score")) && (
                              <li>Complete a credit assessment to improve your score</li>
                            )}
                            {disqualificationReasons.some(r => r.includes("Stage")) && (
                              <li>Update your company stage in your profile if it has changed</li>
                            )}
                            <li>Look for other opportunities that better match your profile</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {qualified && (
              <>
                {/* Requested Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Requested Amount (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">R</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Between ${opportunity.amount_min.toLocaleString()} - ${opportunity.amount_max.toLocaleString()}`}
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(e.target.value)}
                      className="pl-7"
                      min={opportunity.amount_min}
                      max={opportunity.amount_max}
                    />
                  </div>
                </div>

                {/* Motivation */}
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why are you applying? *</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Explain why this funding opportunity is right for your startup..."
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {qualified && !checking && (
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !motivation.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
