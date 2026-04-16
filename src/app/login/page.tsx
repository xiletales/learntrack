import { PublicNav } from "@/components/layout/public-nav";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <LoginForm />
    </div>
  );
}
