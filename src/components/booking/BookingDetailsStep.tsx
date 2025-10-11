import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, MapPin, CheckCircle2, Shield, Clock, X } from "lucide-react";
import { BookingData } from "./BookSessionDialog";

interface BookingDetailsStepProps {
  mentor: any;
  bookingData: BookingData;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

export const BookingDetailsStep = ({ mentor, bookingData, onNext, onBack }: BookingDetailsStepProps) => {
  const [message, setMessage] = useState(bookingData.message);

  const handleContinue = () => {
    onNext({ message });
  };

  const sessionFee = mentor.session_fee || 100;
  const platformFee = sessionFee * ((mentor.platform_fee_percentage || 25) / 100);
  const mentorReceives = sessionFee - platformFee;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1">
          <Star className="w-4 h-4 mr-1 fill-current" />
          PROFESSIONAL SESSION
        </Badge>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Leadership Coaching</h2>
        <p className="text-muted-foreground">
          with {mentor.profiles?.first_name} on {format(bookingData.date!, 'EEEE, MMMM d')}
        </p>
        <div className="mt-2 text-sm text-muted-foreground">
          🎓 Premium mentoring experience with dedicated expertise and personalized guidance
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium">
              Selected Time: {bookingData.timeSlot}
            </label>
            <Button variant="link" onClick={onBack} className="text-sm">
              (Change)
            </Button>
          </div>
        </div>

        <div>
          <label className="font-medium mb-2 block">
            Message for {mentor.profiles?.first_name} (Optional)
          </label>
          <Textarea
            placeholder="Anything specific you'd like to discuss? (e.g., resume review, career advice...)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <div className="text-sm text-muted-foreground text-right mt-1">
            {message.length} / 500
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-xl font-semibold">Professional Mentoring Session</h3>
          <p className="text-sm text-muted-foreground">
            You're booking a premium mentoring experience with dedicated expertise and personalized guidance.
          </p>

          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.profiles?.profile_picture_url} />
              <AvatarFallback>{mentor.profiles?.first_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">{mentor.profiles?.first_name} {mentor.profiles?.last_name}</div>
              <div className="text-sm text-muted-foreground">{mentor.title}</div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span>{mentor.company}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {mentor.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <Badge variant="secondary">Your Mentor</Badge>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900 dark:text-green-100">
                  Join 2,847+ professionals
                </p>
                <p className="text-green-700 dark:text-green-300">
                  who've accelerated their careers
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white dark:bg-green-950/40 rounded italic text-sm">
              <Star className="w-4 h-4 inline text-yellow-500 fill-yellow-500" />
              "This session was a game-changer for my career. Worth every penny!" - Sarah M., Product Manager
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Your Investment in Success</h4>
            <p className="text-sm text-muted-foreground">
              Fair pricing that supports both you and your mentor
            </p>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <span>Premium Mentoring Session</span>
              </div>
              <span className="text-xl font-bold">R{sessionFee}</span>
            </div>
            <div className="text-sm text-muted-foreground text-right">Total Investment</div>

            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Where Your Investment Goes
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direct to your mentor (75%)</span>
                  <span className="font-medium">${mentorReceives.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform & security (25%)</span>
                  <span className="font-medium">${platformFee.toFixed(0)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Your payment directly supports expert mentors and keeps our platform secure & reliable
              </p>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="font-medium">Compare the Value</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Professional coaching: $150-300/hour</li>
                <li>• Career consultant: R200-500/session</li>
                <li>• <span className="text-primary font-medium">Expert mentoring here: R{sessionFee}/session</span> ⚡</li>
              </ul>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Risk-Free Guarantee</h4>
              </div>
              <p className="text-sm font-medium mb-3">Your Investment is 100% Protected</p>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium text-sm">24-Hour Cancellation</div>
                  <div className="text-xs text-muted-foreground">Full refund if you cancel</div>
                </div>
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-sm">No-Show Protection</div>
                  <div className="text-xs text-muted-foreground">Instant refund if mentor doesn't show</div>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium text-sm">Secure Payment</div>
                  <div className="text-xs text-muted-foreground">Bank-level encryption</div>
                </div>
              </div>

              <p className="text-sm text-center mt-4 text-muted-foreground">
                💯 Over 98% of our mentees rate their sessions as "excellent" or "life-changing"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-pink-50 dark:bg-pink-950/20 border-pink-200">
            <CardContent className="pt-6 text-center">
              <div className="text-pink-900 dark:text-pink-100 mb-2 font-medium">
                📅 Ready to Get Started?
              </div>
              <p className="text-sm text-pink-700 dark:text-pink-300 mb-4">
                Secure your mentoring session and take the next step in your professional journey
              </p>
              <div className="flex gap-2 text-xs text-pink-600 dark:text-pink-400 justify-center">
                <span>📅 Book your preferred time</span>
                <span>🚀 Start your growth today</span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Confirmation
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>SSL Secured</span>
            <span>•</span>
            <span>Money-back guarantee</span>
            <span>•</span>
            <span>24/7 support</span>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By clicking above, you agree to our terms. Your payment is processed securely by Stripe. 
            <span className="font-medium"> Join thousands</span> who've accelerated their careers through expert mentoring.
          </p>

          <Button variant="link" onClick={onBack} className="w-full">
            Cancel Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
