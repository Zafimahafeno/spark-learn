import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Star, DollarSign } from "lucide-react";

const InstructorHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, students: 0, avgRating: 0, revenue: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", user.id);

      const courseIds = courses?.map((c) => c.id) || [];

      let students = 0, revenue = 0, avgRating = 0;

      if (courseIds.length > 0) {
        const { count } = await supabase
          .from("enrollments")
          .select("id", { count: "exact", head: true })
          .in("course_id", courseIds);
        students = count || 0;

        const { data: payments } = await supabase
          .from("payments")
          .select("amount_paid")
          .in("course_id", courseIds)
          .eq("status", "completed");
        revenue = payments?.reduce((s, p) => s + (p.amount_paid || 0), 0) || 0;

        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .in("course_id", courseIds);
        avgRating = reviews && reviews.length > 0
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
          : 0;
      }

      setStats({ courses: courseIds.length, students, avgRating, revenue });
    };
    load();
  }, [user]);

  const cards = [
    { label: "Mes cours", value: stats.courses, icon: BookOpen, color: "text-primary" },
    { label: "Étudiants", value: stats.students, icon: Users, color: "text-blue-500" },
    { label: "Note moyenne", value: stats.avgRating || "—", icon: Star, color: "text-yellow-500" },
    { label: "Revenus", value: `${stats.revenue} €`, icon: DollarSign, color: "text-green-500" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Tableau de bord Instructeur</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InstructorHome;
