import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const GlobalStats = () => {
  const [topCourses, setTopCourses] = useState<{ title: string; students: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: courses } = await supabase.from("courses").select("id, title").eq("status", "published");
      if (!courses || courses.length === 0) { setLoading(false); return; }

      const results = [];
      for (const c of courses.slice(0, 20)) {
        const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("course_id", c.id);
        const { data: payments } = await supabase.from("payments").select("amount_paid").eq("course_id", c.id).eq("status", "completed");
        const revenue = payments?.reduce((s, p) => s + (p.amount_paid || 0), 0) || 0;
        results.push({ title: c.title, students: count || 0, revenue });
      }
      results.sort((a, b) => b.students - a.students);
      setTopCourses(results);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Statistiques globales</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Top cours par inscriptions</CardTitle></CardHeader>
        <CardContent>
          {topCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Aucune donnée disponible.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cours</TableHead>
                  <TableHead>Étudiants</TableHead>
                  <TableHead>Revenus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCourses.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.students}</TableCell>
                    <TableCell>{c.revenue} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalStats;
