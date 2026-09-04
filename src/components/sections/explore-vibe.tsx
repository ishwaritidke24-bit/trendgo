import { Coffee, GraduationCap, Moon, Sun, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";

const VIBES: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: "Chill", hint: "Slow, easy, low-key", icon: Coffee },
  { label: "High Energy", hint: "Loud rooms, big crowds", icon: Zap },
  { label: "Meet People", hint: "Social by design", icon: Users },
  { label: "Learn Something", hint: "Hands-on sessions", icon: GraduationCap },
  { label: "Weekend Plans", hint: "Sat & Sun picks", icon: Sun },
  { label: "Late Night", hint: "After 10pm only", icon: Moon },
];

export function ExploreByVibe() {
  return (
    <Section spacing="sm">
      <Container>
        <SectionHeading
          eyebrow="Mood first"
          title="Explore by vibe"
          description="Skip the categories. Pick how you want the night to feel."
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {VIBES.map(({ label, hint, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 text-left transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
            >
              <span className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-surface)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative grid size-10 place-items-center rounded-xl bg-primary/12 text-primary-glow transition-colors duration-300 group-hover:bg-primary/22 [&_svg]:size-5">
                <Icon />
              </span>
              <span className="relative mt-3 block text-sm font-semibold text-foreground">
                {label}
              </span>
              <span className="relative mt-1 block text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>
      </Container>
    </Section>
  );
}
