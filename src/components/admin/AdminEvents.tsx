import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["workshop", "symposium", "cultural", "sports", "seminar", "hackathon", "other"];

interface EventForm {
  title: string;
  description: string;
  category: string;
  event_date: string;
  end_date: string;
  location: string;
  max_participants: string;
}

const emptyForm: EventForm = { title: "", description: "", category: "workshop", event_date: "", end_date: "", location: "", max_participants: "" };

export default function AdminEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (f: EventForm) => {
      const payload = {
        title: f.title,
        description: f.description,
        category: f.category,
        event_date: f.event_date,
        end_date: f.end_date || null,
        location: f.location,
        max_participants: f.max_participants ? parseInt(f.max_participants) : null,
        created_by: user?.id,
      };
      if (editId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events-count"] });
      toast.success(editId ? "Event updated!" : "Event created!");
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events-count"] });
      toast.success("Event deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (event: any) => {
    setEditId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      event_date: event.event_date?.slice(0, 16) ?? "",
      end_date: event.end_date?.slice(0, 16) ?? "",
      location: event.location,
      max_participants: event.max_participants?.toString() ?? "",
    });
    setOpen(true);
  };

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Events</h1>
          <p className="text-muted-foreground">Create and manage college events</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input type="datetime-local" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Participants (optional)</Label>
                <Input type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editId ? "Update Event" : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading events...</div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-4">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card">
                <CardContent className="pt-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground capitalize">{event.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(event.event_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location || "TBD"}</span>
                      {event.max_participants && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.max_participants} max</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="icon" onClick={() => openEdit(event)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(event.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground">No events yet. Click "New Event" to create one.</CardContent>
        </Card>
      )}
    </main>
  );
}
