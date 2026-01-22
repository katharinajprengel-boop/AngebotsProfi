import { FileText, MessageSquare, Mail, Download, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "KI-Angebotsgenerator",
    description: "Aus Stichpunkten werden professionelle Angebote. Kundenfreundlich formuliert, verkaufsstark strukturiert.",
  },
  {
    icon: Shield,
    title: "Einwand-Booster",
    description: "Automatisch integrierte Antworten auf Einwände wie 'Zu teuer' oder 'Wir vergleichen noch'. Vertrauensbildend, nie aufdringlich.",
  },
  {
    icon: Mail,
    title: "Follow-up-Generator",
    description: "Nachfass-Nachrichten für E-Mail und WhatsApp. Wähle deinen Ton: freundlich, verbindlich oder verkaufsstark.",
  },
  {
    icon: Download,
    title: "Sofort exportieren",
    description: "PDF-Export, kopierfertige E-Mail-Texte und WhatsApp-Version. Mit deinem Logo und Firmennamen.",
  },
  {
    icon: Zap,
    title: "Branchenspezifisch",
    description: "Vorlagen für Elektriker, Maler, Sanitär, Heizung und mehr. Spezifisch für dein Gewerk optimiert.",
  },
  {
    icon: MessageSquare,
    title: "Klare Kommunikation",
    description: "Verständliche Sprache für Endkunden. Keine Fachbegriffe, keine Missverständnisse.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funktionen" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Alles, was du für mehr Aufträge brauchst
          </h2>
          <p className="text-lg text-muted-foreground">
            Keine Schreibarbeit. Keine komplizierten Vorlagen. 
            Einfach Stichpunkte eingeben – fertig.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
