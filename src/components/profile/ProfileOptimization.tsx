import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Building2, 
  FileText, 
  Globe, 
  Phone, 
  Image, 
  Tag,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileOptimizationProps {
  provider: any;
  categories?: any[];
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  icon: any;
  importance: 'required' | 'recommended' | 'optional';
}

const ProfileOptimization = ({ provider, categories = [] }: ProfileOptimizationProps) => {
  // Calculate completeness checklist
  const checklist: ChecklistItem[] = [
    {
      id: 'company_name',
      label: 'Company name',
      completed: !!provider?.company_name,
      icon: Building2,
      importance: 'required'
    },
    {
      id: 'description',
      label: 'Company description',
      completed: !!provider?.description && provider.description.length > 50,
      icon: FileText,
      importance: 'required'
    },
    {
      id: 'contact_email',
      label: 'Contact email',
      completed: !!provider?.contact_email,
      icon: FileText,
      importance: 'required'
    },
    {
      id: 'contact_person',
      label: 'Contact person',
      completed: !!provider?.contact_person,
      icon: FileText,
      importance: 'required'
    },
    {
      id: 'logo',
      label: 'Company logo',
      completed: !!provider?.logo_url,
      icon: Image,
      importance: 'recommended'
    },
    {
      id: 'website',
      label: 'Company website',
      completed: !!provider?.website,
      icon: Globe,
      importance: 'recommended'
    },
    {
      id: 'phone',
      label: 'Contact phone number',
      completed: !!provider?.phone,
      icon: Phone,
      importance: 'recommended'
    },
    {
      id: 'registration',
      label: 'Business registration number',
      completed: !!provider?.business_registration_number,
      icon: FileText,
      importance: 'optional'
    },
    {
      id: 'categories',
      label: 'Service categories (at least 1)',
      completed: categories.length > 0,
      icon: Tag,
      importance: 'recommended'
    }
  ];

  const totalItems = checklist.length;
  const completedItems = checklist.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  const requiredItems = checklist.filter(item => item.importance === 'required');
  const requiredCompleted = requiredItems.filter(item => item.completed).length;
  const allRequiredComplete = requiredCompleted === requiredItems.length;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBadgeVariant = (percentage: number): 'default' | 'secondary' | 'destructive' => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const getOptimizationTip = () => {
    if (completionPercentage >= 90) {
      return "Excellent! Your profile is highly optimized for maximum visibility.";
    }
    if (completionPercentage >= 70) {
      return "Good progress! Complete the remaining items to boost your profile visibility.";
    }
    if (completionPercentage >= 50) {
      return "You're halfway there! Adding more information will improve your credibility.";
    }
    return "Complete your profile to attract more clients and increase trust.";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Profile Optimization
            </CardTitle>
            <CardDescription>
              Complete your profile to improve visibility and attract more clients
            </CardDescription>
          </div>
          <Badge variant={getScoreBadgeVariant(completionPercentage)} className="text-lg px-3 py-1">
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedItems} of {totalItems} items complete
            </span>
            <span className={`font-semibold ${getScoreColor(completionPercentage)}`}>
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Optimization Tip */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">
            💡 {getOptimizationTip()}
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Checklist</h4>
          
          {/* Required Items */}
          {requiredItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>Required</span>
              </div>
              {requiredItems.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Recommended Items */}
          {checklist.filter(item => item.importance === 'recommended').length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Recommended</span>
              </div>
              {checklist
                .filter(item => item.importance === 'recommended')
                .map((item) => (
                  <ChecklistItemRow key={item.id} item={item} />
                ))}
            </div>
          )}

          {/* Optional Items */}
          {checklist.filter(item => item.importance === 'optional').length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Circle className="h-3 w-3" />
                <span>Optional</span>
              </div>
              {checklist
                .filter(item => item.importance === 'optional')
                .map((item) => (
                  <ChecklistItemRow key={item.id} item={item} />
                ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {!allRequiredComplete || completionPercentage < 100 ? (
          <Button asChild className="w-full">
            <Link to="/become-provider">
              Complete Your Profile
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

const ChecklistItemRow = ({ item }: { item: ChecklistItem }) => {
  const Icon = item.icon;
  const StatusIcon = item.completed ? CheckCircle : Circle;
  
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
      item.completed ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'
    }`}>
      <StatusIcon 
        className={`h-4 w-4 flex-shrink-0 ${
          item.completed ? 'text-green-600' : 'text-muted-foreground'
        }`} 
      />
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className={`text-sm flex-1 ${
        item.completed ? 'text-foreground line-through' : 'text-foreground'
      }`}>
        {item.label}
      </span>
      {item.completed && (
        <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          Done
        </Badge>
      )}
    </div>
  );
};

export default ProfileOptimization;
