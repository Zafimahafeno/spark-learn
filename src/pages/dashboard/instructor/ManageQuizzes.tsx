import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Quiz {
  id: number;
  title: string;
  passing_percentage: number | null;
  section_id: number | null;
  sectionTitle?: string;
  courseTitle?: string;
}

interface Question {
  id: number;
  question_text: string;
  options: { id: number; option_text: string; is_correct: boolean }[];
}

interface SectionOption {
  id: number;
  title: string;
  courseTitle: string;
}

const ManageQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [form, setForm] = useState({ title: "", passing_percentage: "70", section_id: "" });

  // Questions management
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionDialog, setQuestionDialog] = useState(false);
  const [questionForm, setQuestionForm] = useState({ question_text: "", options: [{ text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }] });
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  const loadSections = async () => {
    if (!user) return;
    const { data: courses } = await supabase.from("courses").select("id, title").eq("instructor_id", user.id);
    if (!courses || courses.length === 0) return;
    const courseIds = courses.map(c => c.id);
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));
    const { data: secs } = await supabase.from("sections").select("id, title, course_id").in("course_id", courseIds).order("sort_order");
    setSections((secs || []).map(s => ({ id: s.id, title: s.title, courseTitle: courseMap[s.course_id] || "" })));
  };

  const load = async () => {
    if (!user) return;
    const { data: courses } = await supabase.from("courses").select("id, title").eq("instructor_id", user.id);
    const courseIds = courses?.map(c => c.id) || [];
    if (courseIds.length === 0) { setLoading(false); return; }

    const { data: secs } = await supabase.from("sections").select("id, title, course_id").in("course_id", courseIds);
    const sectionIds = secs?.map(s => s.id) || [];
    if (sectionIds.length === 0) { setLoading(false); return; }

    const courseMap = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
    const sectionMap = Object.fromEntries((secs || []).map(s => [s.id, { title: s.title, courseTitle: courseMap[s.course_id] || "" }]));

    const { data } = await supabase.from("quizzes").select("*").in("section_id", sectionIds);
    setQuizzes((data || []).map(q => ({
      ...q,
      sectionTitle: sectionMap[q.section_id!]?.title || "—",
      courseTitle: sectionMap[q.section_id!]?.courseTitle || "—",
    })));
    setLoading(false);
  };

  useEffect(() => { load(); loadSections(); }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", passing_percentage: "70", section_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (q: Quiz) => {
    setEditing(q);
    setForm({ title: q.title, passing_percentage: String(q.passing_percentage || 70), section_id: String(q.section_id || "") });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title,
      passing_percentage: parseInt(form.passing_percentage) || 70,
      section_id: form.section_id ? parseInt(form.section_id) : null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("quizzes").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("quizzes").insert(payload));
    }
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Quiz mis à jour" : "Quiz créé"); setDialogOpen(false); load(); }
  };

  const deleteQuiz = async (id: number) => {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Quiz supprimé"); load(); }
  };

  // Questions
  const loadQuestions = async (quizId: number) => {
    const { data } = await supabase.from("quiz_questions").select("id, question_text, quiz_options(id, option_text, is_correct)").eq("quiz_id", quizId);
    setQuestions((data || []).map((q: any) => ({ ...q, options: q.quiz_options || [] })));
  };

  const toggleExpand = (quizId: number) => {
    if (expandedQuiz === quizId) { setExpandedQuiz(null); return; }
    setExpandedQuiz(quizId);
    loadQuestions(quizId);
  };

  const openNewQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ question_text: "", options: [{ text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }] });
    setQuestionDialog(true);
  };

  const saveQuestion = async () => {
    if (!expandedQuiz) return;
    const { data: q, error } = await supabase.from("quiz_questions").insert({ quiz_id: expandedQuiz, question_text: questionForm.question_text }).select().single();
    if (error || !q) { toast.error(error?.message || "Erreur"); return; }

    const validOptions = questionForm.options.filter(o => o.text.trim());
    if (validOptions.length >= 2) {
      await supabase.from("quiz_options").insert(validOptions.map(o => ({ question_id: q.id, option_text: o.text, is_correct: o.correct })));
    }
    toast.success("Question ajoutée");
    setQuestionDialog(false);
    loadQuestions(expandedQuiz);
  };

  const deleteQuestion = async (qId: number) => {
    await supabase.from("quiz_options").delete().eq("question_id", qId);
    await supabase.from("quiz_questions").delete().eq("id", qId);
    toast.success("Question supprimée");
    if (expandedQuiz) loadQuestions(expandedQuiz);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Gestion des Quiz</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Nouveau quiz</Button>
      </div>

      {quizzes.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun quiz créé. Créez des sections dans vos cours puis ajoutez des quiz.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <Card key={q.id}>
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h3 className="font-medium">{q.title}</h3>
                  <p className="text-sm text-muted-foreground">{q.courseTitle} → {q.sectionTitle} • Score min: {q.passing_percentage || 70}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(q.id)}>
                    {expandedQuiz === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(q)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteQuiz(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>

              {expandedQuiz === q.id && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Questions ({questions.length})</h4>
                    <Button size="sm" variant="outline" onClick={openNewQuestion}><Plus className="w-3 h-3 mr-1" />Ajouter</Button>
                  </div>
                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune question. Ajoutez-en une !</p>
                  ) : (
                    <div className="space-y-2">
                      {questions.map((question, idx) => (
                        <div key={question.id} className="bg-secondary/30 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{idx + 1}. {question.question_text}</p>
                            <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {question.options.map((opt) => (
                              <li key={opt.id} className={`text-xs px-2 py-1 rounded ${opt.is_correct ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>
                                {opt.is_correct ? "✓ " : "○ "}{opt.option_text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Modifier le quiz" : "Nouveau quiz"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Score minimum (%)</Label><Input type="number" value={form.passing_percentage} onChange={e => setForm({ ...form, passing_percentage: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={form.section_id} onValueChange={v => setForm({ ...form, section_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir une section" /></SelectTrigger>
                <SelectContent>
                  {sections.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.courseTitle} → {s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Mettre à jour" : "Créer"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle question</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Question</Label><Input value={questionForm.question_text} onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })} /></div>
            {questionForm.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={opt.correct} onChange={e => {
                  const opts = [...questionForm.options];
                  opts[i] = { ...opts[i], correct: e.target.checked };
                  setQuestionForm({ ...questionForm, options: opts });
                }} className="rounded" />
                <Input placeholder={`Option ${i + 1}`} value={opt.text} onChange={e => {
                  const opts = [...questionForm.options];
                  opts[i] = { ...opts[i], text: e.target.value };
                  setQuestionForm({ ...questionForm, options: opts });
                }} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Cochez les réponses correctes</p>
            <Button onClick={saveQuestion} className="w-full">Ajouter la question</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageQuizzes;
