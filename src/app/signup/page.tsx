import { PublicNav } from "@/components/layout/public-nav";
import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <SignUpForm />
    </div>
  );
}
