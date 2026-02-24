import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Heart, LogIn, UserCircle, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/shishuful-logo.jpg";

const navLinks = [
  { label: "হোম", href: "/" },
  { label: "প্রকল্প", href: "/projects" },
  { label: "অনুদান", href: "/donations" },
  { label: "ইভেন্ট", href: "/events" },
  { label: "ব্লগ", href: "/blog" },
  { label: "রক্তদান", href: "/blood" },
  { label: "গ্যালারি", href: "/gallery" },
  { label: "স্বচ্ছতা", href: "/transparency" },
  { label: "যোগাযোগ", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="শিশুফুল লোগো" className="h-10 w-auto rounded-lg" />
          <span className="text-xl font-bold text-primary font-heading hidden sm:inline">শিশুফুল</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200">{link.label}</a>
            ) : (
              <Link key={link.href} to={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200">{link.label}</Link>
            )
          )}
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-1"><Shield className="h-4 w-4" /> অ্যাডমিন</Button>
                </Link>
              )}
              <Link to="/member">
                <Button variant="ghost" size="sm" className="gap-1"><UserCircle className="h-4 w-4" /> প্রোফাইল</Button>
              </Link>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> লগআউট
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm" className="gap-1"><LogIn className="h-4 w-4" /> লগইন</Button></Link>
              <Button className="btn-press gap-1" size="sm"><Heart className="h-4 w-4" /> অনুদান দিন</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors duration-200" onClick={() => setOpen(false)}>{link.label}</a>
              ) : (
                <Link key={link.href} to={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors duration-200" onClick={() => setOpen(false)}>{link.label}</Link>
              )
            )}
            
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="gap-1 w-full"><Shield className="h-4 w-4" /> অ্যাডমিন প্যানেল</Button>
                  </Link>
                )}
                <Link to="/member" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="gap-1 w-full"><UserCircle className="h-4 w-4" /> আমার প্রোফাইল</Button>
                </Link>
                <Button variant="ghost" size="sm" className="gap-1 w-full" onClick={() => { signOut(); setOpen(false); }}>
                  <LogOut className="h-4 w-4" /> লগআউট
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="gap-1 w-full"><LogIn className="h-4 w-4" /> লগইন</Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="gap-1 w-full"><UserCircle className="h-4 w-4" /> রেজিস্ট্রেশন</Button>
                </Link>
              </>
            )}
            <Button className="btn-press gap-1 mt-2" size="sm"><Heart className="h-4 w-4" /> অনুদান দিন</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
