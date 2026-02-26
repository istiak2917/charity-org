import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface DonationReceiptProps {
  donation: {
    id: string;
    donor_name: string;
    donor_email?: string;
    amount: number;
    method?: string;
    created_at: string;
    status?: string;
  };
  onClose?: () => void;
}

const DonationReceipt = ({ donation, onClose }: DonationReceiptProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [org, setOrg] = useState<any>({});

  useEffect(() => {
    supabase.from("organizations").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setOrg(data);
    });
  }, []);

  const receiptNo = `RCP-${donation.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(donation.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });

  const orgName = org.name || "শিশুফুল ফাউন্ডেশন";
  const orgAddress = org.address || "বাংলাদেশ";
  const orgContact = [org.email || org.contact_email, org.phone].filter(Boolean).join(" | ");

  const printHTML = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Donation Receipt</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
  .header { text-align: center; border-bottom: 2px solid #e91e8c; padding-bottom: 20px; margin-bottom: 20px; }
  .header h1 { font-size: 24px; color: #e91e8c; }
  .header p { color: #666; font-size: 12px; margin: 4px 0; }
  .receipt-no { font-size: 11px; color: #999; text-align: right; }
  .amount { font-size: 28px; font-weight: bold; color: #e91e8c; text-align: center; padding: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  td { padding: 10px 8px; border-bottom: 1px solid #eee; }
  td:first-child { font-weight: 600; width: 40%; color: #555; }
  .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
  .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>${orgName}</h1>
  <p>${orgAddress}</p>
  <p>${orgContact}</p>
</div>
<div class="receipt-no">রসিদ নং: ${receiptNo}</div>
<div class="amount">৳${donation.amount?.toLocaleString("bn-BD")}</div>
<table><tbody>
  <tr><td>দাতার নাম</td><td>${donation.donor_name || "বেনামী"}</td></tr>
  ${donation.donor_email ? `<tr><td>ইমেইল</td><td>${donation.donor_email}</td></tr>` : ""}
  <tr><td>পদ্ধতি</td><td>${donation.method || "—"}</td></tr>
  <tr><td>তারিখ</td><td>${date}</td></tr>
  <tr><td>স্ট্যাটাস</td><td><span class="badge">${donation.status || "confirmed"}</span></td></tr>
</tbody></table>
<div class="footer">
  <p>এই রসিদটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।</p>
  <p>${orgName}</p>
</div>
<script>
  setTimeout(function(){ window.print(); }, 300);
</script>
</body></html>`;

  const handlePrint = () => {
    // Use iframe instead of popup to avoid popup blockers
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    iframe.style.width = "600px";
    iframe.style.height = "800px";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    
    doc.open();
    doc.write(printHTML);
    doc.close();
    
    iframe.onload = () => {
      try {
        iframe.contentWindow?.print();
      } catch {
        // Fallback: open in new tab
        const blob = new Blob([printHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      setTimeout(() => document.body.removeChild(iframe), 2000);
    };
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 text-sm space-y-3">
        <div className="text-center border-b pb-3">
          <h3 className="font-bold text-lg">{orgName}</h3>
          <p className="text-xs text-muted-foreground">{orgAddress}</p>
          <p className="text-xs text-muted-foreground">{orgContact}</p>
        </div>
        <p className="text-xs text-right text-muted-foreground">রসিদ নং: {receiptNo}</p>
        <p className="text-2xl font-bold text-center text-primary">৳{donation.amount?.toLocaleString("bn-BD")}</p>
        <table className="w-full text-sm">
          <tbody>
            <tr><td className="py-1.5 font-medium text-muted-foreground">দাতার নাম</td><td className="py-1.5">{donation.donor_name || "বেনামী"}</td></tr>
            {donation.donor_email && <tr><td className="py-1.5 font-medium text-muted-foreground">ইমেইল</td><td className="py-1.5">{donation.donor_email}</td></tr>}
            <tr><td className="py-1.5 font-medium text-muted-foreground">পদ্ধতি</td><td className="py-1.5">{donation.method || "—"}</td></tr>
            <tr><td className="py-1.5 font-medium text-muted-foreground">তারিখ</td><td className="py-1.5">{date}</td></tr>
            <tr><td className="py-1.5 font-medium text-muted-foreground">স্ট্যাটাস</td><td className="py-1.5"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{donation.status || "confirmed"}</span></td></tr>
          </tbody>
        </table>
        <p className="text-xs text-center text-muted-foreground pt-2 border-t">এই রসিদটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।</p>
      </div>
      <div className="flex gap-2 justify-end">
        {onClose && <Button variant="outline" onClick={onClose}>বন্ধ করুন</Button>}
        <Button onClick={handlePrint} className="gap-2"><Printer className="h-4 w-4" /> প্রিন্ট / ডাউনলোড</Button>
      </div>
    </div>
  );
};

export default DonationReceipt;
