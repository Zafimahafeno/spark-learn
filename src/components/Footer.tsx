import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="border-t border-border/20 glass-dark relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] orb-red blur-[120px] opacity-10" />

      <div className="container mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <motion.div
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </motion.div>
              <span className="font-heading text-lg font-bold">Tsirionantsoa<span className="gradient-text">School</span></span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La plateforme d'apprentissage en ligne qui propulse votre carrière.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-foreground">Plateforme</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary transition-colors">Tous les cours</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Catégories</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Instructeurs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Centre d'aide</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-foreground">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/20 text-center text-sm text-muted-foreground">
          © 2026 TsirionantsoaSchool. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
