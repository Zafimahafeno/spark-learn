import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedCourses />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-bold mb-4">
                Prêt à commencer votre voyage ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Rejoignez des milliers d'apprenants et développez vos compétences dès maintenant.
              </p>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Créer un compte gratuitement
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
