import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import MyEvents from "@/components/student/MyEvents";

export default function MyEventsPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <MyEvents />;
}
