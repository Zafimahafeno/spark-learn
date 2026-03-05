import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, ArrowLeft, GripVertical, Play, FileText, File } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Section {
  id: number;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  content_type: string;
  duration_minutes: number | null;
  is_preview: boolean;
  sort_order: number;
  text_content: string | null;
  video_url: string | null;
  document_url: string | null;
}

const contentTypeLabels: Record<string, string> = {
  video: "Vidéo",
  text: "Texte",
  document: "Document/PDF",
};

const contentIcons: Record<string, any> = { video: Play, text: FileText, document: File };

const ManageCourseContent = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  // Section dialog
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: "" });

  // Lesson dialog
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonSectionId, setLessonSectionId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content_type: "text",
    duration_minutes: "10",
    is_preview: false,
    text_content: "",
    video_url: "",
    document_url: "",
  });

  const load = async () => {
    if (!user || !courseId) return;
    const id = parseInt(courseId);

    const { data: course } = await supabase.from("courses").select("title").eq("id", id).single();
    setCourseTitle(course?.title || "");

    const { data: secs } = await supabase
      .from("sections")
      .select("id, title, sort_order, lessons(id, title, content_type, duration_minutes, is_preview, sort_order, text_content, video_url, document_url)")
      .eq("course_id", id)
      .order("sort_order");

    const sorted = (secs || [])
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((s: any) => ({
        ...s,
        lessons: (s.lessons || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)),
      }));

    setSections(sorted);
    if (sorted.length > 0 && expandedSections.length === 0) {
      setExpandedSections([sorted[0].id]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, courseId]);

  const toggleSection = (id: number) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  // Section CRUD
  const openNewSection = () => {
    setEditingSection(null);
    setSectionForm({ title: "" });
    setSectionDialog(true);
  };

  const openEditSection = (s: Section) => {
    setEditingSection(s);
    setSectionForm({ title: s.title });
    setSectionDialog(true);
  };

  const saveSection = async () => {
    if (!courseId) return;
    const id = parseInt(courseId);
    if (editingSection) {
      const { error } = await supabase.from("sections").update({ title: sectionForm.title }).eq("id", editingSection.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Section mise à jour");
    } else {
      const maxOrder = sections.reduce((max, s) => Math.max(max, s.sort_order || 0), 0);
      const { error } = await supabase.from("sections").insert({ course_id: id, title: sectionForm.title, sort_order: maxOrder + 1 });
      if (error) { toast.error(error.message); return; }
      toast.success("Section créée");
    }
    setSectionDialog(false);
    load();
  };

  const deleteSection = async (sectionId: number) => {
    // Delete lessons first
    await supabase.from("lessons").delete().eq("section_id", sectionId);
    const { error } = await supabase.from("sections").delete().eq("id", sectionId);
    if (error) toast.error(error.message);
    else { toast.success("Section supprimée"); load(); }
  };

  // Lesson CRUD
  const openNewLesson = (sectionId: number) => {
    setEditingLesson(null);
    setLessonSectionId(sectionId);
    setLessonForm({ title: "", content_type: "text", duration_minutes: "10", is_preview: false, text_content: "", video_url: "", document_url: "" });
    setLessonDialog(true);
  };

  const openEditLesson = (lesson: Lesson, sectionId: number) => {
    setEditingLesson(lesson);
    setLessonSectionId(sectionId);
    setLessonForm({
      title: lesson.title,
      content_type: lesson.content_type,
      duration_minutes: String(lesson.duration_minutes || 10),
      is_preview: lesson.is_preview || false,
      text_content: lesson.text_content || "",
      video_url: lesson.video_url || "",
      document_url: lesson.document_url || "",
    });
    setLessonDialog(true);
  };

  const saveLesson = async () => {
    if (!lessonSectionId) return;
    const payload: any = {
      section_id: lessonSectionId,
      title: lessonForm.title,
      content_type: lessonForm.content_type as any,
      duration_minutes: parseInt(lessonForm.duration_minutes) || 10,
      is_preview: lessonForm.is_preview,
      text_content: lessonForm.content_type === "text" ? lessonForm.text_content || null : null,
      video_url: lessonForm.content_type === "video" ? lessonForm.video_url || null : null,
      document_url: lessonForm.content_type === "document" ? lessonForm.document_url || null : null,
    };

    if (editingLesson) {
      const { error } = await supabase.from("lessons").update(payload).eq("id", editingLesson.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Leçon mise à jour");
    } else {
      const section = sections.find(s => s.id === lessonSectionId);
      payload.sort_order = section ? section.lessons.length + 1 : 1;
      const { error } = await supabase.from("lessons").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Leçon créée");
    }
    setLessonDialog(false);
    load();
  };

  const deleteLesson = async (lessonId: number) => {
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) toast.error(error.message);
    else { toast.success("Leçon supprimée"); load(); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/manage-courses")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Contenu du cours</h1>
          <p className="text-sm text-muted-foreground">{courseTitle}</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openNewSection}><Plus className="w-4 h-4 mr-2" />Nouvelle section</Button>
      </div>

      {sections.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune section. Commencez par créer une section pour organiser vos leçons.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, sIdx) => (
            <Card key={section.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-secondary/20">
                <button onClick={() => toggleSection(section.id)} className="flex items-center gap-2 flex-1 text-left">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-heading font-semibold">Section {sIdx + 1}: {section.title}</span>
                  <Badge variant="secondary" className="ml-2">{section.lessons.length} leçons</Badge>
                  {expandedSections.includes(section.id) ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />}
                </button>
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditSection(section)}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                </div>
              </div>

              {expandedSections.includes(section.id) && (
                <div className="border-t border-border">
                  {section.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">Aucune leçon dans cette section.</p>
                  ) : (
                    section.lessons.map((lesson) => {
                      const Icon = contentIcons[lesson.content_type] || FileText;
                      return (
                        <div key={lesson.id} className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-secondary/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium">{lesson.title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{contentTypeLabels[lesson.content_type]}</span>
                                <span className="text-xs text-muted-foreground">• {lesson.duration_minutes} min</span>
                                {lesson.is_preview && <Badge variant="outline" className="text-xs h-4">Aperçu</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditLesson(lesson, section.id)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div className="p-3">
                    <Button variant="outline" size="sm" onClick={() => openNewLesson(section.id)} className="w-full">
                      <Plus className="w-3 h-3 mr-1" />Ajouter une leçon
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSection ? "Modifier la section" : "Nouvelle section"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Titre de la section</Label><Input value={sectionForm.title} onChange={e => setSectionForm({ title: e.target.value })} placeholder="Ex: Introduction au cours" /></div>
            <Button onClick={saveSection} className="w-full">{editingSection ? "Mettre à jour" : "Créer la section"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLesson ? "Modifier la leçon" : "Nouvelle leçon"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Titre</Label><Input value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Ex: Les bases du HTML" /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <Select value={lessonForm.content_type} onValueChange={v => setLessonForm({ ...lessonForm, content_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">📝 Texte</SelectItem>
                    <SelectItem value="video">🎬 Vidéo</SelectItem>
                    <SelectItem value="document">📄 Document/PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (minutes)</Label>
                <Input type="number" value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lessonForm.is_preview}
                onChange={e => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                className="rounded"
                id="is_preview"
              />
              <Label htmlFor="is_preview" className="text-sm cursor-pointer">Aperçu gratuit (visible sans inscription)</Label>
            </div>

            {/* Content fields based on type */}
            {lessonForm.content_type === "text" && (
              <div className="space-y-2">
                <Label>Contenu texte</Label>
                <Textarea
                  value={lessonForm.text_content}
                  onChange={e => setLessonForm({ ...lessonForm, text_content: e.target.value })}
                  rows={12}
                  placeholder="Écrivez le contenu de votre leçon ici... Vous pouvez utiliser du texte formaté."
                  className="font-mono text-sm"
                />
              </div>
            )}

            {lessonForm.content_type === "video" && (
              <div className="space-y-2">
                <Label>URL de la vidéo</Label>
                <Input
                  value={lessonForm.video_url}
                  onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... ou URL directe"
                />
                <p className="text-xs text-muted-foreground">Collez l'URL YouTube, Vimeo ou un lien direct vers la vidéo</p>
              </div>
            )}

            {lessonForm.content_type === "document" && (
              <div className="space-y-2">
                <Label>URL du document</Label>
                <Input
                  value={lessonForm.document_url}
                  onChange={e => setLessonForm({ ...lessonForm, document_url: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
                <p className="text-xs text-muted-foreground">Collez l'URL du PDF ou document à partager</p>
              </div>
            )}

            <Button onClick={saveLesson} className="w-full">{editingLesson ? "Mettre à jour" : "Créer la leçon"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCourseContent;
