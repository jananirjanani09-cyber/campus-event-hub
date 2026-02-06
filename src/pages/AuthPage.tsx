import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-navy items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="h-10 w-10 text-accent" />
            <h1 className="text-3xl font-display font-bold">College Event Connect</h1>
          </div>
          <p className="text-lg opacity-80 leading-relaxed">
            Your one-stop platform for discovering, managing, and registering for college events. Stay connected with workshops, symposiums, cultural programs, and more.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">College Event Connect</h1>
          </div>

          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
              <CardDescription>{isLogin ? "Sign in to your account" : "Join as a student"}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLogin ? <LoginForm /> : <SignUpForm />}
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Signing in..." : "Sign In"}</Button>
    </form>
  );
}

function SignUpForm() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Please check your email to verify.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signupEmail">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="signupEmail" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signupPassword">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="signupPassword" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Creating account..." : "Sign Up"}</Button>
    </form>
  );
}
