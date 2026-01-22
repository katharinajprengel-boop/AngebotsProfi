import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardList, Sparkles, Send, Clock, TrendingUp, MessageSquare, Shield } from "lucide-react";

interface LearnMoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartClick: () => void;
}

export function LearnMoreModal({ open, onOpenChange, onStartClick }: LearnMoreModalProps) {
  const steps = [
    {
      number: "1",
      icon: ClipboardList,
      title: "Stichpunkte eingeben",
      description: "Leistung, Preis und Dauer eintragen – kein Schreiben nötig."
    },
    {
      number: "2",
      icon: Sparkles,
      title: "Angebot erstellen lassen",
      description: "Professionell formuliert, kundenfreundlich und übersichtlich."
    },
    {
      number: "3",
      icon: Send,
      title: "Versenden & Aufträge gewinnen",
      description: "Als PDF, per E-Mail oder WhatsApp."
    }
  ];

  const benefits = [
    {
      icon: Clock,
      text: "Spart bis zu 80 % Zeit pro Angebot"
    },
    {
      icon: TrendingUp,
      text: "Wirkt professionell und erhöht die Abschlusschance"
    },
    {
      icon: MessageSquare,
      text: "Kein Texten, kein Grübeln, keine Unsicherheit"
    }
  ];

  const handleStartClick = () => {
    onOpenChange(false);
    onStartClick();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground">
            So funktioniert AngebotsPro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* 3-Schritte-Erklärung */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {step.number}. {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Nutzen */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <benefit.icon className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Vertrauensanker */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-foreground font-medium">
                  Entwickelt speziell für Handwerker & Dienstleister.
                </p>
                <p className="text-muted-foreground text-sm">
                  Keine komplizierte Software. Keine KI-Kenntnisse nötig.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button 
            variant="cta" 
            size="lg" 
            className="w-full"
            onClick={handleStartClick}
          >
            Erstes Angebot erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
