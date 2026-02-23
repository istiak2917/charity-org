import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const presets = [100, 500, 1000, 5000];

const DonationSection = () => {
  return (
    <section id="donate" className="py-16 bg-card bg-texture-bengali">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold font-heading mb-3">অনুদান দিন</h2>
          <p className="text-muted-foreground mb-8">আপনার ছোট অনুদানও একটি শিশুর জীবন বদলে দিতে পারে।</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {presets.map((amt) => (
              <button
                key={amt}
                className="btn-press rounded-xl border-2 border-primary/20 bg-background py-3 text-lg font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                ৳{amt}
              </button>
            ))}
          </div>

          <div className="bg-background rounded-xl p-6 border border-border text-left space-y-3 mb-6">
            <h4 className="font-bold font-heading">পেমেন্ট তথ্য</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>বিকাশ:</strong> 01XXX-XXXXXX (পার্সোনাল)</p>
              <p><strong>নগদ:</strong> 01XXX-XXXXXX</p>
              <p><strong>ব্যাংক:</strong> শিশুফুল ফাউন্ডেশন, অ্যাকাউন্ট নং: XXXXXXXXXXXX</p>
            </div>
          </div>

          <Button className="btn-press gap-2 text-base px-8 py-5" size="lg">
            <Heart className="h-5 w-5" /> অনুদান সম্পর্কে জানুন
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
