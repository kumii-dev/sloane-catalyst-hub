import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen main-gradient-light flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Smartphone className="w-16 h-16 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Install Kumii</h1>
          <p className="text-muted-foreground text-lg">
            Get instant access to our platform from your home screen. Works offline and loads instantly!
          </p>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <Check className="w-6 h-6 text-green-500" />
              <p className="text-green-700 dark:text-green-400 font-medium">
                App is already installed!
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full" size="lg">
              Go to Home
            </Button>
          </div>
        ) : canInstall ? (
          <div className="space-y-4">
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Click the button above to add this app to your home screen
            </p>
          </div>
        ) : isIOS && isSafari ? (
          <div className="space-y-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm font-medium text-center">To install on iOS:</p>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li>1. Tap the Share button in Safari (at the bottom of the screen)</li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" in the top right corner</li>
            </ol>
          </div>
        ) : isIOS ? (
          <div className="space-y-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                To install this app on iOS, please open this page in Safari browser
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm text-center text-muted-foreground">
              To install this app, use your browser's menu and look for "Install" or "Add to Home Screen" option
            </p>
          </div>
        )}

        <div className="pt-6 space-y-3 border-t">
          <h3 className="font-semibold text-center">Benefits of Installing:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Quick access from your home screen</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Works offline with cached content</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Faster loading with optimized caching</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Full-screen experience without browser UI</span>
            </li>
          </ul>
        </div>

        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
          Continue in Browser
        </Button>
      </Card>
    </div>
  );
};

export default InstallPWA;
