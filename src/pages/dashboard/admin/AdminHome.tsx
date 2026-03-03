import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, DollarSign, GraduationCap } from "lucide-react";

const AdminHome = () => {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, revenue: 0 });

  useEffect(() => {
    const load = async () => {
      const [{ count: users }, { count: courses }, { count: enrollments }, { data: payments }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount_paid").eq("status", "completed"),
      ]);
      const revenue = payments?.reduce((s, p) => s + (p.amount_paid || 0), 0) || 0;
      setStats({ users: users || 0, courses: courses || 0, enrollments: enrollments || 0, revenue });
    };
    load();
  }, []);

  const cards = [
    { label: "Utilisateurs", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Cours", value: stats.courses, icon: BookOpen, color: "text-blue-500" },
    { label: "Inscriptions", value: stats.enrollments, icon: GraduationCap, color: "text-green-500" },
    { label: "Revenus totaux", value: `${stats.revenue} €`, icon: DollarSign, color: "text-yellow-500" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Administration</h1>
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

export default AdminHome;
