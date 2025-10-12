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
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="space-y-3">
        <Badge className="bg-primary text-primary-foreground">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Professional Session
        </Badge>
        <h2 className="text-3xl font-bold">{mentor.expertise_areas?.[0] || "Mentorship"} Session</h2>
        <p className="text-muted-foreground">
          with {mentor.profiles?.first_name} {mentor.profiles?.last_name} • {format(bookingData.date!, 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Mentor Card */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/10">
              <AvatarImage src={mentor.profiles?.profile_picture_url} />
              <AvatarFallback className="text-lg">{mentor.profiles?.first_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <div className="font-semibold text-lg">{mentor.profiles?.first_name} {mentor.profiles?.last_name}</div>
                <div className="text-muted-foreground">{mentor.title}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {mentor.company}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-rating text-rating" />
                  {mentor.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card className="shadow-soft">
        <CardContent className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Selected Time</label>
              <Button variant="link" onClick={onBack} className="h-auto p-0 text-primary">
                Change
              </Button>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5 text-primary" />
              {bookingData.timeSlot}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Session Focus (Optional)
            </label>
            <Textarea
              placeholder="What would you like to focus on? (e.g., career strategy, skill development, industry insights...)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {message.length} / 500
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="shadow-soft border-2">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="font-medium">Session Fee</span>
            <span className="text-3xl font-bold">R{sessionFee}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Mentor receives (75%)</span>
              <span className="font-medium text-foreground">R{mentorReceives.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform fee (25%)</span>
              <span className="font-medium text-foreground">R{platformFee.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4 border-t">
            <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <div className="font-medium">Protected Booking</div>
              <div className="text-muted-foreground">
                Full refund if mentor cancels or doesn't show • 24-hour cancellation policy
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-3 pt-2">
        <Button onClick={handleContinue} className="w-full h-12 text-base" size="lg">
          Continue to Confirmation
        </Button>
        <Button variant="ghost" onClick={onBack} className="w-full">
          Cancel Booking
        </Button>
      </div>
    </div>
  );
};
