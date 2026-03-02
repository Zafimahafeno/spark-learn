import { motion } from "framer-motion";
import { categories } from "@/data/mockData";
import { Link } from "react-router-dom";

const CategoriesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl font-bold mb-3">Explorez par catégorie</h2>
          <p className="text-muted-foreground">Trouvez le domaine qui vous passionne</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={`/courses?category=${cat.slug}`}
                className="glass-card p-5 text-center hover-lift block"
              >
                <span className="text-3xl block mb-3">{cat.icon}</span>
                <h3 className="font-heading text-sm font-semibold text-foreground mb-1">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">{cat.courseCount} cours</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
