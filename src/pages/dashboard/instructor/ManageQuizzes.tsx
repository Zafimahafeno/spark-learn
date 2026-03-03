import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Quiz {
  id: number;
  title: string;
  passing_percentage: number | null;
  section: { title: string; course: { title: string } } | null;
}

const ManageQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: courses } = await supabase.from("courses").select("id").eq("instructor_id", user.id);
      const courseIds = courses?.map((c) => c.id) || [];
      if (courseIds.length === 0) { setLoading(false); return; }

      const { data: sections } = await supabase.from("sections").select("id").in("course_id", courseIds);
      const sectionIds = sections?.map((s) => s.id) || [];
      if (sectionIds.length === 0) { setLoading(false); return; }

      const { data } = await supabase
        .from("quizzes")
        .select("id, title, passing_percentage, sections(title, courses(title))")
        .in("section_id", sectionIds);

      setQuizzes(
        (data || []).map((q: any) => ({
          ...q,
          section: q.sections ? { title: q.sections.title, course: q.sections.courses } : null,
        }))
      );
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Quiz</h1>
      {quizzes.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun quiz créé.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Score min.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>{q.section?.course?.title || "—"}</TableCell>
                  <TableCell>{q.section?.title || "—"}</TableCell>
                  <TableCell>{q.passing_percentage || 70}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ManageQuizzes;
