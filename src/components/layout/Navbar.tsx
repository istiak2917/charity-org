import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Menu, X, Heart, LogIn, UserCircle, LogOut, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySelector from "@/components/CurrencySelector";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/shishuful-logo.jpg";
import type { TranslationKey } from "@/lib/translations";

const navLinks: { key: TranslationKey; href: string }[] = [
  { key: "nav_home", href: "/" },
  { key: "nav_projects", href: "/projects" },
  { key: "nav_donations", href: "/donations" },
  { key: "nav_events", href: "/events" },
  { key: "nav_blog", href: "/blog" },
  { key: "nav_blood", href: "/blood" },
  { key: "nav_gallery", href: "/gallery" },
  { key: "nav_volunteers", href: "/volunteers" },
  { key: "nav_transparency", href: "/transparency" },
  { key: "nav_contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { t, lang } = useLanguage();
  const lb = (bn: string, en: string) => lang === "bn" ? bn : en;

  const mobileMenu = open ? createPortal(
    <>
      <div className="lg:hidden fixed inset-0 bg-black/30 z-[998]" onClick={() => setOpen(false)} />
      <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-[999] overflow-y-auto" style={{ backgroundColor: "hsl(30, 100%, 97%)" }}>
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3 pb-20">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors duration-200" onClick={() => setOpen(false)}>{t(link.key)}</a>
            ) : (
              <Link key={link.href} to={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors duration-200" onClick={() => setOpen(false)}>{t(link.key)}</Link>
            )
          )}

          <div className="flex items-center gap-2 py-2 border-t border-border mt-1 pt-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <CurrencySelector compact />
          </div>
          
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="gap-1 w-full"><Shield className="h-4 w-4" /> {t("nav_admin_panel")}</Button>
                </Link>
              )}
              <Link to="/member" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="gap-1 w-full"><UserCircle className="h-4 w-4" /> {t("nav_my_profile")}</Button>
              </Link>
              <Link to="/member/chat" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="gap-1 w-full"><MessageCircle className="h-4 w-4" /> {lb("চ্যাট", "Chat")}</Button>
              </Link>
              <Button variant="ghost" size="sm" className="gap-1 w-full" onClick={() => { signOut(); setOpen(false); }}>
                <LogOut className="h-4 w-4" /> {t("nav_logout")}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="gap-1 w-full"><LogIn className="h-4 w-4" /> {t("nav_login")}</Button>
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="gap-1 w-full"><UserCircle className="h-4 w-4" /> {t("nav_register")}</Button>
              </Link>
            </>
          )}
          <Link to="/donations" onClick={() => setOpen(false)}><Button className="btn-press gap-1 mt-2 w-full" size="sm"><Heart className="h-4 w-4" /> {t("nav_donate")}</Button></Link>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="#home" className="flex items-center gap-2">
            <img src={logo} alt="শিশুফুল লোগো" className="h-10 w-auto rounded-lg" />
            <span className="text-xl font-bold text-primary font-heading hidden sm:inline">শিশুফুল</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200">{t(link.key)}</a>
              ) : (
                <Link key={link.href} to={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200">{t(link.key)}</Link>
              )
            )}

            <div className="flex items-center gap-1 border-l border-border pl-3 ml-1">
              <ThemeToggle size="sm" />
              <LanguageSwitcher size="sm" />
              <CurrencySelector compact />
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-1"><Shield className="h-4 w-4" /> {t("nav_admin")}</Button>
                  </Link>
                )}
                <Link to="/member">
                  <Button variant="ghost" size="sm" className="gap-1"><UserCircle className="h-4 w-4" /> {t("nav_profile")}</Button>
                </Link>
                <Link to="/member/chat">
                  <Button variant="ghost" size="sm" className="gap-1"><MessageCircle className="h-4 w-4" /> {lb("চ্যাট", "Chat")}</Button>
                </Link>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" /> {t("nav_logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><Button variant="ghost" size="sm" className="gap-1"><LogIn className="h-4 w-4" /> {t("nav_login")}</Button></Link>
                <Link to="/donations"><Button className="btn-press gap-1" size="sm"><Heart className="h-4 w-4" /> {t("nav_donate")}</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 text-foreground relative z-[1000]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      {mobileMenu}
    </>
  );
};

export default Navbar;
