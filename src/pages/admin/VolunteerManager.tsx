import { useAdminCrud } from "@/hooks/useAdminCrud";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Volunteer { id: string; full_name: string; email: string; phone: string; skills: string; status: string; badge: string; hours_logged: number; [key: string]: any; }

const VolunteerManager = () => {
  const { items, loading, update } = useAdminCrud<Volunteer>({ table: "volunteers" });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">স্বেচ্ছাসেবক ম্যানেজার</h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead>
              <TableHead>ইমেইল</TableHead>
              <TableHead>দক্ষতা</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>ঘণ্টা</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.full_name}</TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.skills || "-"}</TableCell>
                <TableCell><Badge variant={v.status === "approved" ? "default" : v.status === "rejected" ? "destructive" : "secondary"}>{v.status}</Badge></TableCell>
                <TableCell>{v.hours_logged || 0}h</TableCell>
                <TableCell className="text-right space-x-2">
                  {v.status === "pending" && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => update(v.id, { status: "approved" } as any)}><Check className="h-4 w-4 text-green-600" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => update(v.id, { status: "rejected" } as any)}><X className="h-4 w-4 text-destructive" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">কোনো স্বেচ্ছাসেবক নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default VolunteerManager;
