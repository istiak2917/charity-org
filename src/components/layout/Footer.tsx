import { Heart, Mail, Phone, MapPin, Facebook, Youtube } from "lucide-react";
import logo from "@/assets/shishuful-logo.jpg";

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="শিশুফুল" className="h-10 rounded-lg" />
              <span className="text-xl font-bold font-heading">শিশুফুল</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              প্রতিটি শিশুর মুখে হাসি ফোটানো আমাদের অঙ্গীকার। আমরা একটি মানবিক সংগঠন।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold font-heading mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#about" className="hover:opacity-100 transition-opacity">আমাদের সম্পর্কে</a></li>
              <li><a href="#projects" className="hover:opacity-100 transition-opacity">প্রকল্পসমূহ</a></li>
              <li><a href="#donate" className="hover:opacity-100 transition-opacity">অনুদান দিন</a></li>
              <li><a href="#events" className="hover:opacity-100 transition-opacity">ইভেন্ট</a></li>
              <li><a href="#blog" className="hover:opacity-100 transition-opacity">ব্লগ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold font-heading mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@shishuful.org</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +880 1XXX-XXXXXX</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> বাংলাদেশ</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold font-heading mb-4">সোশ্যাল মিডিয়া</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors duration-200">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm opacity-60">
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()} শিশুফুল। সর্বস্বত্ব সংরক্ষিত। তৈরি করা হয়েছে <Heart className="h-3 w-3 text-primary" /> দিয়ে
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
