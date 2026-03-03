import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Award, BookOpen, TrendingUp } from "lucide-react";

const StudentHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, certificates: 0, avgProgress: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("progress_percent, is_completed")
        .eq("user_id", user.id);

      const { count: certCount } = await supabase
        .from("certificates")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const enrolled = enrollments?.length || 0;
      const completed = enrollments?.filter((e) => e.is_completed).length || 0;
      const avgProgress = enrolled > 0 ? Math.round((enrollments?.reduce((s, e) => s + (e.progress_percent || 0), 0) || 0) / enrolled) : 0;

      setStats({ enrolled, completed, certificates: certCount || 0, avgProgress });
    };
    load();
  }, [user]);

  const cards = [
    { label: "Cours inscrits", value: stats.enrolled, icon: BookOpen, color: "text-primary" },
    { label: "Cours terminés", value: stats.completed, icon: GraduationCap, color: "text-green-500" },
    { label: "Certificats", value: stats.certificates, icon: Award, color: "text-yellow-500" },
    { label: "Progression moy.", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "text-blue-500" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Mon tableau de bord</h1>
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

export default StudentHome;
