import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Sparkles, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/contexts/PremiumContext";

type VerificationStatus = "loading" | "success" | "error" | "unauthenticated";

export default function SubscriptionSuccess() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const { refreshPremiumStatus, isAuthenticated } = usePremium();

  const verifySubscription = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setStatus("unauthenticated");
        setErrorMessage("Bitte melden Sie sich an, um Ihren Abo-Status zu überprüfen.");
        return;
      }

      // Call check-subscription edge function
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setErrorMessage("Fehler bei der Überprüfung. Bitte versuchen Sie es erneut.");
        return;
      }

      if (data?.premium === true) {
        setStatus("success");
        // Refresh the global premium state
        await refreshPremiumStatus();
      } else {
        // Subscription not yet active - might need to wait for Stripe webhook
        setStatus("error");
        setErrorMessage(
          "Wir konnten den Abo-Status noch nicht bestätigen. " +
          "Dies kann einige Sekunden dauern. Bitte versuchen Sie es erneut."
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatus("error");
      setErrorMessage("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }, [refreshPremiumStatus]);

  // Auto-verify on mount and retry a few times
  useEffect(() => {
    const timer = setTimeout(() => {
      verifySubscription();
    }, 1500); // Small delay to allow Stripe to process

    return () => clearTimeout(timer);
  }, [verifySubscription, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Loading State */}
        {status === "loading" && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Abo wird aktiviert...
              </h1>
              <p className="text-muted-foreground">
                Vielen Dank! Ihr Premium-Zugang wird jetzt geprüft und freigeschaltet.
              </p>
            </div>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-success/10 rounded-full">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                Willkommen bei Anbot Premium! 🎉
              </h1>
              <p className="text-lg text-muted-foreground">
                Dein Abo ist jetzt aktiv. Du hast ab sofort unbegrenzten Zugang zu
                allen Premium-Funktionen.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Sparkles className="w-5 h-5 text-primary" />
                Deine Premium-Vorteile
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Unbegrenzte Angebote erstellen</li>
                <li>✓ Einwand-Booster für mehr Abschlüsse</li>
                <li>✓ Follow-up-Generator</li>
                <li>✓ PDF-Export mit eigenem Logo</li>
                <li>✓ E-Mail & WhatsApp-Vorlagen</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button variant="cta" size="lg" className="w-full" asChild>
                <Link to="/">
                  Jetzt Angebot erstellen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Du erhältst eine Bestätigungs-E-Mail mit deiner Rechnung.
              </p>
            </div>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="relative flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Überprüfung fehlgeschlagen
              </h1>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                variant="cta" 
                size="lg" 
                className="w-full" 
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut prüfen
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/">
                  Zurück zur Startseite
                </Link>
              </Button>
            </div>
          </>
        )}

        {/* Unauthenticated State */}
        {status === "unauthenticated" && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="relative flex items-center justify-center w-20 h-20 bg-muted rounded-full">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Anmeldung erforderlich
              </h1>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </div>

            <div className="space-y-4">
              <Button variant="cta" size="lg" className="w-full" asChild>
                <Link to="/">
                  Zur Anmeldung
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
