import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, Award, Play } from "lucide-react";

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
            <Card key={c.id} className="hover-lift cursor-pointer h-full flex flex-col">
              {c.course.thumbnail_url ? (
                <img src={c.course.thumbnail_url} alt={c.course.title} className="w-full h-40 object-cover rounded-t-lg" />
              ) : (
                <div className="w-full h-40 bg-secondary rounded-t-lg flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.course.title}</CardTitle>
                  {c.is_completed && <Badge variant="default" className="text-xs">Terminé</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{c.is_completed ? "Cours achevé ✓" : "En cours"}</span>
                  <span className="font-semibold text-foreground">{c.progress_percent}%</span>
                </div>
                <Progress value={c.progress_percent} className="h-2" />
                
                <div className="flex gap-2 mt-2">
                  <Link to={`/course/${c.course.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Play className="w-3 h-3 mr-1" /> Continuer
                    </Button>
                  </Link>
                  {c.progress_percent >= 100 && (
                    <Link to={`/course/${c.course.slug}/quiz`}>
                      <Button size="sm" variant="default">
                        <Award className="w-3 h-3 mr-1" /> Passer le quiz
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
