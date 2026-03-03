import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useTheme } from "@/hooks/useTheme";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  BookOpen, LayoutDashboard, GraduationCap, Award, CreditCard,
  UserCircle, BarChart3, MessageSquare, FileQuestion, Users,
  FolderOpen, ShieldCheck, TrendingUp, Moon, Sun, LogOut, Home,
} from "lucide-react";

const studentLinks = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/my-courses", label: "Mes cours", icon: GraduationCap },
  { to: "/dashboard/certificates", label: "Certificats", icon: Award },
  { to: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profil", icon: UserCircle },
];

const instructorLinks = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/manage-courses", label: "Mes cours", icon: BookOpen },
  { to: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
  { to: "/dashboard/reviews", label: "Avis étudiants", icon: MessageSquare },
  { to: "/dashboard/quizzes", label: "Quiz", icon: FileQuestion },
  { to: "/dashboard/profile", label: "Profil", icon: UserCircle },
];

const adminLinks = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/users", label: "Utilisateurs", icon: Users },
  { to: "/dashboard/manage-categories", label: "Catégories", icon: FolderOpen },
  { to: "/dashboard/moderate-courses", label: "Modération cours", icon: ShieldCheck },
  { to: "/dashboard/global-stats", label: "Statistiques", icon: TrendingUp },
  { to: "/dashboard/profile", label: "Profil", icon: UserCircle },
];

function SidebarNav() {
  const { role } = useUserRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const links = role === "admin" ? adminLinks : role === "instructor" ? instructorLinks : studentLinks;
  const roleLabel = role === "admin" ? "Administration" : role === "instructor" ? "Instructeur" : "Étudiant";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {!collapsed && <span>Edu<span className="text-primary">Pulse</span></span>}
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed && roleLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.to} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, profile, signOut } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Bienvenue, {profile?.firstname || user?.email?.split("@")[0]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
