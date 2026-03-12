import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  courseCount: number;
}

const CategoriesSection = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: cats } = await supabase.from("categories").select("*");
      if (cats) {
        const withCounts = await Promise.all(
          cats.map(async (cat) => {
            const { count } = await supabase
              .from("courses")
              .select("*", { count: "exact", head: true })
              .eq("category_id", cat.id)
              .eq("status", "published");
            return { id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon, courseCount: count ?? 0 };
          })
        );
        setCategories(withCounts);
      }
    };
    fetch();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background orb */}
      <motion.div
        className="absolute top-0 right-0 w-[400px] h-[400px] orb-red blur-[120px] opacity-30"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.span
            className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
            viewport={{ once: true }}
          >
            Catégories
          </motion.span>
          <h2 className="font-heading text-4xl font-bold mb-3">Explorez par catégorie</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Trouvez le domaine qui vous passionne</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, type: "spring" }}
            >
              <Link to={`/courses?category=${cat.slug}`}>
                <motion.div
                  className="glass-card p-6 text-center border-glow relative overflow-hidden group cursor-pointer"
                  whileHover={{ scale: 1.08, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
                  <motion.span
                    className="text-3xl block mb-3 relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {cat.icon || "📚"}
                  </motion.span>
                  <h3 className="font-heading text-sm font-semibold text-foreground mb-1 relative z-10">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground relative z-10">{cat.courseCount} cours</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
