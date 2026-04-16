"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, BookCheck, TrendingUp, Activity, BookOpen, Target,
  User, Upload, Users, BarChart2, MessageSquare, ChevronRight,
} from "lucide-react";

const roles = [
  {
    id: "students", label: "For Students", icon: <GraduationCap size={26} />, color: "#2d7a35",
    summary: "Your personal academic progress dashboard.",
    details: [
      { icon: <TrendingUp size={16} />, text: "View grade progress charts across all 6 semesters" },
      { icon: <Activity size={16} />, text: "See your auto-calculated status: Improving, Stable, or Declining" },
      { icon: <BookOpen size={16} />, text: "Write semester reflections and set goals for next semester" },
      { icon: <Target size={16} />, text: "Receive teacher notes and personalized feedback" },
      { icon: <User size={16} />, text: "Manage your student profile and personal information" },
    ],
  },
  {
    id: "teachers", label: "For Teachers", icon: <BookCheck size={26} />, color: "#2a6e7a",
    summary: "Full class management and monitoring tools.",
    details: [
      { icon: <Upload size={16} />, text: "Upload grade data by class and semester via Excel or manual entry" },
      { icon: <Users size={16} />, text: "Monitor all students' progress from a single dashboard" },
      { icon: <BarChart2 size={16} />, text: "View individual student grade charts when needed" },
      { icon: <MessageSquare size={16} />, text: "Read student reflections and respond with guidance" },
      { icon: <User size={16} />, text: "Manage your teacher profile and class information" },
    ],
  },
];

const steps = [
  { n: "01", title: "Upload Grade Data", desc: "Teacher uploads semester grades for their class via an Excel file or by entering them manually in the system.", color: "#2d7a35" },
  { n: "02", title: "Auto-Calculate Averages", desc: "LearnTrack instantly calculates subject averages and plots them on a 6-semester line chart for clear visualization.", color: "#2a6e7a" },
  { n: "03", title: "Determine Progress Status", desc: "The system automatically labels each student's trend as Improving, Stable, or Declining based on real grade data.", color: "#6a5aad" },
  { n: "04", title: "Students View & Reflect", desc: "Students log in to view their charts, write semester reflections, and set clear goals for the next semester.", color: "#ad7a2d" },
  { n: "05", title: "Teachers Respond", desc: "Teachers review student reflections and add personalized notes, encouragement, and guidance to each student.", color: "#ad5a5a" },
];

export function AboutContent() {
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden py-18 px-12" style={{ background: "#2a7030" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-[20%] right-[10%] w-[280px] h-[280px] rounded-full bg-emerald-500/15 blur-[50px] pointer-events-none" />
        <motion.div
          className="max-w-[1200px] mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/12 border border-white/20 rounded-full px-4 py-1.5 pl-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-300" />
            <span className="text-white/90 text-[13px] font-semibold">About LearnTrack</span>
          </div>
          <h1 className="text-white text-[52px] font-black tracking-[-1.5px] leading-[1.05] mb-4 max-w-[640px]">
            Built to visualize every student&apos;s journey
          </h1>
          <p className="text-white/70 text-[17px] leading-relaxed max-w-[520px]">
            LearnTrack is a digital platform designed to monitor and visualize academic progress across every semester of a student&apos;s school life.
          </p>
        </motion.div>
      </div>

      <div className="bg-green-50/50 py-18">
        <div className="max-w-[1200px] mx-auto px-12">
          {/* Who It's For */}
          <div className="mb-18">
            <div className="mb-9">
              <div className="inline-block bg-green-50 text-green-700 rounded-full px-4 py-1 text-xs font-bold tracking-wider uppercase mb-3">
                Who It&apos;s For
              </div>
              <h2 className="text-4xl font-black text-gray-800 tracking-[-0.8px]">
                Click a role to explore
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((r) => (
                <div key={r.id}>
                  <div
                    className="bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      border: `2px solid ${activeRole === r.id ? r.color : "#cde5d2"}`,
                      boxShadow: activeRole === r.id ? `0 8px 28px ${r.color}20` : "none",
                    }}
                    onClick={() => setActiveRole((prev) => (prev === r.id ? null : r.id))}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-13 h-13 rounded-[14px] flex items-center justify-center shrink-0"
                        style={{ background: `${r.color}12`, color: r.color }}
                      >
                        {r.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-[17px] font-bold text-gray-800">{r.label}</div>
                        <div className="text-[13px] text-gray-500 mt-0.5">{r.summary}</div>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                        style={{
                          borderColor: activeRole === r.id ? r.color : "#cde5d2",
                          color: activeRole === r.id ? r.color : "#cde5d2",
                          transform: activeRole === r.id ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      >
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeRole === r.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="bg-white rounded-b-[14px] px-6 pb-6 pt-5 -mt-0.5"
                          style={{
                            border: `2px solid ${r.color}`,
                            borderTop: "none",
                            boxShadow: `0 10px 30px ${r.color}15`,
                          }}
                        >
                          <div className="w-7 h-[3px] rounded-sm mb-4" style={{ background: `${r.color}35` }} />
                          <div className="flex flex-col gap-3">
                            {r.details.map((d, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ background: `${r.color}12`, color: r.color }}
                                >
                                  {d.icon}
                                </div>
                                <span className="text-sm text-gray-500 leading-relaxed pt-1">
                                  {d.text}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-[13px] font-bold no-underline mt-5"
                            style={{ background: r.color }}
                          >
                            Get started <ChevronRight size={13} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <div className="mb-9">
              <div className="inline-block bg-green-50 text-green-700 rounded-full px-4 py-1 text-xs font-bold tracking-wider uppercase mb-3">
                How It Works
              </div>
              <h2 className="text-4xl font-black text-gray-800 tracking-[-0.8px]">
                Five simple steps
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {steps.map((s) => (
                <div key={s.n}>
                  <div
                    className="bg-white rounded-2xl p-5 flex items-center gap-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      border: `2px solid ${activeStep === s.n ? s.color : "#cde5d2"}`,
                      boxShadow: activeStep === s.n ? `0 6px 24px ${s.color}18` : "none",
                    }}
                    onClick={() => setActiveStep((prev) => (prev === s.n ? null : s.n))}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 transition-all duration-200"
                      style={{
                        background: activeStep === s.n ? s.color : `${s.color}12`,
                        color: activeStep === s.n ? "white" : s.color,
                      }}
                    >
                      {s.n}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-gray-800">{s.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Click to learn more</div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        borderColor: activeStep === s.n ? s.color : "#cde5d2",
                        color: activeStep === s.n ? s.color : "#cde5d2",
                        transform: activeStep === s.n ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      <ChevronRight size={13} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeStep === s.n && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="bg-white rounded-b-[14px] px-6 pb-6 pt-5 -mt-0.5"
                          style={{
                            border: `2px solid ${s.color}`,
                            borderTop: "none",
                            boxShadow: `0 8px 24px ${s.color}12`,
                          }}
                        >
                          <div className="w-7 h-[3px] rounded-sm mb-3.5" style={{ background: `${s.color}35` }} />
                          <p className="text-gray-500 text-sm leading-[1.75]">{s.desc}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
