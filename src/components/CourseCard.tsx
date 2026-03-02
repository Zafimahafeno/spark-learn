import { Link } from "react-router-dom";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { Course } from "@/types/course";
import { motion } from "framer-motion";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
  const levelLabels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    all: "Tous niveaux",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/course/${course.slug}`} className="block group">
        <div className="glass-card overflow-hidden hover-lift">
          {/* Thumbnail placeholder */}
          <div className="aspect-video bg-secondary relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div className="absolute top-3 left-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground">
                {levelLabels[course.level]}
              </span>
            </div>
            {course.price === 0 && (
              <div className="absolute top-3 right-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                  Gratuit
                </span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <p className="text-xs text-primary font-medium">{course.category.name}</p>
            <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.subtitle}</p>

            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-foreground">{course.rating}</span>
              <span className="text-muted-foreground">({course.reviewCount})</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.studentCount.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(course.totalDuration / 60)}h</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.totalLessons} leçons</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                  {course.instructor.firstname[0]}
                </div>
                <span className="text-xs text-muted-foreground">
                  {course.instructor.firstname} {course.instructor.lastname}
                </span>
              </div>
              <span className="font-heading font-bold text-foreground">
                {course.price === 0 ? "Gratuit" : `${course.price}€`}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
