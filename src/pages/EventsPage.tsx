import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdminEvents from "@/components/admin/AdminEvents";

export default function EventsPage() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;
  return <AdminEvents />;
}
