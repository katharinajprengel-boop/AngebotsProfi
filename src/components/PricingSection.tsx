import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Crown } from "lucide-react";
import { SubscriptionCheckoutModal } from "./SubscriptionCheckoutModal";
import { usePremium } from "@/contexts/PremiumContext";

const plans = [
  {
    name: "Pay-per-Use",
    price: "7",
    unit: "pro Angebot",
    description: "Ideal für Einsteiger",
    features: [
      "Professionelle Angebote",
      "PDF-Export",
      "E-Mail & WhatsApp-Text",
      "Keine Vertragsbindung",
    ],
    cta: "Jetzt testen",
    variant: "outline" as const,
  },
  {
    name: "Abo",
    price: "29",
    unit: "pro Monat",
    description: "Unbegrenzte Angebote",
    popular: true,
    features: [
      "Unbegrenzte Angebote",
      "Einwand-Booster",
      "Follow-up-Generator",
      "PDF-Export mit Logo",
      "E-Mail & WhatsApp-Text",
      "Prioritäts-Support",
    ],
    cta: "Abo starten",
    ctaActive: "Dein Plan",
    variant: "cta" as const,
  },
];

export function PricingSection() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { isPremium, isLoading } = usePremium();

  const handleCtaClick = (planName: string) => {
    if (planName === "Abo" && !isPremium) {
      setIsCheckoutOpen(true);
    }
    // Pay-per-Use: TODO - implement single payment flow
  };

  return (
    <>
      <SubscriptionCheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
      />
    <section id="preise" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Einfache, faire Preise
          </h2>
          <p className="text-lg text-muted-foreground">
            Zahle nur, was du brauchst. Keine versteckten Kosten.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === "Abo" && isPremium;
            
            return (
            <div
              key={plan.name}
              className={`relative bg-card rounded-2xl border-2 p-8 transition-all ${
                isCurrentPlan
                  ? "border-success shadow-lg shadow-success/10"
                  : plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-success text-success-foreground text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  Dein Plan
                </div>
              )}
              {!isCurrentPlan && plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  Beliebt
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    {plan.price}€
                  </span>
                  <span className="text-muted-foreground">
                    {plan.unit}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-success text-success hover:bg-success/10"
                  disabled
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Premium aktiv
                </Button>
              ) : (
                <Button
                  variant={plan.variant}
                  size="lg"
                  className="w-full"
                  onClick={() => handleCtaClick(plan.name)}
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          )})}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Alle Preise verstehen sich inkl. MwSt.
        </p>
      </div>
    </section>
    </>
  );
}
