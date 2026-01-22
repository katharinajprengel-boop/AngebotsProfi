import { ReactNode } from "react";
import { usePremium } from "@/contexts/PremiumContext";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
  featureName?: string;
}

/**
 * Component that gates content behind premium subscription.
 * Shows children if user is premium, otherwise shows fallback or lock UI.
 */
export function PremiumGate({ 
  children, 
  fallback, 
  showLock = true,
  featureName = "Diese Funktion"
}: PremiumGateProps) {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-20" />
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLock) {
    return (
      <div className="relative rounded-xl border border-border bg-card/50 p-6 text-center">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Premium-Funktion</p>
            <p className="text-sm text-muted-foreground">
              {featureName} ist nur mit einem Abo verfügbar.
            </p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <a href="/#preise">Abo starten</a>
          </Button>
        </div>
        <div className="opacity-20 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Hook to conditionally render premium-only content
 */
export function usePremiumFeature() {
  const { isPremium, isLoading } = usePremium();
  
  return {
    isPremium,
    isLoading,
    canAccess: isPremium,
  };
}
