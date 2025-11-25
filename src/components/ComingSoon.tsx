import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title?: string;
  description?: string;
  type?: "feature" | "content";
  showBackButton?: boolean;
  onBack?: () => void;
}

export const ComingSoon = ({ 
  title = "Coming Soon", 
  description,
  type = "feature",
  showBackButton = true,
  onBack
}: ComingSoonProps) => {
  const defaultDescription = type === "feature" 
    ? "This feature is currently under development and will be available soon."
    : "This content is not yet available. Please check back later.";

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {type === "feature" ? (
              <Construction className="h-16 w-16 text-rating" />
            ) : (
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description || defaultDescription}
          </CardDescription>
        </CardHeader>
        {showBackButton && (
          <CardContent>
            <Button 
              variant="outline" 
              onClick={onBack || (() => window.history.back())}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
