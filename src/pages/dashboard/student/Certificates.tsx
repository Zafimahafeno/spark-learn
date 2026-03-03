import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface Certificate {
  id: number;
  verify_code: string;
  issue_date: string;
  course: { title: string };
}

const Certificates = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("certificates")
      .select("id, verify_code, issue_date, courses(title)")
      .eq("user_id", user.id)
      .order("issue_date", { ascending: false })
      .then(({ data }) => {
        setCerts((data || []).map((c: any) => ({ ...c, course: c.courses })));
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Mes certificats</h1>
      {certs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun certificat obtenu pour le moment.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <Card key={c.id} className="hover-lift">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-base">{c.course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Délivré le {new Date(c.issue_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Code de vérification : <span className="font-mono text-foreground">{c.verify_code}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
