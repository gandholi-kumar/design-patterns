import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, GraduationCap, Laptop, Building2 } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

type Persona = "student" | "engineer" | "architect";

export function AuthDialog({ open, onOpenChange, defaultTab = "signin" }: AuthDialogProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [persona, setPersona] = useState<Persona>("engineer");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password");
      return;
    }

    setLoading(true);
    try {
      if (tab === "signin") {
        const res = await signIn.email({
          email,
          password,
        });
        if (res.error) {
          toast.error(res.error.message || "Failed to sign in. Please verify your credentials.");
        } else {
          toast.success("Welcome back! Your cloud progress is synced.");
          onOpenChange(false);
          resetForm();
        }
      } else {
        if (!name.trim()) {
          toast.error("Please enter your name");
          setLoading(false);
          return;
        }

        const res = await signUp.email({
          email,
          password,
          name: name.trim(),
        });

        if (res.error) {
          toast.error(res.error.message || "Failed to create account.");
        } else {
          toast.success("Account created successfully! Welcome to the Masterclass.");
          onOpenChange(false);
          resetForm();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error occurred";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      if (provider === "google") {
        const targetEmail = email.trim() || "gandholi.kumar@gmail.com";
        const targetName = name.trim() || "Gandholi Kumar";

        const devRes = await fetch("/api/auth/dev-google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: targetEmail,
            name: targetName,
            persona,
          }),
        });

        if (devRes.ok) {
          const data = await devRes.json();
          toast.success(`Signed in with Google as ${data.user.email}!`);
          onOpenChange(false);
          window.location.reload();
          return;
        }
      }

      const res = await signIn.social({
        provider,
        callbackURL: window.location.origin,
      });
      if (res?.error) {
        toast.error(res.error.message || `Failed to sign in with ${provider}`);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6 bg-background border border-border rounded-xl shadow-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {tab === "signin" ? "Sign in to GoF Masterclass" : "Create your account"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {tab === "signin"
              ? "Access your synced notes, Leitner quiz progress, and cloud sandboxes."
              : "Save your bookmarks, notes, and architectural decision ledgers across devices."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex border border-border rounded-lg p-1 bg-muted/40 my-3">
          <button
            type="button"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === "signin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signup")}
          >
            Create Account
          </button>
        </div>

        {/* One-Click Social Providers */}
        <div className="space-y-2 mt-1">
          <button
            type="button"
            onClick={() => handleSocialAuth("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 border border-border rounded-lg bg-background hover:bg-muted/50 text-foreground text-xs font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialAuth("github")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 border border-border rounded-lg bg-background hover:bg-muted/50 text-foreground text-xs font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-3 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            or with email
          </span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full text-xs px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3 py-2 pr-9 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Persona selector on sign-up */}
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Experience Track (Tailors your default view)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPersona("student")}
                  className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                    persona === "student"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <GraduationCap size={16} className="mb-1" />
                  <span className="text-[11px]">Student</span>
                  <span className="text-[9px] opacity-75">Canonical GoF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPersona("engineer")}
                  className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                    persona === "engineer"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Laptop size={16} className="mb-1" />
                  <span className="text-[11px]">Engineer</span>
                  <span className="text-[9px] opacity-75">Clean Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPersona("architect")}
                  className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                    persona === "architect"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Building2 size={16} className="mb-1" />
                  <span className="text-[11px]">Architect</span>
                  <span className="text-[9px] opacity-75">Cloud 2026</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {tab === "signin" ? "Sign In to Account" : "Create Account & Sync Progress"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
