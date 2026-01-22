import { Button } from "@/components/ui/button";
import { FileText, Menu, X, LogOut, User, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/contexts/PremiumContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const {
    isAuthenticated,
    isPremium
  } = usePremium();
  const navigate = useNavigate();
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
    };
    getUser();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email || null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Angebotspro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#funktionen" className="text-muted-foreground hover:text-foreground transition-colors">
            Funktionen
          </a>
          <a href="#preise" className="text-muted-foreground hover:text-foreground transition-colors">
            Preise
          </a>
          <a href="#generator" className="text-muted-foreground hover:text-foreground transition-colors">
            Generator
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {isPremium ? <Crown className="w-4 h-4 text-success" /> : <User className="w-4 h-4" />}
                  <span className="max-w-[150px] truncate">{userEmail}</span>
                  {isPremium && <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-success/10 text-success rounded">
                      Premium
                    </span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled className="text-muted-foreground text-sm">
                  {userEmail}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Anmelden</Link>
              </Button>
              <Button variant="cta" size="sm" asChild>
                <Link to="/auth">Jetzt starten</Link>
              </Button>
            </>}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && <div className="md:hidden bg-background border-b border-border animate-slide-up">
          <nav className="container py-4 flex flex-col gap-4">
            <a href="#funktionen" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Funktionen
            </a>
            <a href="#preise" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Preise
            </a>
            <a href="#generator" className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Generator
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {isAuthenticated ? <>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                    {isPremium ? <Crown className="w-4 h-4 text-success" /> : <User className="w-4 h-4" />}
                    <span className="truncate">{userEmail}</span>
                    {isPremium && <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-success/10 text-success rounded">
                        Premium
                      </span>}
                  </div>
                  <Button variant="ghost" className="justify-start text-destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </Button>
                </> : <>
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/auth">Anmelden</Link>
                  </Button>
                  <Button variant="cta" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/auth">Jetzt starten</Link>
                  </Button>
                </>}
            </div>
          </nav>
        </div>}
    </header>;
}