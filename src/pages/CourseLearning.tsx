import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronDown, ChevronRight, Play, FileText, File, CheckCircle2, Circle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LessonData {
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

interface SectionData {
  id: number;
  title: string;
  sort_order: number;
  lessons: LessonData[];
}

const contentIcons: Record<string, any> = { video: Play, text: FileText, document: File };

const CourseLearning = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState("");
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [totalLessons, setTotalLessons] = useState(0);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!user || !slug) return;

    const fetchData = async () => {
      // Get course with sections and lessons
      const { data: course } = await supabase
        .from("courses")
        .select(`
          id, title,
          sections(id, title, sort_order, 
            lessons(id, title, content_type, duration_minutes, is_preview, sort_order, text_content, video_url, document_url)
          )
        `)
        .eq("slug", slug)
        .single();

      if (!course) {
        toast.error("Cours introuvable");
        navigate("/courses");
        return;
      }

      setCourseTitle(course.title);

      const sorted = (course.sections || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((s: any) => ({
          ...s,
          lessons: (s.lessons || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)),
        }));

      setSections(sorted);

      const allLessons = sorted.flatMap((s: SectionData) => s.lessons);
      setTotalLessons(allLessons.length);

      // Open first section, select first lesson
      if (sorted.length > 0) {
        setOpenSections([sorted[0].id]);
        if (sorted[0].lessons.length > 0) {
          setSelectedLesson(sorted[0].lessons[0]);
        }
      }

      // Get completions
      const lessonIds = allLessons.map((l: LessonData) => l.id);
      if (lessonIds.length > 0) {
        const { data: completions } = await supabase
          .from("lesson_completions")
          .select("lesson_id")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);

        if (completions) {
          setCompletedLessons(new Set(completions.map((c) => c.lesson_id)));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, slug]);

  const toggleSection = (id: number) => {
    setOpenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const markComplete = async (lessonId: number) => {
    if (!user || completedLessons.has(lessonId)) return;
    setMarking(true);

    const { error } = await supabase
      .from("lesson_completions")
      .insert({ user_id: user.id, lesson_id: lessonId });

    if (!error) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(lessonId);
      setCompletedLessons(newCompleted);

      // Update enrollment progress
      const progressPercent = Math.round((newCompleted.size / totalLessons) * 100);
      const { data: course } = await supabase.from("courses").select("id").eq("slug", slug).single();
      if (course) {
        await supabase
          .from("enrollments")
          .update({ progress_percent: progressPercent, is_completed: progressPercent >= 100, last_accessed: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("course_id", course.id);
      }

      toast.success("Leçon terminée !");
    }
    setMarking(false);
  };

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-heading font-semibold text-sm truncate max-w-[300px]">{courseTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{progressPercent}% terminé</span>
          <Progress value={progressPercent} className="w-32 h-2" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - lesson list */}
        <aside className="w-80 border-r border-border overflow-y-auto bg-card shrink-0 hidden md:block">
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">{completedLessons.size}/{totalLessons} leçons terminées</p>
          </div>
          {sections.map((section) => (
            <div key={section.id} className="border-b border-border/50">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 p-3 text-left hover:bg-secondary/50 transition-colors"
              >
                {openSections.includes(section.id) ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
                <span className="text-xs font-semibold truncate">{section.title}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] h-4 shrink-0">{section.lessons.length}</Badge>
              </button>
              {openSections.includes(section.id) && (
                <div>
                  {section.lessons.map((lesson) => {
                    const Icon = contentIcons[lesson.content_type] || FileText;
                    const isActive = selectedLesson?.id === lesson.id;
                    const isCompleted = completedLessons.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors text-xs",
                          isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-secondary/30"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {selectedLesson ? (
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold">{selectedLesson.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedLesson.content_type === "video" ? "🎬 Vidéo" : selectedLesson.content_type === "document" ? "📄 Document" : "📝 Texte"}
                    </Badge>
                    {selectedLesson.duration_minutes && (
                      <span className="text-xs text-muted-foreground">{selectedLesson.duration_minutes} min</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={completedLessons.has(selectedLesson.id) ? "secondary" : "default"}
                  onClick={() => markComplete(selectedLesson.id)}
                  disabled={marking || completedLessons.has(selectedLesson.id)}
                >
                  {completedLessons.has(selectedLesson.id) ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Terminé</>
                  ) : (
                    <><Circle className="w-4 h-4 mr-1" /> Marquer comme terminé</>
                  )}
                </Button>
              </div>

              {/* Video content */}
              {selectedLesson.content_type === "video" && selectedLesson.video_url && (
                <div className="mb-6">
                  {getYouTubeEmbedUrl(selectedLesson.video_url) ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedLesson.video_url)!}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <video src={selectedLesson.video_url} controls className="w-full h-full" />
                    </div>
                  )}
                </div>
              )}

              {/* Document content */}
              {selectedLesson.content_type === "document" && selectedLesson.document_url && (
                <div className="mb-6">
                  <div className="border border-border rounded-lg p-6 bg-secondary/20 text-center">
                    <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium mb-3">Document disponible</p>
                    <a
                      href={selectedLesson.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Ouvrir le document
                    </a>
                  </div>
                </div>
              )}

              {/* Text content */}
              {selectedLesson.text_content && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="bg-card border border-border rounded-lg p-6 whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedLesson.text_content}
                  </div>
                </div>
              )}

              {!selectedLesson.text_content && !selectedLesson.video_url && !selectedLesson.document_url && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Aucun contenu disponible pour cette leçon.</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {(() => {
                  const allLessons = sections.flatMap((s) => s.lessons);
                  const idx = allLessons.findIndex((l) => l.id === selectedLesson.id);
                  const prev = idx > 0 ? allLessons[idx - 1] : null;
                  const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
                  return (
                    <>
                      <Button variant="outline" size="sm" disabled={!prev} onClick={() => prev && setSelectedLesson(prev)}>
                        ← Précédent
                      </Button>
                      <Button variant="outline" size="sm" disabled={!next} onClick={() => next && setSelectedLesson(next)}>
                        Suivant →
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sélectionnez une leçon pour commencer
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseLearning;
