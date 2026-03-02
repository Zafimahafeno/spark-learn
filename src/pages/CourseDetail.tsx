import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Users, Clock, BookOpen, Play, FileText, File, ChevronDown, Award, Check } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { courses } from "@/data/mockData";

const CourseDetail = () => {
  const { slug } = useParams();
  const course = courses.find((c) => c.slug === slug);
  const [openSections, setOpenSections] = useState<number[]>([]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="font-heading text-2xl font-bold">Cours introuvable</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleSection = (id: number) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    all: "Tous niveaux",
  };

  const contentIcon = { video: Play, text: FileText, document: File };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              <span className="text-sm font-medium text-primary">{course.category.name}</span>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.subtitle}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <strong className="text-foreground">{course.rating}</strong> ({course.reviewCount} avis)
                </span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.studentCount.toLocaleString()} étudiants</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.round(course.totalDuration / 60)}h de contenu</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.totalLessons} leçons</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-heading font-bold text-primary">
                  {course.instructor.firstname[0]}{course.instructor.lastname[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{course.instructor.firstname} {course.instructor.lastname}</p>
                  <p className="text-xs text-muted-foreground">{course.instructor.bio}</p>
                </div>
              </div>
            </motion.div>

            {/* Sidebar card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 space-y-5 h-fit lg:sticky lg:top-24"
            >
              <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <Play className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-heading font-bold text-foreground">
                {course.price === 0 ? "Gratuit" : `${course.price}€`}
              </div>
              <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                {course.price === 0 ? "S'inscrire gratuitement" : "Acheter ce cours"}
              </button>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Accès à vie</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Certificat de complétion</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Niveau: {levelLabels[course.level]}</li>
                <li className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Quiz et évaluations</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="lg:max-w-2xl">
            <h2 className="font-heading text-2xl font-bold mb-2">Description</h2>
            <p className="text-muted-foreground mb-10">{course.description}</p>

            <h2 className="font-heading text-2xl font-bold mb-4">Contenu du cours</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {course.sections.length} sections • {course.totalLessons} leçons • {Math.round(course.totalDuration / 60)}h de durée totale
            </p>

            <div className="space-y-3">
              {course.sections.map((section) => (
                <div key={section.id} className="glass-card overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-heading font-semibold text-sm">{section.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{section.lessons.length} leçons</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          openSections.includes(section.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {openSections.includes(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-border"
                    >
                      {section.lessons.map((lesson) => {
                        const Icon = contentIcon[lesson.contentType];
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 text-sm border-b border-border/50 last:border-b-0 hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Aperçu</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{lesson.durationMinutes} min</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
