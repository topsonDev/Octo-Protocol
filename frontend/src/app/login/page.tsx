import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Log in — Octo" };

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
