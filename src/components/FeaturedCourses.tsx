import { motion } from "framer-motion";
import { courses } from "@/data/mockData";
import CourseCard from "@/components/CourseCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedCourses = () => {
  const featured = courses.slice(0, 3);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">Cours populaires</h2>
            <p className="text-muted-foreground">Les cours les mieux notés par nos apprenants</p>
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Voir tous les cours <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
