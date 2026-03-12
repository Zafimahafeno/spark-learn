import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Trophy } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedCourses />

      {/* Why Choose Us */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Avantages</span>
            <h2 className="font-heading text-4xl font-bold mb-3">Pourquoi nous choisir ?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Apprentissage interactif", desc: "Quiz, exercices pratiques et projets réels pour ancrer vos connaissances." },
              { icon: Shield, title: "Contenu certifié", desc: "Tous nos cours sont créés et validés par des experts reconnus du secteur." },
              { icon: Trophy, title: "Certificats reconnus", desc: "Obtenez des certificats vérifiables pour valoriser vos compétences." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring" }}
              >
                <motion.div
                  className="glass-card p-8 border-glow relative overflow-hidden group h-full"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 orb-red blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 relative z-10"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <item.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <h3 className="font-heading text-lg font-bold mb-2 relative z-10">{item.title}</h3>
                  <p className="text-sm text-muted-foreground relative z-10">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-red p-16 text-center relative overflow-hidden glow-red"
          >
            {/* Animated orbs */}
            <motion.div
              className="absolute top-0 left-0 w-[300px] h-[300px] orb-red blur-[80px] opacity-30"
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-[200px] h-[200px] orb-dark blur-[60px] opacity-40"
              animate={{ x: [0, -30, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="relative z-10">
              <motion.h2
                className="font-heading text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Prêt à commencer votre{" "}
                <span className="gradient-text">voyage</span> ?
              </motion.h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Rejoignez des milliers d'apprenants et développez vos compétences dès maintenant.
              </p>
              <motion.a
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base relative overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px -5px hsl(0 85% 55% / 0.5)" }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 shimmer" />
                <span className="relative z-10 flex items-center gap-2">
                  Créer un compte gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
