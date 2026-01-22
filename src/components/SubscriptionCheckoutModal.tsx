import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Receipt, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  "Unbegrenzte Angebotserstellung",
  "Einwand- und Follow-up-Funktionen",
  "PDF-, E-Mail- und WhatsApp-Export",
];

const trustAnchors = [
  { icon: Shield, text: "Keine versteckten Kosten" },
  { icon: XCircle, text: "Kündigung jederzeit möglich" },
  { icon: Receipt, text: "Rechnung für Unternehmen" },
];

export function SubscriptionCheckoutModal({
  open,
  onOpenChange,
}: SubscriptionCheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Open Stripe Checkout in new tab
        window.open(data.url, "_blank");
        onOpenChange(false);
      } else {
        throw new Error("Keine Checkout-URL erhalten");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Fehler beim Checkout",
        description: "Bitte versuche es erneut oder kontaktiere den Support.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Abo starten
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            29 € / Monat · Jederzeit kündbar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Anchors */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-1 gap-2">
              {trustAnchors.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Icon className="w-4 h-4" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            variant="cta"
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird geladen...
              </>
            ) : (
              "Abo jetzt starten"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Du wirst zu unserem sicheren Zahlungsanbieter Stripe weitergeleitet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
