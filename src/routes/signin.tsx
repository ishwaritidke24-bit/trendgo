import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth/auth-form";

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : "/home",
  }),
  component: SigninPage,
});

function SigninPage() {
  const { redirect } = Route.useSearch();
  return <AuthForm mode="signin" redirect={redirect} />;
}
