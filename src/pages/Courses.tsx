import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";

const Courses = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      let query = supabase
        .from("courses")
        .select(`
          *,
          categories!courses_category_id_fkey(id, name, slug),
          profiles!courses_instructor_id_fkey(id, firstname, lastname, avatar_url, bio)
        `)
        .eq("status", "published");

      if (selectedCategory !== "all") {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (selectedLevel !== "all") {
        query = query.eq("level", selectedLevel as any);
      }
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data } = await query;

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
      setLoading(false);
    };
    fetchCourses();
  }, [search, selectedCategory, selectedLevel, categories]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-heading text-3xl font-bold mb-2">Tous les cours</h1>
            <p className="text-muted-foreground">Explorez notre catalogue de formations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Aucun cours trouvé.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
