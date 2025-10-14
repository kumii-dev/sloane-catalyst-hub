import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SessionCountdownProps {
  scheduledAt: string;
  className?: string;
}

export const SessionCountdown = ({ scheduledAt, className = "" }: SessionCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isWithinJoinWindow: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isWithinJoinWindow: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const sessionTime = new Date(scheduledAt);
      const difference = sessionTime.getTime() - now.getTime();

      // Check if within 15 minutes before session
      const fifteenMinutesBefore = sessionTime.getTime() - (15 * 60 * 1000);
      const nowTime = now.getTime();
      const isWithinJoinWindow = nowTime >= fifteenMinutesBefore && nowTime <= sessionTime.getTime();

      if (difference < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isWithinJoinWindow: false };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isPast: false, isWithinJoinWindow };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledAt]);

  if (timeLeft.isPast) {
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
        <Clock className="w-3 h-3" />
        Session time passed
      </Badge>
    );
  }

  if (timeLeft.isWithinJoinWindow) {
    return (
      <Badge variant="default" className={`flex items-center gap-1 bg-green-600 hover:bg-green-700 animate-pulse ${className}`}>
        <Clock className="w-3 h-3" />
        Ready to join!
      </Badge>
    );
  }

  const formatTime = () => {
    const parts = [];
    
    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}d`);
    }
    if (timeLeft.hours > 0 || timeLeft.days > 0) {
      parts.push(`${timeLeft.hours}h`);
    }
    parts.push(`${timeLeft.minutes}m`);
    parts.push(`${timeLeft.seconds}s`);
    
    return parts.join(' ');
  };

  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
      <Clock className="w-3 h-3" />
      Starts in: {formatTime()}
    </Badge>
  );
};
