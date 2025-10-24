import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Package, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceMatchCardProps {
  matchId: string;
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  providerName: string;
  serviceRating: number;
  matchScore: number;
  matchReasons: string[];
  pricingType: string;
  isViewed: boolean;
  onDismiss: (matchId: string) => void;
  onView: (matchId: string) => void;
}

export const ServiceMatchCard = ({
  matchId,
  serviceId,
  serviceName,
  serviceDescription,
  providerName,
  serviceRating,
  matchScore,
  matchReasons,
  pricingType,
  isViewed,
  onDismiss,
  onView
}: ServiceMatchCardProps) => {
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
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
            <Package className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1">
            <CardTitle className="text-lg">{serviceName}</CardTitle>
            <CardDescription className="mt-1">by {providerName}</CardDescription>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 text-sm font-medium">{serviceRating.toFixed(1)}</span>
              </div>
              
              <Badge variant="outline" className="capitalize">
                {pricingType.replace('_', ' ')}
              </Badge>
              
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
          <p className="text-sm text-muted-foreground line-clamp-2">
            {serviceDescription}
          </p>
          
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
            <Link to={`/services/${serviceId}`} className="flex-1">
              <Button 
                className="w-full" 
                variant="default"
                onClick={handleViewMatch}
              >
                View Service
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
