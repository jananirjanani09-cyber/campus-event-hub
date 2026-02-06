import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["student-all-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date");
      if (error) throw error;
      return data;
    },
  });

  const { data: myRegistrations } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registrations").select("event_id").eq("user_id", user!.id);
      if (error) throw error;
      return new Set(data.map(r => r.event_id));
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("registrations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
        queryClient.invalidateQueries({ queryKey: ["registrations-count"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("registrations").insert({ user_id: user!.id, event_id: eventId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
      toast.success("Successfully registered!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("registrations").delete().eq("user_id", user!.id).eq("event_id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
      toast.success("Registration cancelled.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <main className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">Upcoming Events</h1>
        <p className="text-muted-foreground mb-8">Discover and register for college events</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading events...</div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => {
            const registered = myRegistrations?.has(event.id);
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="glass-card h-full flex flex-col">
                  <CardContent className="pt-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground capitalize font-medium">{event.category}</span>
                      {registered && <CheckCircle2 className="h-5 w-5 text-success" />}
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{event.description}</p>
                    <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.location || "TBD"}</div>
                      {event.max_participants && <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />{event.max_participants} spots</div>}
                    </div>
                    {registered ? (
                      <Button variant="outline" className="w-full" onClick={() => unregisterMutation.mutate(event.id)} disabled={unregisterMutation.isPending}>
                        Cancel Registration
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => registerMutation.mutate(event.id)} disabled={registerMutation.isPending}>
                        Register Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">No upcoming events at the moment.</CardContent></Card>
      )}
    </main>
  );
}
