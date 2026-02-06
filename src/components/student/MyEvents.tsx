import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function MyEvents() {
  const { user } = useAuth();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-registered-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("user_id", user!.id)
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <main className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">My Events</h1>
        <p className="text-muted-foreground mb-8">Events you've registered for</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : registrations && registrations.length > 0 ? (
        <div className="grid gap-4">
          {registrations.map((reg: any, i: number) => (
            <motion.div key={reg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{reg.events?.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{reg.events?.event_date ? new Date(reg.events.event_date).toLocaleDateString() : ""}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{reg.events?.location || "TBD"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground capitalize">{reg.events?.category}</span>
                    <p className="text-xs text-muted-foreground mt-1">Registered {new Date(reg.registered_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">You haven't registered for any events yet.</CardContent></Card>
      )}
    </main>
  );
}
