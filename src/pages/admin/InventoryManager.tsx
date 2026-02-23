import { useState, useMemo } from "react";
import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Download, Package } from "lucide-react";

interface InventoryItem {
  id: string; name: string; category: string; quantity: number;
  unit: string; low_stock_threshold: number; description?: string;
  branch_id?: string; created_at: string; [key: string]: any;
}

interface InventoryTransaction {
  id: string; item_id: string; type: string; quantity: number;
  note?: string; created_at: string; [key: string]: any;
}

const CATEGORIES = ["শিক্ষা সামগ্রী", "খাদ্য", "পোশাক", "চিকিৎসা", "অফিস সরঞ্জাম", "আসবাবপত্র", "ইলেকট্রনিক্স", "অন্যান্য"];
const UNITS = ["পিস", "কেজি", "লিটার", "প্যাক", "বক্স", "সেট", "রিম"];

const InventoryManager = () => {
  const { items, loading, create, update, remove } = useAdminCrud<InventoryItem>({ table: "inventory_items" });
  const transactions = useAdminCrud<InventoryTransaction>({ table: "inventory_transactions" });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [txDialog, setTxDialog] = useState<InventoryItem | null>(null);
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [txQty, setTxQty] = useState(0);
  const [txNote, setTxNote] = useState("");
  const [historyDialog, setHistoryDialog] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    name: "", category: "অন্যান্য", quantity: 0, unit: "পিস",
    low_stock_threshold: 5, description: "",
  });

  const resetForm = () => {
    setForm({ name: "", category: "অন্যান্য", quantity: 0, unit: "পিস", low_stock_threshold: 5, description: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false); resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      name: item.name, category: item.category || "অন্যান্য",
      quantity: item.quantity || 0, unit: item.unit || "পিস",
      low_stock_threshold: item.low_stock_threshold || 5,
      description: item.description || "",
    });
    setOpen(true);
  };

  const handleTransaction = async () => {
    if (!txDialog || txQty <= 0) return;
    const newQty = txType === "in" ? txDialog.quantity + txQty : Math.max(0, txDialog.quantity - txQty);
    await transactions.create({
      item_id: txDialog.id, type: txType, quantity: txQty, note: txNote,
    } as any);
    await update(txDialog.id, { quantity: newQty });
    setTxDialog(null); setTxQty(0); setTxNote("");
  };

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name?.toLowerCase().includes(q));
    }
    if (filterCat !== "all") list = list.filter(i => i.category === filterCat);
    return list;
  }, [items, search, filterCat]);

  const lowStockItems = useMemo(() =>
    items.filter(i => i.quantity <= (i.low_stock_threshold || 5)),
  [items]);

  const itemTransactions = useMemo(() => {
    if (!historyDialog) return [];
    return transactions.items
      .filter(t => t.item_id === historyDialog.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [historyDialog, transactions.items]);

  const exportCSV = () => {
    const headers = "নাম,ক্যাটেগরি,পরিমাণ,একক,সর্বনিম্ন,বিবরণ\n";
    const rows = filtered.map(i => `${i.name},${i.category},${i.quantity},${i.unit},${i.low_stock_threshold},${i.description || ""}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "inventory.csv"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-heading">ইনভেন্টরি ম্যানেজার</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> CSV</Button>
          <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> নতুন আইটেম</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "আইটেম সম্পাদনা" : "নতুন আইটেম"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="আইটেমের নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="প্রাথমিক পরিমাণ" value={form.quantity || ""} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
                  <Input type="number" placeholder="সর্বনিম্ন স্টক" value={form.low_stock_threshold || ""} onChange={e => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} />
                </div>
                <Textarea placeholder="বিবরণ" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <Button onClick={handleSubmit} className="w-full">{editing ? "আপডেট করুন" : "তৈরি করুন"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট আইটেম</div><div className="text-2xl font-bold">{items.length}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">ক্যাটেগরি</div><div className="text-2xl font-bold">{new Set(items.map(i => i.category)).size}</div></Card>
        <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">মোট ট্রানজেকশন</div><div className="text-2xl font-bold">{transactions.items.length}</div></Card>
        <Card className={`p-4 text-center ${lowStockItems.length > 0 ? "border-destructive" : ""}`}>
          <div className="text-sm text-muted-foreground">স্টক সতর্কতা</div>
          <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${lowStockItems.length > 0 ? "text-destructive" : ""}`}>
            {lowStockItems.length > 0 && <AlertTriangle className="h-5 w-5" />}{lowStockItems.length}
          </div>
        </Card>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Card className="p-4 border-destructive bg-destructive/5">
          <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /> স্টক কম!</h3>
          <div className="flex gap-2 flex-wrap">
            {lowStockItems.map(i => (
              <Badge key={i.id} variant="destructive">{i.name}: {i.quantity} {i.unit}</Badge>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">আইটেম তালিকা</TabsTrigger>
          <TabsTrigger value="history">ট্রানজেকশন হিস্ট্রি</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="নাম দিয়ে খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>আইটেম</TableHead><TableHead>ক্যাটেগরি</TableHead><TableHead>পরিমাণ</TableHead>
                  <TableHead>একক</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(item => {
                  const isLow = item.quantity <= (item.low_stock_threshold || 5);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                      </TableCell>
                      <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                      <TableCell className={`font-bold ${isLow ? "text-destructive" : ""}`}>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {isLow ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />কম</Badge> : <Badge variant="outline">স্বাভাবিক</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="icon" variant="ghost" title="স্টক ইন" onClick={() => { setTxDialog(item); setTxType("in"); }}><ArrowUpCircle className="h-4 w-4 text-green-600" /></Button>
                        <Button size="icon" variant="ghost" title="স্টক আউট" onClick={() => { setTxDialog(item); setTxType("out"); }}><ArrowDownCircle className="h-4 w-4 text-orange-600" /></Button>
                        <Button size="icon" variant="ghost" title="ইতিহাস" onClick={() => setHistoryDialog(item)}><Package className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো আইটেম নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>আইটেম</TableHead><TableHead>ধরন</TableHead><TableHead>পরিমাণ</TableHead><TableHead>নোট</TableHead><TableHead>তারিখ</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {transactions.items
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(tx => {
                    const item = items.find(i => i.id === tx.item_id);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{item?.name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === "in" ? "default" : "destructive"} className="gap-1">
                            {tx.type === "in" ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                            {tx.type === "in" ? "ইন" : "আউট"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{tx.quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tx.note || "—"}</TableCell>
                        <TableCell className="text-sm">{new Date(tx.created_at).toLocaleDateString("bn-BD")}</TableCell>
                      </TableRow>
                    );
                  })}
                {transactions.items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">কোনো ট্রানজেকশন নেই</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock In/Out Dialog */}
      <Dialog open={!!txDialog} onOpenChange={v => { if (!v) { setTxDialog(null); setTxQty(0); setTxNote(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {txType === "in" ? <ArrowUpCircle className="h-5 w-5 text-green-600" /> : <ArrowDownCircle className="h-5 w-5 text-orange-600" />}
              {txDialog?.name} — স্টক {txType === "in" ? "ইন" : "আউট"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">বর্তমান স্টক: <span className="font-bold">{txDialog?.quantity} {txDialog?.unit}</span></div>
            <Input type="number" placeholder="পরিমাণ" value={txQty || ""} onChange={e => setTxQty(Number(e.target.value))} />
            <Input placeholder="নোট (ঐচ্ছিক)" value={txNote} onChange={e => setTxNote(e.target.value)} />
            <Button onClick={handleTransaction} className="w-full">
              {txType === "in" ? "স্টক যোগ করুন" : "স্টক বের করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item History Dialog */}
      <Dialog open={!!historyDialog} onOpenChange={v => { if (!v) setHistoryDialog(null); }}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-auto">
          <DialogHeader><DialogTitle>{historyDialog?.name} — ট্রানজেকশন ইতিহাস</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {itemTransactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2 border rounded">
                {tx.type === "in" ? <ArrowUpCircle className="h-4 w-4 text-green-600 shrink-0" /> : <ArrowDownCircle className="h-4 w-4 text-orange-600 shrink-0" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{tx.type === "in" ? "+" : "-"}{tx.quantity} {historyDialog?.unit}</div>
                  {tx.note && <div className="text-xs text-muted-foreground">{tx.note}</div>}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("bn-BD")}</div>
              </div>
            ))}
            {itemTransactions.length === 0 && <p className="text-center text-muted-foreground py-4">কোনো ট্রানজেকশন নেই</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;
