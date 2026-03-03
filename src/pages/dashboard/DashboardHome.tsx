import { useUserRole } from "@/hooks/useUserRole";
import StudentHome from "./student/StudentHome";
import InstructorHome from "./instructor/InstructorHome";
import AdminHome from "./admin/AdminHome";

const DashboardHome = () => {
  const { role } = useUserRole();

  if (role === "admin") return <AdminHome />;
  if (role === "instructor") return <InstructorHome />;
  return <StudentHome />;
};

export default DashboardHome;
