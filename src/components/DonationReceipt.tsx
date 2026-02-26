import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

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

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Donation Receipt</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #e91e8c; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { font-size: 24px; color: #e91e8c; margin: 0; }
        .header p { color: #666; font-size: 12px; margin: 4px 0; }
        .receipt-no { font-size: 11px; color: #999; text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 10px 8px; border-bottom: 1px solid #eee; }
        td:first-child { font-weight: 600; width: 40%; color: #555; }
        .amount { font-size: 28px; font-weight: bold; color: #e91e8c; text-align: center; padding: 20px; }
        .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
        .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${content.innerHTML}
      <script>window.print(); window.close();</script>
      </body></html>
    `);
    win.document.close();
  };

  const receiptNo = `RCP-${donation.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(donation.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-4">
      <div ref={printRef}>
        <div className="header">
          <h1>{org.name || "শিশুফুল ফাউন্ডেশন"}</h1>
          <p>{org.address || "বাংলাদেশ"}</p>
          <p>{org.email || org.contact_email || ""} | {org.phone || ""}</p>
        </div>
        <div className="receipt-no">রসিদ নং: {receiptNo}</div>
        <div className="amount">৳{donation.amount?.toLocaleString("bn-BD")}</div>
        <table>
          <tbody>
            <tr><td>দাতার নাম</td><td>{donation.donor_name || "বেনামী"}</td></tr>
            {donation.donor_email && <tr><td>ইমেইল</td><td>{donation.donor_email}</td></tr>}
            <tr><td>পদ্ধতি</td><td>{donation.method || "—"}</td></tr>
            <tr><td>তারিখ</td><td>{date}</td></tr>
            <tr><td>স্ট্যাটাস</td><td><span className="badge">{donation.status || "confirmed"}</span></td></tr>
          </tbody>
        </table>
        <div className="footer">
          <p>এই রসিদটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।</p>
          <p>{org.name || "শিশুফুল"} — {org.website || ""}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onClose && <Button variant="outline" onClick={onClose}>বন্ধ করুন</Button>}
        <Button onClick={handlePrint} className="gap-2"><Printer className="h-4 w-4" /> প্রিন্ট / ডাউনলোড</Button>
      </div>
    </div>
  );
};

export default DonationReceipt;
