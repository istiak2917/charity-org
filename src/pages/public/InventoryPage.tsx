import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("inventory_items").select("*").order("name")
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Package className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">ইনভেন্টরি</h1>
          <p className="text-muted-foreground">আমাদের সম্পদ ও সামগ্রী</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {items.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{item.name}</h3>
                  <Badge variant={item.quantity <= (item.min_stock || 5) ? "destructive" : "secondary"}>{item.quantity} {item.unit || "পিস"}</Badge>
                </div>
                {item.category && <div className="text-xs text-muted-foreground mt-1">{item.category}</div>}
                {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
              </Card>
            ))}
            {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">কোনো আইটেম নেই</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InventoryPage;
