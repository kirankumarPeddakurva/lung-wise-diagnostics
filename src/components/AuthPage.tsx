import { useState } from "react";
import { login, register } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Lung } from "lucide-react";

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isLogin) {
      const user = login(email, password);
      if (user) onAuth();
      else setError("Invalid email or password");
    } else {
      if (!name.trim()) { setError("Name is required"); return; }
      const user = register(name, email, password);
      if (user) onAuth();
      else setError("Email already registered");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 medical-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary-foreground"
              style={{
                width: Math.random() * 100 + 20,
                height: Math.random() * 100 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
              <Activity className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">LungAI Diagnostics</h1>
          <p className="text-lg opacity-90">
            AI-powered lung disease detection and drug discovery platform. Upload CT scans and get instant diagnostic insights.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <div className="text-2xl font-bold">3</div>
              <div className="opacity-80">Diseases</div>
            </div>
            <div className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <div className="text-2xl font-bold">9</div>
              <div className="opacity-80">Drugs</div>
            </div>
            <div className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
              <div className="text-2xl font-bold">3D</div>
              <div className="opacity-80">Molecules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-display text-foreground">LungAI</span>
          </div>

          <h2 className="text-3xl font-bold font-display text-foreground mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin ? "Sign in to access your diagnostic dashboard" : "Start your AI-powered diagnostic journey"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" required={!isLogin} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@hospital.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-12 text-base font-semibold">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-primary font-medium hover:underline">
              {isLogin ? "Register" : "Sign In"}
            </button>
          </p>

          {isLogin && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo: demo@lung.ai / demo123
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
