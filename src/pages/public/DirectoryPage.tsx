import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { List, Users } from "lucide-react";
import type { DirectoryConfig, DirectoryField } from "@/pages/admin/DirectoryManager";

const DirectoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [directory, setDirectory] = useState<DirectoryConfig | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Load directory config
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .eq("setting_key", "public_directories")
        .maybeSingle();

      if (!settingsData?.setting_value) {
        setError(lang === "bn" ? "ডিরেক্টরি পাওয়া যায়নি" : "Directory not found");
        setLoading(false);
        return;
      }

      let dirs: DirectoryConfig[] = [];
      try { dirs = JSON.parse(settingsData.setting_value); } catch { dirs = []; }

      const dir = dirs.find(d => d.slug === slug && d.is_public);
      if (!dir) {
        setError(lang === "bn" ? "এই ডিরেক্টরি পাবলিক নয় বা পাওয়া যায়নি" : "Directory not found or not public");
        setLoading(false);
        return;
      }

      setDirectory(dir);

      // Fetch data from source table
      try {
        let query = supabase.from(dir.source_table).select("*");
        if (dir.filter_column && dir.filter_value) {
          query = query.eq(dir.filter_column, dir.filter_value);
        }
        const { data, error: fetchError } = await query.limit(500);
        if (fetchError) {
          console.error("Directory data fetch error:", fetchError);
          setItems([]);
        } else {
          setItems(data || []);
        }
      } catch (err: any) {
        console.error("Directory data fetch failed:", err);
        setItems([]);
      }
      setLoading(false);
    };
    load();
  }, [slug, lang]);

  const visibleFields = directory?.fields
    .filter(f => f.is_visible && f.field_type !== "hidden")
    .sort((a, b) => a.sort_order - b.sort_order) || [];

  const renderFieldValue = (item: any, field: DirectoryField) => {
    const val = item[field.db_column];
    if (val === null || val === undefined) return "—";

    switch (field.field_type) {
      case "image":
        return val ? (
          <img src={val} alt="" className="w-14 h-14 rounded-full object-cover bg-muted" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            ?
          </div>
        );
      case "badge":
        const badgeVal = Array.isArray(val) ? val.join(", ") : String(val);
        return <Badge variant="outline">{badgeVal}</Badge>;
      case "email":
        return <a href={`mailto:${val}`} className="text-primary hover:underline text-sm">{val}</a>;
      case "phone":
        return <a href={`tel:${val}`} className="text-primary hover:underline text-sm">{val}</a>;
      case "date":
        try { return new Date(val).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US"); }
        catch { return String(val); }
      case "link":
        return <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">{val}</a>;
      default:
        return <span className="text-sm">{String(val)}</span>;
    }
  };

  // Find the "name" field for grid card title
  const nameField = visibleFields.find(f =>
    f.db_column.includes("name") || f.db_column.includes("title")
  );
  const imageField = visibleFields.find(f => f.field_type === "image");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg text-muted-foreground">{error}</p>
          </div>
        ) : directory ? (
          <>
            <div className="text-center mb-10">
              <Users className="h-12 w-12 text-primary mx-auto mb-3" />
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">
                {lang === "bn" ? directory.title_bn : directory.title_en}
              </h1>
              {(directory.description_bn || directory.description_en) && (
                <p className="text-muted-foreground max-w-xl mx-auto">
                  {lang === "bn" ? directory.description_bn : directory.description_en}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {items.length} {lang === "bn" ? "টি রেকর্ড" : "records"}
              </p>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {lang === "bn" ? "কোনো তথ্য পাওয়া যায়নি" : "No data found"}
              </div>
            ) : directory.layout === "table" ? (
              /* ── Table Layout ── */
              <div className="max-w-6xl mx-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleFields.map(f => (
                        <TableHead key={f.id}>{lang === "bn" ? f.label_bn : f.label_en}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, i) => (
                      <TableRow key={item.id || i}>
                        {visibleFields.map(f => (
                          <TableCell key={f.id}>{renderFieldValue(item, f)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : directory.layout === "list" ? (
              /* ── List Layout ── */
              <div className="max-w-3xl mx-auto space-y-3">
                {items.map((item, i) => (
                  <Card key={item.id || i} className="p-4 flex items-center gap-4">
                    {imageField && (
                      <div className="shrink-0">{renderFieldValue(item, imageField)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      {nameField && <h3 className="font-bold">{item[nameField.db_column] || "—"}</h3>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {visibleFields
                          .filter(f => f.id !== nameField?.id && f.id !== imageField?.id)
                          .map(f => (
                            <div key={f.id} className="text-sm">
                              <span className="text-muted-foreground">{lang === "bn" ? f.label_bn : f.label_en}: </span>
                              {renderFieldValue(item, f)}
                            </div>
                          ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* ── Grid Layout ── */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {items.map((item, i) => (
                  <Card key={item.id || i} className="p-4 text-center hover:shadow-md transition-shadow">
                    {imageField ? (
                      renderFieldValue(item, imageField)
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary font-bold text-xl">
                        {nameField ? (String(item[nameField.db_column] || "?")[0]) : "?"}
                      </div>
                    )}
                    {nameField && (
                      <h3 className="font-bold text-sm mt-2">{item[nameField.db_column] || "—"}</h3>
                    )}
                    <div className="mt-2 space-y-1">
                      {visibleFields
                        .filter(f => f.id !== nameField?.id && f.id !== imageField?.id)
                        .map(f => (
                          <div key={f.id} className="text-xs">
                            {renderFieldValue(item, f)}
                          </div>
                        ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default DirectoryPage;
