import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Download, 
  MessageSquare, 
  ChevronRight,
  CheckCircle2,
  Loader2,
  Lock
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { usePremium } from "@/contexts/PremiumContext";
import { useOfferLimits } from "@/hooks/useOfferLimits";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const gewerke = [
  "Elektroinstallation",
  "Sanitär & Heizung",
  "Malerarbeiten",
  "Trockenbau",
  "Fliesenlegen",
  "Gartenarbeit",
  "Dachdecker",
  "Tischlerarbeiten",
  "Sonstiges",
];

// Gewerk-spezifische Inhalte für passgenaue Angebote
const gewerkDetails: Record<string, {
  nutzen: string[];
  warumWir: string[];
  gewaehrleistung: string;
  abschluss: string;
}> = {
  "Elektroinstallation": {
    nutzen: [
      "Sichere Stromversorgung nach aktuellen VDE-Normen",
      "Schutz vor Überlastung und Kurzschluss",
      "Zuverlässige Funktion aller Anschlüsse und Schalter",
      "Vorbereitung für zukünftige Erweiterungen",
    ],
    warumWir: [
      "Ausgebildete Elektrofachkräfte mit Meisterqualifikation",
      "Prüfprotokoll und Dokumentation aller Arbeiten",
      "Termingerechte Ausführung ohne böse Überraschungen",
      "5 Jahre Gewährleistung auf alle Installationen",
    ],
    gewaehrleistung: "5 Jahre Gewährleistung auf alle Elektroarbeiten gemäß VOB",
    abschluss: "Bei Elektroarbeiten gehen wir keine Kompromisse ein. Sie können sich darauf verlassen, dass alles sicher und normgerecht installiert wird.",
  },
  "Sanitär & Heizung": {
    nutzen: [
      "Zuverlässige Wärme- und Wasserversorgung",
      "Energieeffiziente Lösungen, die Heizkosten sparen",
      "Dichte Leitungen ohne Wasserschäden",
      "Komfortable Bedienung im Alltag",
    ],
    warumWir: [
      "Erfahrene SHK-Fachleute mit Meisterbetrieb",
      "Saubere Arbeitsweise – Ihr Bad bleibt ordentlich",
      "Abstimmung mit Ihnen vor jedem Arbeitsschritt",
      "5 Jahre Gewährleistung auf alle Installationen",
    ],
    gewaehrleistung: "5 Jahre Gewährleistung auf Rohrleitungen und Anschlüsse",
    abschluss: "Wasser und Wärme sind Vertrauenssache. Wir sorgen dafür, dass beides funktioniert – heute und in den nächsten Jahren.",
  },
  "Malerarbeiten": {
    nutzen: [
      "Frischer, gepflegter Gesamteindruck Ihrer Räume",
      "Langlebige Farboberflächen durch professionelle Vorbereitung",
      "Saubere Kanten und gleichmäßige Flächen",
      "Schutz der Bausubstanz vor Feuchtigkeit und Verschleiß",
    ],
    warumWir: [
      "Erfahrene Maler mit Blick fürs Detail",
      "Sorgfältige Abdeckung und Schutz Ihrer Möbel",
      "Hochwertige Farben und Materialien",
      "2 Jahre Gewährleistung auf alle Malerarbeiten",
    ],
    gewaehrleistung: "2 Jahre Gewährleistung auf Anstricharbeiten",
    abschluss: "Ein guter Anstrich ist mehr als Farbe – er wertet Ihre Räume auf und hält viele Jahre. Wir machen das ordentlich.",
  },
  "Trockenbau": {
    nutzen: [
      "Flexible Raumgestaltung ohne große Bauarbeiten",
      "Verbesserte Schall- und Wärmedämmung",
      "Glatte, tapezier- oder streichfertige Oberflächen",
      "Schnelle Umsetzung mit wenig Schmutz",
    ],
    warumWir: [
      "Präzise Arbeitsweise für perfekte Ergebnisse",
      "Erfahrung mit allen Wandsystemen",
      "Ordentliche Baustelle – täglich aufgeräumt",
      "5 Jahre Gewährleistung auf alle Konstruktionen",
    ],
    gewaehrleistung: "5 Jahre Gewährleistung auf Trockenbaukonstruktionen",
    abschluss: "Trockenbau erfordert Präzision. Bei uns stimmt jede Kante – das sehen Sie am fertigen Ergebnis.",
  },
  "Fliesenlegen": {
    nutzen: [
      "Langlebige, pflegeleichte Oberflächen",
      "Saubere Fugen und exakte Fluchten",
      "Wasserdichte Ausführung in Nassbereichen",
      "Wertsteigerung Ihrer Immobilie",
    ],
    warumWir: [
      "Fliesenleger mit jahrelanger Erfahrung",
      "Sorgfältige Untergrundvorbereitung",
      "Beratung bei Materialauswahl auf Wunsch",
      "5 Jahre Gewährleistung auf alle Fliesenarbeiten",
    ],
    gewaehrleistung: "5 Jahre Gewährleistung auf Fliesen- und Fugenarbeiten",
    abschluss: "Fliesen sind für Jahrzehnte. Wir verlegen sie so, dass Sie lange Freude daran haben.",
  },
  "Gartenarbeit": {
    nutzen: [
      "Gepflegter Außenbereich, der Freude macht",
      "Weniger eigener Aufwand für Sie",
      "Fachgerechter Rückschnitt für gesundes Pflanzenwachstum",
      "Saubere Entsorgung aller Gartenabfälle",
    ],
    warumWir: [
      "Erfahrene Gärtner mit Liebe zum Detail",
      "Zuverlässige Terminabsprache",
      "Eigenes Werkzeug und Entsorgung inklusive",
      "Gewährleistung auf Pflanzarbeiten",
    ],
    gewaehrleistung: "1 Jahr Anwachsgarantie auf neu gesetzte Pflanzen",
    abschluss: "Ein schöner Garten braucht Pflege. Wir übernehmen das gerne für Sie – zuverlässig und gründlich.",
  },
  "Dachdecker": {
    nutzen: [
      "Dichtes Dach – Schutz vor Regen und Feuchtigkeit",
      "Langfristiger Werterhalt Ihrer Immobilie",
      "Verbesserte Energieeffizienz durch intakte Dämmung",
      "Sicherheit bei Sturm und Unwetter",
    ],
    warumWir: [
      "Dachdeckermeister mit Fachkenntnis",
      "Absicherung der Baustelle für Ihre Sicherheit",
      "Dokumentation aller Arbeiten",
      "10 Jahre Gewährleistung auf Dacharbeiten",
    ],
    gewaehrleistung: "10 Jahre Gewährleistung auf Dachabdichtung und -eindeckung",
    abschluss: "Ein intaktes Dach gibt Ihnen Sicherheit. Wir sorgen dafür, dass es Sie und Ihr Haus zuverlässig schützt.",
  },
  "Tischlerarbeiten": {
    nutzen: [
      "Maßgefertigte Lösungen, die genau passen",
      "Hochwertige Verarbeitung für lange Haltbarkeit",
      "Funktionale und optisch ansprechende Ergebnisse",
      "Individuelle Beratung zu Material und Design",
    ],
    warumWir: [
      "Tischlermeister mit Erfahrung",
      "Fertigung in eigener Werkstatt",
      "Montage mit Sorgfalt vor Ort",
      "5 Jahre Gewährleistung auf alle Arbeiten",
    ],
    gewaehrleistung: "5 Jahre Gewährleistung auf Tischlerarbeiten",
    abschluss: "Gute Tischlerarbeit sieht man und spürt man. Bei uns bekommen Sie Handwerk, auf das Sie sich verlassen können.",
  },
  "Sonstiges": {
    nutzen: [
      "Fachgerechte Ausführung nach Ihren Anforderungen",
      "Sorgfältige Arbeitsweise für ein sauberes Ergebnis",
      "Transparente Kommunikation während des Projekts",
      "Ordentliche Übergabe nach Fertigstellung",
    ],
    warumWir: [
      "Erfahrene Handwerker mit breitem Know-how",
      "Zuverlässigkeit und Termintreue",
      "Persönlicher Ansprechpartner für Ihr Projekt",
      "Gewährleistung gemäß gesetzlicher Regelung",
    ],
    gewaehrleistung: "Gewährleistung gemäß gesetzlicher Regelung (min. 2 Jahre)",
    abschluss: "Wir machen unsere Arbeit so, wie wir sie auch bei uns zu Hause machen würden – ordentlich und zuverlässig.",
  },
};

export function QuoteGenerator() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<string | null>(null);
  const [showLimitGate, setShowLimitGate] = useState(false);
  const [showPremiumPdfGate, setShowPremiumPdfGate] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const navigate = useNavigate();
  const { isPremium, isAuthenticated, userId } = usePremium();
  const { canCreateOffer, incrementOfferCount, hasUsedFreeOffer } = useOfferLimits();
  
  const [formData, setFormData] = useState({
    gewerk: "",
    kundenname: "",
    firmenname: "",
    leistung: "",
    preis: "",
    dauer: "",
    besonderheiten: "",
  });

  useEffect(() => {
    const loadCompanyLogo = async () => {
      if (!isAuthenticated || !userId) {
        setCompanyLogoUrl(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles_public" as any)
        .select("company_logo_url")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error) {
        setCompanyLogoUrl((data as any)?.company_logo_url ?? null);
      }
    };

    loadCompanyLogo();
  }, [isAuthenticated, userId]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!isAuthenticated || !userId) {
      toast.info("Bitte melde dich an, um dein Logo zu speichern.");
      navigate("/auth");
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Bitte lade ein PNG oder JPG hoch.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("Maximale Dateigröße: 1 MB.");
      event.target.value = "";
      return;
    }

    setIsUploadingLogo(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { error } = await supabase
        .from("profiles" as any)
        .update({ company_logo_url: dataUrl })
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setCompanyLogoUrl(dataUrl);
      toast.success("Logo gespeichert.");
    } catch (err) {
      console.error("Logo upload failed:", err);
      toast.error("Logo konnte nicht gespeichert werden.");
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  };

  const handleLogoRemove = async () => {
    if (!isAuthenticated || !userId) {
      toast.info("Bitte melde dich an, um dein Logo zu entfernen.");
      navigate("/auth");
      return;
    }

    setIsUploadingLogo(true);

    try {
      const { error } = await supabase
        .from("profiles" as any)
        .update({ company_logo_url: null })
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setCompanyLogoUrl(null);
      toast.success("Logo entfernt.");
    } catch (err) {
      console.error("Logo remove failed:", err);
      toast.error("Logo konnte nicht entfernt werden.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const getImageTypeFromDataUrl = (dataUrl: string) => {
    if (dataUrl.startsWith("data:image/png")) return "PNG";
    if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
    return null;
  };

  const handleGenerate = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.info("Bitte melde dich an, um Angebote zu erstellen.");
      navigate("/auth");
      return;
    }

    // Limit check for non-premium users
    if (!isPremium && !canCreateOffer) {
      setShowLimitGate(true);
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const kundenanrede = formData.kundenname
      ? `Sehr geehrte/r ${formData.kundenname}` 
      : "Sehr geehrte Damen und Herren";
    
    const firmenzeile = formData.firmenname 
      ? `\n${formData.firmenname}\n` 
      : "";

    const leistungspunkte = formData.leistung
      .split("\n")
      .filter(l => l.trim())
      .map(l => `• ${l.trim()}`)
      .join("\n");

    // Gewerk-spezifische Inhalte laden
    const details = gewerkDetails[formData.gewerk] || gewerkDetails["Sonstiges"];
    const nutzenPunkte = details.nutzen.map(n => `• ${n}`).join("\n");
    const warumWirPunkte = details.warumWir.map(w => `✓ ${w}`).join("\n");

    const quote = `═══════════════════════════════════════
           A N G E B O T
═══════════════════════════════════════
${firmenzeile}
${kundenanrede},

vielen Dank für Ihr Vertrauen und Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:

───────────────────────────────────────
LEISTUNGSUMFANG | ${formData.gewerk}
───────────────────────────────────────

${leistungspunkte}

───────────────────────────────────────
WAS SIE DAVON HABEN
───────────────────────────────────────

${nutzenPunkte}
${formData.besonderheiten ? `\nZusätzlich: ${formData.besonderheiten}` : ""}

───────────────────────────────────────
IHRE INVESTITION
───────────────────────────────────────

Gesamtpreis: ${formData.preis} € (inkl. MwSt.)

Dies ist ein verbindlicher Festpreis. Zusätzliche Kosten entstehen nur nach vorheriger Absprache mit Ihnen.

───────────────────────────────────────
AUSFÜHRUNG
───────────────────────────────────────

Geplante Dauer: ${formData.dauer}
Den genauen Termin stimmen wir nach Auftragserteilung gemeinsam ab.

───────────────────────────────────────
WARUM WIR DER RICHTIGE PARTNER SIND
───────────────────────────────────────

${warumWirPunkte}

───────────────────────────────────────
ZAHLUNGSWEISE
───────────────────────────────────────

• 50% Anzahlung bei Auftragserteilung
• 50% nach Abnahme der fertigen Arbeit
• Zahlungsziel: 14 Tage nach Rechnungsstellung

───────────────────────────────────────
GEWÄHRLEISTUNG
───────────────────────────────────────

${details.gewaehrleistung}

───────────────────────────────────────

${details.abschluss}

Dieses Angebot ist 14 Tage gültig. Bei Fragen melden Sie sich gerne.

Mit freundlichen Grüßen
Ihr Handwerksbetrieb`;

    setGeneratedQuote(quote);
    
    // Increment offer count for non-premium users after successful generation
    if (isAuthenticated && !isPremium) {
      await incrementOfferCount();
    }
    
    setIsGenerating(false);
    setStep(3);
  };

  const copyToClipboard = () => {
    if (generatedQuote) {
      navigator.clipboard.writeText(generatedQuote);
      toast.success("Angebot in die Zwischenablage kopiert!");
    }
  };

  const downloadPDF = async () => {
    if (!isPremium) {
      setShowPremiumPdfGate(true);
      return;
    }

    if (!generatedQuote) {
      return;
    }

    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 14;
      let y = margin;
      const details = gewerkDetails[formData.gewerk] || gewerkDetails["Sonstiges"];

      const ensureSpace = (height: number) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addSectionTitle = (title: string) => {
        ensureSpace(28);
        doc.setFillColor(245, 246, 248);
        doc.rect(margin, y - 14, maxWidth, 22, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(33, 37, 41);
        doc.text(title, margin + 8, y + 2);
        y += 26;
      };

      const addWrappedText = (text: string, fontSize = 11, spacing = lineHeight) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(33, 37, 41);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          ensureSpace(spacing);
          doc.text(line, margin, y);
          y += spacing;
        });
      };

      const addBulletList = (items: string[]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(33, 37, 41);
        const indent = 14;
        items.filter(Boolean).forEach((item) => {
          const lines = doc.splitTextToSize(item, maxWidth - indent);
          lines.forEach((line: string, index: number) => {
            ensureSpace(lineHeight);
            if (index === 0) {
              doc.text(`• ${line}`, margin, y);
            } else {
              doc.text(line, margin + indent, y);
            }
            y += lineHeight;
          });
        });
      };

      if (companyLogoUrl) {
        const imageType = getImageTypeFromDataUrl(companyLogoUrl);
        if (imageType) {
          const props = doc.getImageProperties(companyLogoUrl);
          const maxWidth = 140;
          const imgWidth = Math.min(maxWidth, props.width);
          const imgHeight = props.height * (imgWidth / props.width);
          doc.addImage(companyLogoUrl, imageType, margin, y, imgWidth, imgHeight);
          y += imgHeight + 12;
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(19, 34, 68);
      doc.text("Angebot", pageWidth - margin, y, { align: "right" });
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      const dateString = new Date().toLocaleDateString("de-DE");
      const offerNumber = `AN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
      doc.text(`Datum: ${dateString}`, pageWidth - margin, y, { align: "right" });
      y += 16;
      doc.text(`Angebotsnr.: ${offerNumber}`, pageWidth - margin, y, { align: "right" });
      y += 20;

      if (formData.firmenname) {
        doc.setFont("helvetica", "bold");
        doc.text(formData.firmenname, margin, y);
        y += 16;
      }

      const kundenAnrede = formData.kundenname
        ? `Kunde: ${formData.kundenname}`
        : "Kunde: –";
      doc.setFont("helvetica", "normal");
      doc.text(kundenAnrede, margin, y);
      y += 20;

      addSectionTitle(`Leistungsumfang · ${formData.gewerk || "Leistung"}`);
      const leistungItems = formData.leistung
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      addBulletList(leistungItems);

      if (formData.besonderheiten) {
        y += 6;
        addWrappedText(`Besonderheiten: ${formData.besonderheiten}`);
      }

      y += 6;
      addSectionTitle("Ihre Vorteile");
      addBulletList(details.nutzen);

      y += 6;
      addSectionTitle("Ausführung");
      addWrappedText(
        `Geplante Dauer: ${formData.dauer || "—"}\nDen genauen Termin stimmen wir nach Auftragserteilung gemeinsam ab.`,
      );

      y += 6;
      addSectionTitle("Investition");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`Gesamtpreis: ${formData.preis || "—"} € (inkl. MwSt.)`, margin, y);
      y += 18;
      addWrappedText(
        "Dies ist ein verbindlicher Festpreis. Zusätzliche Kosten entstehen nur nach vorheriger Absprache.",
      );

      y += 6;
      addSectionTitle("Zahlungsweise");
      addBulletList([
        "50% Anzahlung bei Auftragserteilung",
        "50% nach Abnahme der fertigen Arbeit",
        "Zahlungsziel: 14 Tage nach Rechnungsstellung",
      ]);

      y += 6;
      addSectionTitle("Gewährleistung");
      addWrappedText(details.gewaehrleistung);

      y += 6;
      addSectionTitle("Warum wir der richtige Partner sind");
      addBulletList(details.warumWir);

      y += 6;
      addSectionTitle("Abschluss");
      addWrappedText(details.abschluss);
      y += 6;
      addWrappedText(
        "Dieses Angebot ist 14 Tage gültig. Bei Fragen melden Sie sich gerne.\n\nMit freundlichen Grüßen\nIhr Handwerksbetrieb",
      );

      doc.save(`angebot-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF konnte nicht erstellt werden.");
    }
  };

  const sendWhatsApp = () => {
    if (generatedQuote) {
      const encoded = encodeURIComponent(generatedQuote);
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
  };

  const resetForm = () => {
    setStep(1);
    setGeneratedQuote(null);
    setFormData({
      gewerk: "",
      kundenname: "",
      firmenname: "",
      leistung: "",
      preis: "",
      dauer: "",
      besonderheiten: "",
    });
  };

  return (
    <>
      {/* Premium Limit Gate Overlay */}
      {showLimitGate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Premium-Funktion</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Du hast dein kostenloses Angebot für diesen Monat genutzt.
              <br />
              Mit Premium erstellst du unbegrenzt Angebote für deinen Betrieb.
            </p>
            <Button variant="cta" size="lg" asChild className="w-full mb-3">
              <a href="/#preise">Premium freischalten</a>
            </Button>
            <button 
              onClick={() => setShowLimitGate(false)}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              Später
            </button>
          </div>
        </div>
      )}

      {showPremiumPdfGate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8 max-w-md text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Premium-Funktion</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Der PDF-Export mit deinem Logo ist nur in Premium enthalten.
              <br />
              Schalte Premium frei, um unbegrenzt PDFs zu erstellen.
            </p>
            <Button variant="cta" size="lg" asChild className="w-full mb-3">
              <a href="/#preise">Premium freischalten</a>
            </Button>
            <button
              onClick={() => setShowPremiumPdfGate(false)}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              Später
            </button>
          </div>
        </div>
      )}

      <section id="generator" className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>KI-gestützter Generator</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Erstelle jetzt dein Angebot
          </h2>
          <p className="text-lg text-muted-foreground">
            3 einfache Schritte. Unter 2 Minuten. Professionelles Ergebnis.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <ChevronRight className={`w-5 h-5 ${step > s ? "text-primary" : "text-muted-foreground"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-foreground font-medium" : ""}>Gewerk</span>
            <span className={step >= 2 ? "text-foreground font-medium" : ""}>Details</span>
            <span className={step >= 3 ? "text-foreground font-medium" : ""}>Angebot</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Step 1: Select Trade */}
            {step === 1 && (
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Wähle dein Gewerk
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gewerke.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setFormData({ ...formData, gewerk: g });
                        setStep(2);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                        formData.gewerk === g
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      <span className="font-medium text-foreground">{g}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Enter Details */}
            {step === 2 && (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">
                    {formData.gewerk}
                  </h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-primary hover:underline"
                  >
                    Ändern
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Kundeninfo */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Kundenname
                      </label>
                      <input
                        type="text"
                        value={formData.kundenname}
                        onChange={(e) => setFormData({ ...formData, kundenname: e.target.value })}
                        placeholder="z.B. Herr Müller"
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Firmenname
                      </label>
                      <input
                        type="text"
                        value={formData.firmenname}
                        onChange={(e) => setFormData({ ...formData, firmenname: e.target.value })}
                        placeholder="z.B. Müller GmbH"
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Firmenlogo (optional)
                    </label>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="h-16 w-16 rounded-xl border-2 border-dashed border-input flex items-center justify-center bg-background overflow-hidden">
                        {companyLogoUrl ? (
                          <img
                            src={companyLogoUrl}
                            alt="Firmenlogo"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">Logo</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          PNG/JPG, max. 1 MB. Wird im PDF verwendet.
                        </p>
                      </div>
                      {companyLogoUrl && (
                        <button
                          type="button"
                          onClick={handleLogoRemove}
                          disabled={isUploadingLogo}
                          className="text-sm text-primary hover:underline disabled:opacity-50"
                        >
                          Entfernen
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Leistungsbeschreibung *
                    </label>
                    <textarea
                      value={formData.leistung}
                      onChange={(e) => setFormData({ ...formData, leistung: e.target.value })}
                      placeholder="Beschreibe die Arbeiten in Stichpunkten...&#10;z.B.: Neue Steckdosen im Wohnzimmer&#10;Installation Außenbeleuchtung&#10;Zählerschrank erneuern"
                      className="w-full h-32 px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Preis (€) *
                      </label>
                      <input
                        type="text"
                        value={formData.preis}
                        onChange={(e) => setFormData({ ...formData, preis: e.target.value })}
                        placeholder="z.B. 2.500"
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ausführungszeitraum *
                      </label>
                      <input
                        type="text"
                        value={formData.dauer}
                        onChange={(e) => setFormData({ ...formData, dauer: e.target.value })}
                        placeholder="z.B. 2 Arbeitstage"
                        className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Besonderheiten (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.besonderheiten}
                      onChange={(e) => setFormData({ ...formData, besonderheiten: e.target.value })}
                      placeholder="z.B. Materialkosten inklusive"
                      className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={!formData.leistung || !formData.preis || !formData.dauer || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Angebot wird erstellt...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Angebot generieren
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Generated Quote */}
            {step === 3 && generatedQuote && (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">
                    Dein Angebot ist fertig! 🎉
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-sm text-primary hover:underline"
                  >
                    Neues Angebot
                  </button>
                </div>

                {/* Quote Preview */}
                <div className="bg-muted/50 rounded-xl p-4 mb-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                    {generatedQuote}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" onClick={copyToClipboard} className="flex-col h-auto py-4">
                    <Copy className="w-5 h-5 mb-1" />
                    <span className="text-xs">Kopieren</span>
                  </Button>
                  <Button variant="outline" onClick={downloadPDF} className="flex-col h-auto py-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Download className="w-5 h-5" />
                      {!isPremium && <Lock className="w-3 h-3" />}
                    </div>
                    <span className="text-xs">{isPremium ? "PDF" : "PDF (Premium)"}</span>
                  </Button>
                  <Button variant="success" onClick={sendWhatsApp} className="flex-col h-auto py-4">
                    <MessageSquare className="w-5 h-5 mb-1" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                </div>

                {/* Subtle hint after using free offer */}
                {hasUsedFreeOffer && !isPremium && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Kostenloses Angebot genutzt · <a href="/#preise" className="underline font-medium hover:text-amber-800 dark:hover:text-amber-200 transition-colors">Premium = unbegrenzt</a>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
