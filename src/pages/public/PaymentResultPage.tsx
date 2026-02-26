import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentResultPage = () => {
  const [params] = useSearchParams();
  const status = params.get("status") || "success";
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20 text-center max-w-lg">
        {isSuccess ? (
          <>
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold font-heading mb-3">পেমেন্ট সফল!</h1>
            <p className="text-muted-foreground mb-8">আপনার অনুদান সফলভাবে গৃহীত হয়েছে। আপনার উদারতার জন্য ধন্যবাদ।</p>
          </>
        ) : (
          <>
            <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-bold font-heading mb-3">পেমেন্ট বাতিল</h1>
            <p className="text-muted-foreground mb-8">আপনার পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন অথবা অন্য পদ্ধতিতে দান করুন।</p>
          </>
        )}
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button variant="outline">হোমে ফিরুন</Button></Link>
          <Link to="/donations"><Button>অনুদান পেজ</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentResultPage;
