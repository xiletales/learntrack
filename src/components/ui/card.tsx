import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[14px] border border-emerald-200 px-6 py-5",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-[14px] border border-emerald-200 px-5 py-4 flex items-center gap-3.5">
      <div className="w-[46px] h-[46px] rounded-xl bg-green-50 flex items-center justify-center text-green-700">
        {icon}
      </div>
      <div>
        <div className="text-[22px] font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}
