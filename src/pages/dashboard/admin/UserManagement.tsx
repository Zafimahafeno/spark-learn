import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UserRow {
  id: string;
  firstname: string | null;
  lastname: string | null;
  created_at: string;
  role: string;
  roleId: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, firstname, lastname, created_at");
    const { data: roles } = await supabase.from("user_roles").select("id, user_id, role");

    const merged = (profiles || []).map((p) => {
      const r = roles?.find((r) => r.user_id === p.id);
      return { ...p, role: r?.role || "student", roleId: r?.id || "" };
    });
    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId: string, roleId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("id", roleId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Rôle mis à jour");
      load();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const roleBadge = (r: string) => {
    const v = r === "admin" ? "destructive" : r === "instructor" ? "default" : "secondary";
    return <Badge variant={v}>{r}</Badge>;
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle actuel</TableHead>
              <TableHead>Changer rôle</TableHead>
              <TableHead>Inscrit le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.firstname || ""} {u.lastname || ""}</TableCell>
                <TableCell>{roleBadge(u.role)}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => changeRole(u.id, u.roleId, v)}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UserManagement;
