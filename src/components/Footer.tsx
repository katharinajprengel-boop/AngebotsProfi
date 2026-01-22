import { FileText } from "lucide-react";
export function Footer() {
  return <footer className="py-12 border-t border-border bg-muted/20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Angebotspro</span>
          </a>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Impressum
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Datenschutz
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              AGB
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Kontakt
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">© 2025 Angebotspro</p>
        </div>
      </div>
    </footer>;
}