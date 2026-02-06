import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { User, CalendarDays } from "lucide-react";

export default function StudentsView() {
  const [selectedStudent, setSelectedStudent] = useState<{ user_id: string; full_name: string; email: string } | null>(null);

  const { data: students, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: studentEvents } = useQuery({
    queryKey: ["student-events", selectedStudent?.user_id],
    enabled: !!selectedStudent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("user_id", selectedStudent!.user_id);
      if (error) throw error;
      return data;
    },
  });

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Registered Students</h1>
        <p className="text-muted-foreground">Click a student to see their registered events</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : students && students.length > 0 ? (
        <div className="grid gap-3">
          {students.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                className="glass-card cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedStudent({ user_id: s.user_id, full_name: s.full_name, email: s.email })}
              >
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{s.full_name || "Unnamed"}</p>
                    <p className="text-sm text-muted-foreground">{s.email}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">No students registered yet.</CardContent></Card>
      )}

      <Dialog open={!!selectedStudent} onOpenChange={(o) => !o && setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedStudent?.full_name || "Student"}'s Events</DialogTitle>
          </DialogHeader>
          {studentEvents && studentEvents.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {studentEvents.map((reg: any) => (
                <div key={reg.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CalendarDays className="h-4 w-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{reg.events?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {reg.events?.category} • {reg.events?.event_date ? new Date(reg.events.event_date).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No events registered.</p>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
