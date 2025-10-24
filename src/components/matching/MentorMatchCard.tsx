import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User, Eye, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface MentorMatchCardProps {
  matchId: string;
  mentorId: string;
  mentorName: string;
  mentorTitle: string;
  mentorCompany?: string;
  mentorAvatar?: string;
  mentorRating: number;
  matchScore: number;
  matchReasons: string[];
  isViewed: boolean;
  onDismiss: (matchId: string) => void;
  onView: (matchId: string) => void;
}

export const MentorMatchCard = ({
  matchId,
  mentorId,
  mentorName,
  mentorTitle,
  mentorCompany,
  mentorAvatar,
  mentorRating,
  matchScore,
  matchReasons,
  isViewed,
  onDismiss,
  onView
}: MentorMatchCardProps) => {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Potential Match";
  };

  const handleViewMatch = () => {
    if (!isViewed) {
      onView(matchId);
    }
  };

  return (
    <Card className={`relative ${!isViewed ? 'ring-2 ring-primary/30' : ''}`}>
      {!isViewed && (
        <Badge 
          variant="default" 
          className="absolute top-3 right-3 bg-primary text-primary-foreground"
        >
          New Match
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={mentorAvatar} alt={mentorName} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">{mentorName}</CardTitle>
            <CardDescription className="mt-1">{mentorTitle}</CardDescription>
            {mentorCompany && (
              <p className="text-sm text-muted-foreground mt-1">{mentorCompany}</p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 text-sm font-medium">{mentorRating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(matchScore)}`} />
                <span className="ml-2 text-sm font-medium">{matchScore}%</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  {getMatchScoreLabel(matchScore)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Why we matched you:</h4>
            <div className="flex flex-wrap gap-2">
              {matchReasons.map((reason, index) => (
                <Badge key={index} variant="secondary">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to={`/mentor-profile/${mentorId}`} className="flex-1">
              <Button 
                className="w-full" 
                variant="default"
                onClick={handleViewMatch}
              >
                View Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDismiss(matchId)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
