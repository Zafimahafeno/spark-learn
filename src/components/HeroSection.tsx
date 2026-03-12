import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, BookOpen, Users, Award, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{ left: x, top: y, width: size, height: size, background: `hsl(0 85% 55% / ${size > 4 ? 0.15 : 0.3})` }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.3, 1],
    }}
    transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const AnimatedCounter = ({ target, label }: { target: string; label: string }) => {
  const [count, setCount] = useState(0);
  const numericTarget = parseInt(target.replace(/\D/g, ""));

  useEffect(() => {
    let start = 0;
    const increment = numericTarget / 40;
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [numericTarget]);

  const suffix = target.replace(/[0-9]/g, "");

  return (
    <div className="text-center">
      <p className="font-heading text-3xl font-bold text-foreground">
        {count}{suffix}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden pt-16">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-10 -left-32 w-[500px] h-[500px] rounded-full orb-red blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 -right-32 w-[600px] h-[600px] rounded-full orb-dark blur-[100px]"
        animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(0 85% 55% / 0.08), transparent 70%)" }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {[
        { delay: 0, x: "10%", y: "20%", size: 4 },
        { delay: 1, x: "80%", y: "15%", size: 6 },
        { delay: 2, x: "60%", y: "70%", size: 3 },
        { delay: 0.5, x: "25%", y: "80%", size: 5 },
        { delay: 1.5, x: "90%", y: "50%", size: 4 },
        { delay: 3, x: "45%", y: "10%", size: 3 },
        { delay: 2.5, x: "15%", y: "55%", size: 5 },
        { delay: 0.8, x: "70%", y: "85%", size: 4 },
      ].map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Grid lines overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full glass-red border-glow mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>🚀 +10 000 apprenants nous font confiance</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Apprenez les compétences de{" "}
            <motion.span
              className="gradient-text relative"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              demain
            </motion.span>
            ,{" "}
            <br className="hidden sm:block" />
            aujourd'hui
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Des cours interactifs créés par des experts, avec des quiz, des certificats et un suivi de progression personnalisé.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/courses">
              <motion.div
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px -5px hsl(0 85% 55% / 0.5)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="absolute inset-0 shimmer" />
                <span className="relative z-10 flex items-center gap-2">
                  Explorer les cours
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
              </motion.div>
            </Link>

            <motion.button
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass-card border-glow font-semibold text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-5 h-5 text-primary" />
              </motion.div>
              Voir la démo
            </motion.button>
          </motion.div>

          {/* Stats with glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { icon: BookOpen, value: "200+", label: "Cours" },
              { icon: Users, value: "10000+", label: "Apprenants" },
              { icon: Award, value: "95+", label: "% Satisfaction" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card p-4 border-glow relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // @ts-ignore
                transitionDelay={`${0.8 + i * 0.1}s`}
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <AnimatedCounter target={stat.value} label={stat.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
