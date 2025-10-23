import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl">
        <Alert variant="friendly" className="shadow-medium">
          <AlertTitle className="text-destructive">Page Not Found</AlertTitle>
          <AlertDescription className="mb-6">
            We couldn't find the page you're looking for. It may have been moved or deleted.
          </AlertDescription>
          <Button onClick={() => navigate("/")} className="mt-4">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </Alert>
      </div>
    </div>
  );
};

export default NotFound;
