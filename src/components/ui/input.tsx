"use client";

import { cn } from "@/lib/utils";

interface InputProps {
  label?: string;
  value: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  as?: "input" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  name?: string;
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
  as = "input",
  options,
  required,
  name,
}: InputProps) {
  const baseClass = cn(
    "w-full px-3 py-2 rounded-lg border-[1.5px] border-emerald-200 text-sm outline-none font-[inherit] box-border",
    readOnly ? "bg-green-50/50" : "bg-white",
    "text-gray-800 focus:border-green-600"
  );

  return (
    <div className="mb-3.5">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      )}
      {as === "select" ? (
        <select
          className={baseClass}
          value={value}
          onChange={onChange}
          disabled={readOnly}
          name={name}
        >
          <option value="">-- Select --</option>
          {options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          className={cn(baseClass, "min-h-[90px] resize-y")}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          name={name}
        />
      ) : (
        <input
          className={baseClass}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          name={name}
        />
      )}
    </div>
  );
}
