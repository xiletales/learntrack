"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { signIn } from "@/actions/auth";

export function LoginForm() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.set("role", role);
    formData.set("identifier", identifier);
    formData.set("password", password);

    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Crosshatch */}
      <div
        className="absolute inset-0 opacity-35 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#cde5d2 1px, transparent 1px), linear-gradient(90deg, #cde5d2 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[22px] border border-emerald-200 p-10 w-full max-w-[420px] shadow-lg relative z-10"
      >
        <div className="text-center mb-6">
          <Logo size={52} />
          <h2 className="text-[26px] font-extrabold text-green-900 mt-3 mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to your LearnTrack account
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-green-50 rounded-xl p-1 mb-5">
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError("");
              }}
              className={`flex-1 py-2 rounded-[9px] border-none cursor-pointer text-sm font-semibold transition-all duration-200 ${
                role === r
                  ? "bg-green-700 text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              {r === "student" ? "Student" : "Teacher"}
            </button>
          ))}
        </div>

        {/* ID Field */}
        <div className="mb-3.5">
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
            {role === "student" ? "NIS" : "Username"}
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-emerald-200 text-sm outline-none bg-white text-gray-800 font-[inherit] box-border focus:border-green-600"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={
              role === "student" ? "Enter your NIS" : "Enter your username"
            }
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              className="w-full px-3.5 py-2.5 pr-10 rounded-[10px] border-[1.5px] border-emerald-200 text-sm outline-none bg-white text-gray-800 font-[inherit] box-border focus:border-green-600"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 flex items-center p-0.5"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-400 px-3.5 py-2.5 rounded-[9px] text-[13px] mb-3.5 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-none bg-green-700 text-white text-[15px] font-bold cursor-pointer transition-all duration-200 hover:bg-green-800 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}{" "}
          {!loading && <ChevronRight size={16} />}
        </button>

        <div className="text-center mt-5 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-green-700 font-semibold no-underline hover:underline"
          >
            Sign up
          </Link>
        </div>

      </form>
    </div>
  );
}
