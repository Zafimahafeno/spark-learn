import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Question {
  id: number;
  question_text: string;
  options: { id: number; option_text: string; is_correct: boolean }[];
}

interface QuizData {
  id: number;
  title: string;
  passing_percentage: number;
  questions: Question[];
}

const CourseQuiz = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!user || !slug) return;

      // Get course
      const { data: course } = await supabase
        .from("courses")
        .select("id, title")
        .eq("slug", slug)
        .maybeSingle();

      if (!course) { setLoading(false); return; }
      setCourseTitle(course.title);

      // Check enrollment and progress
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("progress_percent")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (!enrollment || (enrollment.progress_percent || 0) < 100) {
        toast.error("Vous devez terminer le cours à 100% avant de passer le quiz");
        navigate(`/course/${slug}`);
        return;
      }

      // Get sections and quizzes
      const { data: sections } = await supabase.from("sections").select("id").eq("course_id", course.id);
      const sectionIds = sections?.map(s => s.id) || [];
      if (sectionIds.length === 0) { setLoading(false); return; }

      const { data: quizzes } = await supabase.from("quizzes").select("*").in("section_id", sectionIds).limit(1);
      if (!quizzes || quizzes.length === 0) { setLoading(false); return; }

      const quizData = quizzes[0];
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("id, question_text, quiz_options(id, option_text, is_correct)")
        .eq("quiz_id", quizData.id);

      setQuiz({
        id: quizData.id,
        title: quizData.title,
        passing_percentage: quizData.passing_percentage || 70,
        questions: (questionsData || []).map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.quiz_options || [],
        })),
      });
      setLoading(false);
    };
    fetchQuiz();
  }, [slug, user]);

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    let correct = 0;
    quiz.questions.forEach(q => {
      const selectedId = answers[q.id];
      const correctOption = q.options.find(o => o.is_correct);
      if (correctOption && selectedId === correctOption.id) correct++;
    });

    const scorePercent = Math.round((correct / quiz.questions.length) * 100);
    const didPass = scorePercent >= quiz.passing_percentage;

    setScore(scorePercent);
    setPassed(didPass);
    setSubmitted(true);

    // Save attempt
    await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      user_id: user.id,
      score: scorePercent,
      passed: didPass,
    });

    // If passed, create certificate
    if (didPass) {
      const { data: course } = await supabase.from("courses").select("id").eq("slug", slug).maybeSingle();
      if (course) {
        const verifyCode = `CERT-${course.id}-${Date.now().toString(36).toUpperCase()}`;
        await supabase.from("certificates").insert({
          user_id: user.id,
          course_id: course.id,
          verify_code: verifyCode,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center pt-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="font-heading text-2xl font-bold mb-4">Aucun quiz disponible</h1>
          <p className="text-muted-foreground mb-6">Ce cours n'a pas encore de quiz de certification.</p>
          <Button onClick={() => navigate(`/course/${slug}`)}>Retour au cours</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-heading text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground mb-8">Cours : {courseTitle} • Score minimum : {quiz.passing_percentage}%</p>

          {submitted ? (
            <Card className="text-center py-10">
              <CardContent className="space-y-6">
                {passed ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                    <h2 className="font-heading text-2xl font-bold text-primary">Félicitations !</h2>
                    <p className="text-lg">Vous avez obtenu <strong>{score}%</strong></p>
                    <p className="text-muted-foreground">Votre certificat a été généré. Consultez-le dans votre espace certificats.</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate("/dashboard/certificates")}><Award className="w-4 h-4 mr-2" />Voir mes certificats</Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard/my-courses")}>Retour aux cours</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-destructive mx-auto" />
                    <h2 className="font-heading text-2xl font-bold text-destructive">Quiz non validé</h2>
                    <p className="text-lg">Score : <strong>{score}%</strong> (minimum requis : {quiz.passing_percentage}%)</p>
                    <p className="text-muted-foreground">Révisez le cours et réessayez.</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => { setSubmitted(false); setAnswers({}); }}>Réessayer</Button>
                      <Button variant="outline" onClick={() => navigate(`/course/${slug}`)}>Revoir le cours</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Progress value={(Object.keys(answers).length / quiz.questions.length) * 100} className="h-2 mb-4" />
              <p className="text-sm text-muted-foreground text-right">{Object.keys(answers).length}/{quiz.questions.length} répondu(s)</p>

              {quiz.questions.map((q, idx) => (
                <Card key={q.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{idx + 1}. {q.question_text}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {q.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm ${
                          answers[q.id] === opt.id
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        {opt.option_text}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length}
                className="w-full py-6 text-lg"
              >
                Soumettre le quiz ({Object.keys(answers).length}/{quiz.questions.length})
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseQuiz;
