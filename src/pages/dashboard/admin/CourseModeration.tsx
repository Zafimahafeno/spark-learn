import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  status: string | null;
  level: string | null;
  instructor: { firstname: string | null; lastname: string | null } | null;
}

const CourseModeration = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, status, level, profiles:instructor_id(firstname, lastname)")
      .order("created_at", { ascending: false });

    setCourses(
      (data || []).map((c: any) => ({ ...c, instructor: c.profiles }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from("courses").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Statut mis à jour"); load(); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Modération des cours</h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Instructeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.instructor ? `${c.instructor.firstname || ""} ${c.instructor.lastname || ""}` : "—"}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "published" ? "default" : c.status === "archived" ? "destructive" : "secondary"}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select value={c.status || "draft"} onValueChange={(v) => updateStatus(c.id, v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CourseModeration;
