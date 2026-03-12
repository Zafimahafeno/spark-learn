import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("courses")
        .select(`
          *,
          categories!courses_category_id_fkey(id, name, slug),
          profiles!courses_instructor_id_fkey(id, firstname, lastname, avatar_url, bio)
        `)
        .eq("status", "published")
        .limit(3);

      if (data) {
        const mapped: Course[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          subtitle: c.subtitle || "",
          description: c.description || "",
          price: Number(c.price) || 0,
          thumbnailUrl: c.thumbnail_url || "",
          level: c.level || "beginner",
          status: c.status || "published",
          instructor: {
            id: 0,
            firstname: c.profiles?.firstname || "Instructeur",
            lastname: c.profiles?.lastname || "",
            avatarUrl: c.profiles?.avatar_url || "",
            bio: c.profiles?.bio || "",
          },
          category: {
            id: c.categories?.id || 0,
            name: c.categories?.name || "",
            slug: c.categories?.slug || "",
          },
          rating: 0,
          reviewCount: 0,
          studentCount: 0,
          sections: [],
          totalLessons: 0,
          totalDuration: 0,
        }));
        setCourses(mapped);
      }
    };
    fetch();
  }, []);

  if (courses.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background orb */}
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] orb-red blur-[120px] opacity-20"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <motion.span
              className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3"
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
              viewport={{ once: true }}
            >
              Populaires
            </motion.span>
            <h2 className="font-heading text-4xl font-bold mb-2">Cours populaires</h2>
            <p className="text-muted-foreground">Les cours les mieux notés par nos apprenants</p>
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group"
          >
            Voir tout
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
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
