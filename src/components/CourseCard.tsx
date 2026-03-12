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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6, type: "spring" }}
    >
      <Link to={`/course/${course.slug}`} className="block group">
        <motion.div
          className="glass-card overflow-hidden border-glow relative"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Red glow on hover */}
          <div className="absolute -top-20 -right-20 w-40 h-40 orb-red blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700" />

          {/* Thumbnail */}
          <div className="aspect-video bg-secondary relative overflow-hidden">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute top-3 left-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm">
                {levelLabels[course.level]}
              </span>
            </div>
            {course.price === 0 && (
              <div className="absolute top-3 right-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-background/80 text-primary backdrop-blur-sm border border-primary/30">
                  Gratuit
                </span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 relative z-10">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">{course.category.name}</p>
            <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.subtitle}</p>

            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-medium text-foreground">{course.rating}</span>
              <span className="text-muted-foreground">({course.reviewCount})</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.studentCount.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(course.totalDuration / 60)}h</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.totalLessons} leçons</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
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
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
