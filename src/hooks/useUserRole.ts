import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "student" | "instructor" | "admin";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase.rpc("get_user_role", { _user_id: user.id });
      setRole((data as AppRole) || "student");
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return { role, loading };
};
