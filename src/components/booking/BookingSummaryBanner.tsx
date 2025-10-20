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
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">MENTOR</div>
            <div className="font-semibold text-sm sm:text-base truncate">{mentor.full_name}</div>
          </div>
        </div>
        
        {bookingData.date && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">SESSION DATE</div>
              <div className="font-semibold text-sm sm:text-base truncate">{format(bookingData.date, "MMM dd, yyyy")}</div>
            </div>
          </div>
        )}
        
        {bookingData.timeSlot && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">TIME SLOT</div>
              <div className="font-semibold text-sm sm:text-base truncate">{bookingData.timeSlot}</div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-primary font-bold flex-shrink-0">R</div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">SESSION FEE</div>
            <div className="font-semibold text-sm sm:text-base">R{mentor.session_fee || 100}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
