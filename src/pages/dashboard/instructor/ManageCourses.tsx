import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  slug: string;
  status: string | null;
  level: string | null;
  price: number | null;
  category_id: number | null;
}

interface Category {
  id: number;
  name: string;
}

const ManageCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [form, setForm] = useState({ title: "", slug: "", subtitle: "", description: "", price: "0", level: "beginner", category_id: "", status: "draft" });

  const load = async () => {
    if (!user) return;
    const [{ data: c }, { data: cats }] = await Promise.all([
      supabase.from("courses").select("id, title, slug, status, level, price, category_id").eq("instructor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setCourses(c || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", slug: "", subtitle: "", description: "", price: "0", level: "beginner", category_id: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      title: c.title,
      slug: c.slug,
      subtitle: "",
      description: "",
      price: String(c.price || 0),
      level: c.level || "beginner",
      category_id: c.category_id ? String(c.category_id) : "",
      status: c.status || "draft",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const payload = {
      title: form.title,
      slug,
      subtitle: form.subtitle || null,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      level: form.level as any,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      status: form.status as any,
      instructor_id: user.id,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("courses").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("courses").insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing ? "Cours mis à jour" : "Cours créé");
      setDialogOpen(false);
      load();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Mes cours</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Nouveau cours</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le cours" : "Nouveau cours"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-généré si vide" /></div>
              <div className="space-y-2"><Label>Sous-titre</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prix (€)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Débutant</SelectItem>
                      <SelectItem value="intermediate">Intermédiaire</SelectItem>
                      <SelectItem value="advanced">Avancé</SelectItem>
                      <SelectItem value="all">Tous niveaux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Mettre à jour" : "Créer le cours"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun cours créé. Commencez par en créer un !</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell><Badge variant={c.status === "published" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                  <TableCell className="capitalize">{c.level}</TableCell>
                  <TableCell>{c.price ? `${c.price} €` : "Gratuit"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/manage-courses/${c.id}/content`)} title="Gérer le contenu">
                        <BookOpen className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)} title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ManageCourses;
