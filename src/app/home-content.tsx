"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Activity, BookOpen, Users, BarChart2, Award, ChevronRight,
} from "lucide-react";
import { AnimatedStats } from "@/components/ui/animated-counter";

const features = [
  { id: "track", icon: <TrendingUp size={26} />, title: "Track Progress", desc: "Visualize learning growth across all 6 semesters with beautiful grade charts that show exactly where you stand.", color: "#2d7a35" },
  { id: "status", icon: <Activity size={26} />, title: "Smart Status", desc: "LearnTrack automatically determines if a student is Improving, Stable, or Declining based on real grade data.", color: "#2a6e7a" },
  { id: "reflect", icon: <BookOpen size={26} />, title: "Reflections", desc: "Students write semester reflections and set goals. Teachers respond with personalized guidance and encouragement.", color: "#6a5aad" },
  { id: "class", icon: <Users size={26} />, title: "Class Management", desc: "Teachers upload grade data by class and semester, monitor all students, and manage the whole class from one place.", color: "#ad5a5a" },
  { id: "analytics", icon: <BarChart2 size={26} />, title: "Visual Analytics", desc: "Rich, interactive charts transform raw grade numbers into clear visual stories about every student's journey.", color: "#7a6a2d" },
  { id: "achieve", icon: <Award size={26} />, title: "Achievement Focus", desc: "Set clear targets each semester and celebrate milestones that keep students motivated and on track to succeed.", color: "#2d6a7a" },
];

export function HomeContent() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const toggleFeature = (id: string) =>
    setActiveFeature((prev) => (prev === id ? null : id));

  return (
    <>
      {/* Hero */}
      <div
        className="min-h-[92vh] flex items-center relative overflow-hidden"
        style={{ background: "#2a7030" }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "20px 20px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-[10%] right-[8%] w-[340px] h-[340px] rounded-full bg-emerald-500/20 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[25%] w-[200px] h-[200px] rounded-full bg-emerald-300/10 blur-[40px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-12 py-20 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/12 border border-white/20 rounded-full px-4 py-1.5 pl-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-300" />
              <span className="text-white/90 text-[13px] font-semibold tracking-wide">
                Academic Progress Visualization Platform
              </span>
            </div>

            <h1 className="text-white text-[64px] font-black leading-[1.05] mb-2.5 tracking-[-2px] max-w-[700px]">
              Track Every Step of Your
            </h1>
            <h1 className="text-emerald-300 text-[64px] font-black leading-[1.05] mb-7 tracking-[-2px]">
              Learning Journey
            </h1>

            <p className="text-white/70 text-lg leading-relaxed max-w-[520px] mb-11">
              LearnTrack helps students visualize their academic progress across
              all semesters, identify growth patterns, and reflect on their
              learning journey.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-green-700 text-[15px] font-bold no-underline hover:scale-[1.02] transition-transform"
              >
                Get Started <ChevronRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/40 text-white text-[15px] font-bold no-underline hover:border-white/70 transition-all"
              >
                Learn More
              </Link>
            </div>

            <div className="border-t border-white/15 my-13 max-w-[860px]" />
            <AnimatedStats />
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-green-50/50 py-20">
        <div className="max-w-[1200px] mx-auto px-12">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-green-50 text-green-700 rounded-full px-4 py-1 text-xs font-bold tracking-wider uppercase mb-3.5">
              Features
            </div>
            <h2 className="text-[40px] font-black text-gray-800 mb-3 tracking-[-1px]">
              Everything You Need
            </h2>
            <p className="text-gray-500 text-base max-w-[480px]">
              Click any feature to learn more about how LearnTrack works for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div
                  className="bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    border: `2px solid ${activeFeature === f.id ? f.color : "#cde5d2"}`,
                    boxShadow: activeFeature === f.id ? `0 8px 32px ${f.color}22` : "none",
                  }}
                  onClick={() => toggleFeature(f.id)}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${f.color}15`, color: f.color }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-gray-800">{f.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Click to explore</div>
                    </div>
                    <div
                      className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-200"
                      style={{
                        borderColor: activeFeature === f.id ? f.color : "#cde5d2",
                        color: activeFeature === f.id ? f.color : "#cde5d2",
                        transform: activeFeature === f.id ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {activeFeature === f.id && (
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
                          border: `2px solid ${f.color}`,
                          borderTop: "none",
                          boxShadow: `0 8px 32px ${f.color}18`,
                        }}
                      >
                        <div
                          className="w-8 h-[3px] rounded-sm mb-3.5"
                          style={{ background: `${f.color}40` }}
                        />
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                          {f.desc}
                        </p>
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] font-bold no-underline"
                          style={{ background: f.color }}
                        >
                          Try it now <ChevronRight size={13} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="relative overflow-hidden py-20 px-12 text-center"
        style={{ background: "#2a7030" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          className="relative z-10 max-w-[560px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-white text-[40px] font-black tracking-[-1px] mb-3.5">
            Ready to Start Tracking?
          </h2>
          <p className="text-white/70 text-base mb-9 leading-relaxed">
            Join students and teachers already using LearnTrack to visualize
            academic growth.
          </p>
          <Link
            href="/login"
            className="inline-block px-9 py-3.5 rounded-full bg-white text-green-700 text-[15px] font-bold no-underline hover:scale-[1.02] transition-transform"
          >
            Login Now
          </Link>
        </motion.div>
      </div>
    </>
  );
}
