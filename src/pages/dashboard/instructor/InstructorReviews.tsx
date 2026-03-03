import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  course: { title: string };
  reviewer: { firstname: string | null; lastname: string | null };
}

const InstructorReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: courses } = await supabase.from("courses").select("id").eq("instructor_id", user.id);
      const ids = courses?.map((c) => c.id) || [];
      if (ids.length === 0) { setLoading(false); return; }

      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, courses(title), profiles:user_id(firstname, lastname)")
        .in("course_id", ids)
        .order("created_at", { ascending: false });

      setReviews(
        (data || []).map((r: any) => ({
          ...r,
          course: r.courses,
          reviewer: r.profiles,
        }))
      );
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Avis étudiants</h1>
      {reviews.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun avis pour le moment.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{r.course.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Par {r.reviewer?.firstname || "Anonyme"} {r.reviewer?.lastname || ""} — {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </p>
              </CardHeader>
              {r.comment && <CardContent><p className="text-sm">{r.comment}</p></CardContent>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorReviews;
