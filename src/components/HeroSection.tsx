import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, BookOpen, Users, Award } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Gradient orbs */}
      <div className="absolute top-20 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-[120px] animate-float" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-sm font-medium px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
              🚀 +10 000 apprenants nous font confiance
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            Apprenez les compétences de{" "}
            <span className="gradient-text">demain</span>,{" "}
            aujourd'hui
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
          >
            Des cours interactifs créés par des experts, avec des quiz, des certificats et un suivi de progression personnalisé.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Explorer les cours
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors">
              <Play className="w-4 h-4" />
              Voir la démo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { icon: BookOpen, value: "200+", label: "Cours" },
              { icon: Users, value: "10K+", label: "Apprenants" },
              { icon: Award, value: "95%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
