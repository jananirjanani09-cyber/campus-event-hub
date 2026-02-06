import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: events } = useQuery({
    queryKey: ["events-count"],
    queryFn: async () => {
      const { count } = await supabase.from("events").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: registrations } = useQuery({
    queryKey: ["registrations-count"],
    queryFn: async () => {
      const { count } = await supabase.from("registrations").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: recentEvents } = useQuery({
    queryKey: ["recent-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const stats = [
    { label: "Total Events", value: events ?? 0, icon: CalendarDays, color: "text-primary" },
    { label: "Registrations", value: registrations ?? 0, icon: ClipboardList, color: "text-accent" },
    { label: "Students", value: students ?? 0, icon: Users, color: "text-success" },
  ];

  return (
    <main className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Overview of your college events platform</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.category} • {new Date(event.event_date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{event.location}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No events yet. Create your first event!</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
