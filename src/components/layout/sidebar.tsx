"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Activity, BookOpen, User, Users,
  Upload, MessageSquare, LogOut, Menu, ChevronRight, UserPlus,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Modal } from "@/components/ui/modal";
import { signOut } from "@/actions/auth";
import type { Role } from "@/lib/types";

const studentMenu = [
  { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/student/grades", label: "Grade Progress", icon: <TrendingUp size={18} /> },
  { href: "/student/status", label: "Learning Status", icon: <Activity size={18} /> },
  { href: "/student/reflections", label: "Reflections", icon: <BookOpen size={18} /> },
  { href: "/student/profile", label: "My Profile", icon: <User size={18} /> },
];

const teacherMenu = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/teacher/students", label: "Student Data", icon: <Users size={18} /> },
  { href: "/teacher/add-students", label: "Add Students", icon: <UserPlus size={18} /> },
  { href: "/teacher/upload", label: "Upload Grades", icon: <Upload size={18} /> },
  { href: "/teacher/reflections", label: "Reflections", icon: <MessageSquare size={18} /> },
  { href: "/teacher/profile", label: "My Profile", icon: <User size={18} /> },
];

interface SidebarProps {
  role: Role;
  userName: string;
  userSubtitle: string;
  photoUrl: string | null;
}

export function Sidebar({ role, userName, userSubtitle, photoUrl }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();

  const items = role === "student" ? studentMenu : teacherMenu;

  return (
    <>
      <div
        className="fixed left-0 top-0 z-50 flex flex-col min-h-screen transition-all duration-300"
        style={{
          width: collapsed ? 64 : 230,
          background: "#1a4d1f",
        }}
      >
        {/* Logo */}
        <div className="px-3.5 py-4 flex items-center gap-2.5 border-b border-white/[0.08]">
          <Logo size={36} />
          {!collapsed && (
            <span className="text-white text-lg font-extrabold tracking-tight">
              LearnTrack
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto bg-transparent border-none text-white/60 cursor-pointer p-1"
          >
            {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* User */}
        {!collapsed && (
          <div className="px-4 py-3.5 border-b border-white/[0.08] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-[13px] font-semibold truncate">
                {userName}
              </div>
              <div className="text-emerald-300 text-[11px]">{userSubtitle}</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-2.5 rounded-[10px] mb-0.5 no-underline transition-all duration-150 ${
                  collapsed ? "px-3.5 py-2.5" : "px-3 py-2.5"
                } ${
                  active
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/65 hover:bg-white/10"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={`shrink-0 flex items-center ${
                    active ? "text-emerald-300" : "text-white/55"
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-[13px]">{item.label}</span>
                )}
                {!collapsed && active && (
                  <ChevronRight size={13} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/[0.08]">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-2.5 rounded-[10px] bg-transparent border-none cursor-pointer text-white/55 text-[13px] px-3 py-2.5 hover:bg-white/10 transition-all"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div
        className="shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 64 : 230 }}
      />

      {/* Logout Modal */}
      <Modal open={showLogout} onClose={() => setShowLogout(false)}>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <LogOut size={26} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sign Out</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">
          Are you sure you want to sign out of your LearnTrack account?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogout(false)}
            className="flex-1 py-2.5 rounded-[10px] border-[1.5px] border-emerald-200 bg-white text-gray-500 text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <form action={signOut} className="flex-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-[10px] border-none bg-red-400 text-white text-sm font-semibold cursor-pointer hover:bg-red-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
