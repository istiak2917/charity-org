import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/shishuful-logo.jpg";

const navLinks = [
  { label: "হোম", href: "#home" },
  { label: "আমাদের সম্পর্কে", href: "#about" },
  { label: "প্রকল্প", href: "#projects" },
  { label: "অনুদান", href: "#donate" },
  { label: "ইভেন্ট", href: "#events" },
  { label: "গ্যালারি", href: "#gallery" },
  { label: "ব্লগ", href: "#blog" },
  { label: "যোগাযোগ", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="শিশুফুল লোগো" className="h-10 w-auto rounded-lg" />
          <span className="text-xl font-bold text-primary font-heading hidden sm:inline">শিশুফুল</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <Button className="btn-press gap-1" size="sm">
            <Heart className="h-4 w-4" /> অনুদান দিন
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button className="btn-press gap-1 mt-2" size="sm">
              <Heart className="h-4 w-4" /> অনুদান দিন
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
