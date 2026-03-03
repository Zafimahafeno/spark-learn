import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: number;
  amount_paid: number | null;
  status: string | null;
  payment_method: string | null;
  created_at: string;
  course: { title: string };
}

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payments")
      .select("id, amount_paid, status, payment_method, created_at, courses(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayments((data || []).map((p: any) => ({ ...p, course: p.courses })));
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const statusColor = (s: string | null) =>
    s === "completed" ? "default" : s === "refunded" ? "destructive" : "secondary";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Historique des paiements</h1>
      {payments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun paiement effectué.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.course.title}</TableCell>
                  <TableCell>{p.amount_paid != null ? `${p.amount_paid} €` : "—"}</TableCell>
                  <TableCell><Badge variant={statusColor(p.status)}>{p.status || "—"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default PaymentHistory;
