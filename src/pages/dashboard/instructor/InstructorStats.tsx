import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CourseStat {
  id: number;
  title: string;
  students: number;
  revenue: number;
  avgRating: number;
}

const InstructorStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id);

      if (!courses || courses.length === 0) { setLoading(false); return; }

      const result: CourseStat[] = [];
      for (const c of courses) {
        const { count: students } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("course_id", c.id);
        const { data: payments } = await supabase.from("payments").select("amount_paid").eq("course_id", c.id).eq("status", "completed");
        const { data: reviews } = await supabase.from("reviews").select("rating").eq("course_id", c.id);
        const revenue = payments?.reduce((s, p) => s + (p.amount_paid || 0), 0) || 0;
        const avgRating = reviews && reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
        result.push({ id: c.id, title: c.title, students: students || 0, revenue, avgRating });
      }
      setStats(result);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Statistiques</h1>
      {stats.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune statistique disponible.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Étudiants</TableHead>
                <TableHead>Revenus</TableHead>
                <TableHead>Note moy.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.students}</TableCell>
                  <TableCell>{s.revenue} €</TableCell>
                  <TableCell>{s.avgRating || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default InstructorStats;
