import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  TrendingUp,
  Users,
  Building,
  Target,
  Star,
  DollarSign,
  Calendar,
  Lightbulb
} from "lucide-react";

interface FundingOpportunityCardProps {
  id: string;
  title: string;
  description: string;
  fundingType: string;
  funderName: string;
  isVerified?: boolean;
  amountMin: number;
  amountMax: number;
  deadline?: string;
  matchScore?: number;
  sloaneCredits?: number;
  onApply: () => void;
  onLearnMore?: () => void;
}

const fundingTypeIcons: Record<string, any> = {
  grant: Award,
  loan: Building,
  vc: TrendingUp,
  angel: Users,
  bank_product: Building,
  accelerator: Target,
  competition: Star
};

const fundingTypeColors: Record<string, string> = {
  grant: "bg-emerald-500",
  loan: "bg-blue-500",
  vc: "bg-purple-500",
  angel: "bg-pink-500",
  bank_product: "bg-orange-500",
  accelerator: "bg-green-500",
  competition: "bg-yellow-500"
};

export const FundingOpportunityCard = ({
  title,
  description,
  fundingType,
  funderName,
  isVerified,
  amountMin,
  amountMax,
  deadline,
  matchScore,
  sloaneCredits,
  onApply,
  onLearnMore
}: FundingOpportunityCardProps) => {
  const IconComponent = fundingTypeIcons[fundingType] || Award;
  const colorClass = fundingTypeColors[fundingType] || "bg-gray-500";

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return `R${amount}`;
  };

  const formatDeadline = (deadlineStr: string) => {
    const date = new Date(deadlineStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-all group">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <Badge variant="secondary" className="capitalize">
              {fundingType.replace('_', ' ')}
            </Badge>
          </div>
          {matchScore !== undefined && (
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">{matchScore}% match</div>
              <div className="text-xs text-muted-foreground">compatibility</div>
            </div>
          )}
        </div>

        <div>
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-muted-foreground">Funder:</span>
            <span className="text-sm font-medium">{funderName}</span>
            {isVerified && (
              <Badge variant="outline" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium text-green-600">
              {formatAmount(amountMin)} - {formatAmount(amountMax)}
            </span>
          </div>

          {deadline && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">
                {formatDeadline(deadline)}
              </span>
            </div>
          )}

          {sloaneCredits !== undefined && sloaneCredits > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kumii Credits:</span>
              <Badge variant="outline" className="text-accent">
                +{sloaneCredits} Credits
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onApply}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );
};
