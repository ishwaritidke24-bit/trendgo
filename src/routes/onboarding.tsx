import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getInterestCategories } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: loadingUser, updateInterests } = useAuth();
  const [categories, setCategories] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const loadCategories = React.useCallback(async () => {
    setLoadingCategories(true);
    setLoadError(null);
    try {
      setCategories(await getInterestCategories());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load interest categories. Please try again.",
      );
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    if (user) setSelected(user.interests);
  }, [user?.id]);

  function toggleInterest(interest: string) {
    setSaved(false);
    setSaveError(null);
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  async function saveInterests() {
    if (!selected.length) {
      setSaveError("Choose at least one interest to personalize your TrendGo.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await updateInterests(selected);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save your interests.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingUser) return <PageState title="Loading your TrendGo…" />;
  if (!user) {
    return (
      <PageState title="Sign in to choose your interests">
        <Button asChild className="mt-5">
          <Link to="/signin" search={{ redirect: "/onboarding" }}>
            Sign in
          </Link>
        </Button>
      </PageState>
    );
  }

  return (
    <main className="bg-aurora min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" aria-label="TrendGo home" className="mx-auto block w-fit">
          <Logo />
        </Link>
        <section className="mt-8 rounded-[2rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:p-9">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary-glow">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary-glow uppercase">
                Make it yours
              </p>
              <h1 className="font-display mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
                What are you into, {user.name.split(" ")[0]}?
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Pick the scenes you want more of. You can fine-tune this any time from your profile.
              </p>
            </div>
          </div>

          {loadingCategories ? (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-5 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin text-primary-glow" /> Loading interests…
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <p>{loadError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void loadCategories()}
              >
                <RefreshCw /> Try again
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3" aria-label="Interest categories">
              {categories.map((category) => {
                const isSelected = selected.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleInterest(category)}
                    disabled={saving || saved}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                      isSelected
                        ? "border-primary/35 bg-primary/15 text-primary-glow"
                        : "border-border bg-surface/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {isSelected ? <Check className="size-4" /> : null}
                    {category}
                  </button>
                );
              })}
            </div>
          )}

          {saveError ? (
            <p role="alert" className="mt-5 text-sm text-destructive">
              {saveError}
            </p>
          ) : null}
          {saved ? (
            <p role="status" className="mt-5 flex items-center gap-2 text-sm text-success">
              <Check className="size-4" /> Your interests are saved.
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selected.length ? `${selected.length} selected` : "Select at least one interest"}
            </p>
            {saved ? (
              <Button onClick={() => void navigate({ to: "/home" })}>
                Start exploring <ArrowRight />
              </Button>
            ) : (
              <Button
                onClick={() => void saveInterests()}
                disabled={saving || loadingCategories || !!loadError}
              >
                {saving ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                {saving ? "Saving…" : "Continue"}
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PageState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <main className="bg-aurora grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {children}
      </div>
    </main>
  );
}
