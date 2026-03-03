import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface EnrolledCourse {
  id: number;
  progress_percent: number;
  is_completed: boolean;
  course: { id: number; title: string; slug: string; thumbnail_url: string | null };
}

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("enrollments")
      .select("id, progress_percent, is_completed, courses(id, title, slug, thumbnail_url)")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false })
      .then(({ data }) => {
        setCourses(
          (data || []).map((e: any) => ({
            id: e.id,
            progress_percent: e.progress_percent || 0,
            is_completed: e.is_completed || false,
            course: e.courses,
          }))
        );
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Mes cours</h1>
      {courses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Vous n'êtes inscrit à aucun cours. <Link to="/courses" className="text-primary hover:underline">Parcourir les cours</Link>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} to={`/course/${c.course.slug}`}>
              <Card className="hover-lift cursor-pointer h-full">
                {c.course.thumbnail_url && (
                  <img src={c.course.thumbnail_url} alt={c.course.title} className="w-full h-40 object-cover rounded-t-lg" />
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{c.is_completed ? "Terminé ✓" : "En cours"}</span>
                    <span>{c.progress_percent}%</span>
                  </div>
                  <Progress value={c.progress_percent} className="h-2" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
