import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import { BookingData } from "./BookSessionDialog";

interface BookingSummaryBannerProps {
  mentor: any;
  bookingData: BookingData;
}

export const BookingSummaryBanner = ({ mentor, bookingData }: BookingSummaryBannerProps) => {
  if (!bookingData.date) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">MENTOR</div>
            <div className="font-semibold">{mentor.full_name}</div>
          </div>
        </div>
        
        {bookingData.date && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">SESSION DATE</div>
              <div className="font-semibold">{format(bookingData.date, "MMM dd, yyyy")}</div>
            </div>
          </div>
        )}
        
        {bookingData.timeSlot && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">TIME SLOT</div>
              <div className="font-semibold">{bookingData.timeSlot}</div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center text-primary font-bold">R</div>
          <div>
            <div className="text-xs text-muted-foreground">SESSION FEE</div>
            <div className="font-semibold">R{mentor.session_fee || 100}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
