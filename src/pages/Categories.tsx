import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  courseCount: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: cats } = await supabase
        .from("categories")
        .select("*");

      if (cats) {
        // Count courses per category
        const withCounts = await Promise.all(
          cats.map(async (cat) => {
            const { count } = await supabase
              .from("courses")
              .select("*", { count: "exact", head: true })
              .eq("category_id", cat.id)
              .eq("status", "published");
            return {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              icon: cat.icon,
              courseCount: count ?? 0,
            };
          })
        );
        setCategories(withCounts);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-heading text-3xl font-bold mb-2">Catégories</h1>
            <p className="text-muted-foreground">
              Explorez nos domaines de formation
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/courses?category=${cat.slug}`}
                    className="glass-card p-8 hover-lift block group"
                  >
                    <span className="text-5xl block mb-4">{cat.icon || "📚"}</span>
                    <h2 className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {cat.courseCount} cours disponible{cat.courseCount !== 1 ? "s" : ""}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;
