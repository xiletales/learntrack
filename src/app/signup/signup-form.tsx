"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { classOptions } from "@/lib/constants";
import { signUp } from "@/actions/signup";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    gender: "",
    school: "",
    nip: "",
    jurusan: "",
    class_handled: "",
    phone: "",
    email: "",
  });

  const f = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("role", "teacher");
    formData.set("name", form.name);
    formData.set("password", form.password);
    formData.set("gender", form.gender);
    formData.set("school", form.school);
    formData.set("school_year", "");
    formData.set("nip", form.nip);
    formData.set("email", form.email);
    formData.set("jurusan", form.jurusan);
    formData.set("subject", "");
    formData.set("class_handled", form.class_handled);
    formData.set("phone", form.phone);

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
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
        className="bg-white rounded-[22px] border border-emerald-200 p-10 w-full max-w-[520px] shadow-lg relative z-10"
      >
        <div className="text-center mb-6">
          <Logo size={52} />
          <h2 className="text-[26px] font-extrabold text-green-900 mt-3 mb-1">
            Teacher Registration
          </h2>
          <p className="text-gray-500 text-sm">
            Create your teacher account to start managing students
          </p>
        </div>

        <Input
          label="Full Name"
          value={form.name}
          onChange={f("name")}
          placeholder="Enter your full name"
          required
        />

        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="NIP"
            value={form.nip}
            onChange={f("nip")}
            placeholder="National Teacher ID"
            required
          />
          <Input
            label="Email"
            value={form.email}
            onChange={f("email")}
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="Gender"
            value={form.gender}
            onChange={f("gender")}
            as="select"
            options={["Male", "Female"]}
          />
          <Input
            label="Major"
            value={form.jurusan}
            onChange={f("jurusan")}
            as="select"
            options={["MIPA", "IPS"]}
            required
          />
        </div>

        <Input
          label="Class Handled"
          value={form.class_handled}
          onChange={f("class_handled")}
          as="select"
          options={classOptions}
        />

        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="School"
            value={form.school}
            onChange={f("school")}
            placeholder="e.g. SMA Negeri 1 Sragen"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={f("phone")}
            placeholder="081234567890"
          />
        </div>

        {/* Password */}
        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              className="w-full px-3.5 py-2.5 pr-10 rounded-[10px] border-[1.5px] border-emerald-200 text-sm outline-none bg-white text-gray-800 font-[inherit] box-border focus:border-green-600"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={f("password")}
              placeholder="Min. 6 characters"
              required
              minLength={6}
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

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Confirm Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              className="w-full px-3.5 py-2.5 pr-10 rounded-[10px] border-[1.5px] border-emerald-200 text-sm outline-none bg-white text-gray-800 font-[inherit] box-border focus:border-green-600"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={f("confirmPassword")}
              placeholder="Re-enter your password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 flex items-center p-0.5"
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-4 flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-green-700 cursor-pointer"
          />
          <label className="text-sm text-gray-500 cursor-pointer" onClick={() => setAgreed((p) => !p)}>
            I agree to the{" "}
            <span className="text-green-700 font-semibold">Terms and Conditions</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-400 px-3.5 py-2.5 rounded-[9px] text-[13px] mb-3.5 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !agreed}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-none bg-green-700 text-white text-[15px] font-bold cursor-pointer transition-all duration-200 hover:bg-green-800 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}{" "}
          {!loading && <ChevronRight size={16} />}
        </button>

        <div className="text-center mt-5 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-green-700 font-semibold no-underline hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
