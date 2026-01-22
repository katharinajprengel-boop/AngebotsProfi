import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, Zap, Crown } from "lucide-react";
import { LearnMoreModal } from "@/components/LearnMoreModal";
import { usePremium } from "@/contexts/PremiumContext";

export function HeroSection() {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const { isPremium, isAuthenticated } = usePremium();

  const scrollToGenerator = () => {
    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <LearnMoreModal 
        open={showLearnMore} 
        onOpenChange={setShowLearnMore}
        onStartClick={scrollToGenerator}
      />
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10" />

      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {isPremium ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-6 animate-fade-in">
              <Crown className="w-4 h-4" />
              <span>Premium aktiv · Unbegrenzte Angebote</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>Entwickelt speziell für Handwerker</span>
            </div>
          )}

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6 animate-slide-up">
            Deine Arbeit ist gut –{" "}
            <span className="text-gradient-hero">dein Angebot sollte es auch sein.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Erstelle professionelle Angebote in unter 2 Minuten und gewinne mehr Aufträge. 
            Ohne Schreibarbeit. Ohne Vorlagen-Chaos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="cta" size="xl" onClick={scrollToGenerator}>
              {isPremium ? "Jetzt Angebot erstellen" : "Jetzt kostenlos testen"}
              <ArrowRight className="w-5 h-5" />
            </Button>
            {!isPremium && (
              <Button variant="heroOutline" size="xl" onClick={() => setShowLearnMore(true)}>
                Mehr erfahren
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {isPremium ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Unbegrenzte Angebote</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Angebot in 2 Minuten</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Premium-Support</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Keine Kreditkarte nötig</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Angebot in 2 Minuten</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>Sofort nutzbar</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hero Visual / Preview */}
        <div className="mt-16 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-3xl" />
            
            {/* Preview Card */}
            <div className="relative bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-secondary/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-2 text-sm text-muted-foreground">Angebot-Vorschau</span>
              </div>
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Angebot Nr. 2024-0847</h3>
                    <p className="text-muted-foreground">Elektroinstallation Einfamilienhaus</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">4.850 €</p>
                    <p className="text-sm text-muted-foreground">inkl. MwSt.</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Komplette Neuverkabelung nach VDE-Norm</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Installation von 24 Steckdosen & 12 Lichtschaltern</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Neue Unterverteilung mit FI-Schutzschalter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
