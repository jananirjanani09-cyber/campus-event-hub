import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, CalendarDays, Users, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = role === "admin";
  const navItems = isAdmin
    ? [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/events", label: "Events", icon: CalendarDays },
        { to: "/students", label: "Students", icon: Users },
      ]
    : [
        { to: "/", label: "Events", icon: CalendarDays },
        { to: "/my-events", label: "My Events", icon: CalendarDays },
      ];

  return (
    <header className="gradient-navy sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-accent" />
          <span className="font-display font-bold text-lg text-primary-foreground hidden sm:inline">College Event Connect</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? "secondary" : "ghost"}
                size="sm"
                className={location.pathname === to ? "" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 ml-2">
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
