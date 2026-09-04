import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function AuthForm({ mode, redirect }: { mode: "signin" | "signup"; redirect: string }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) await signUp({ name, email, password });
      else await signIn({ email, password });
      await navigate({ to: redirect === "/signin" || redirect === "/signup" ? "/home" : (redirect as "/home") });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to authenticate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-aurora flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" aria-label="TrendGo home" className="mx-auto block w-fit">
          <Logo />
        </Link>
        <div className="mt-8 rounded-[2rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">{isSignup ? "Join the graph" : "Welcome back"}</p>
          <h1 className="font-display mt-3 text-3xl font-semibold text-foreground">{isSignup ? "Find your next good night" : "Pick up where you left off"}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{isSignup ? "Create your account and make discovery feel personal." : "Your people and your next plan are waiting."}</p>
          <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {isSignup ? <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-3"><UserRound className="size-4 text-primary-glow" /><input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label> : null}
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-3"><Mail className="size-4 text-primary-glow" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-3"><LockKeyhole className="size-4 text-primary-glow" /><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (8+ characters)" autoComplete={isSignup ? "new-password" : "current-password"} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
            {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" size="lg" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" /> : <ArrowRight />} {submitting ? "Working..." : isSignup ? "Create account" : "Sign in"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">{isSignup ? "Already have an account?" : "New to TrendGo?"}{" "}<Link to={isSignup ? "/signin" : "/signup"} search={{ redirect }} className="font-medium text-primary-glow hover:underline">{isSignup ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </div>
    </main>
  );
}
