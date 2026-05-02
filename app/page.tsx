"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Scissors,
  Volume2,
  ListFilter,
  Cpu,
  Zap,
  ArrowRight,
  Monitor,
} from "lucide-react";
import { SiLinux, SiApple } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { FaMicrosoft } from "react-icons/fa";
import Link from "next/link";
import { PwywDialog } from "@/components/pwyw-dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 } as const,
  },
};

export default function Home() {
  const [platform, setPlatform] = React.useState<
    "Windows" | "macOS" | "Linux" | "Desktop"
  >("Desktop");
  const [pwywOpen, setPwywOpen] = React.useState(false);

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("win") !== -1) setPlatform("Windows");
    else if (userAgent.indexOf("mac") !== -1) setPlatform("macOS");
    else if (userAgent.indexOf("linux") !== -1) setPlatform("Linux");
  }, []);

  const PlatformIcon =
    platform === "macOS"
      ? SiApple
      : platform === "Linux"
        ? SiLinux
        : platform === "Windows"
          ? FaMicrosoft
          : Monitor;

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-zinc-400 selection:bg-primary selection:text-primary-foreground font-sans antialiased">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      {/* Background Grid */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <header className="fixed top-8 left-0 right-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tighter text-white uppercase">
              Sonixy
            </span>
          </div>
          <nav className="flex items-center gap-6 text-[10px] font-mono tracking-widest uppercase">
            <a
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="https://codeberg.org/sker/sonixy"
              className="hover:text-primary transition-colors"
            >
              Source
            </a>
            <Button
              size="sm"
              onClick={() => setPwywOpen(true)}
              className="h-7 rounded-none px-3 text-[10px] font-mono bg-white text-black hover:bg-primary"
            >
              Download
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col items-start"
            >
              <motion.h1
                variants={itemVariants}
                className="font-heading text-6xl font-black tracking-tighter text-white sm:text-8xl md:text-9xl leading-[0.85] mb-8"
              >
                FIND <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                  YOUR CLIPS
                </span>
              </motion.h1>

              <motion.div
                variants={itemVariants}
                className="max-w-xl border-l-2 border-primary/20 pl-6 mb-12"
              >
                <p className="text-lg md:text-xl text-zinc-300 font-medium leading-relaxed italic">
                  Organize, preview, and drag samples directly into your
                  timeline.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => setPwywOpen(true)}
                  className="h-14 rounded-none px-8 text-sm font-mono uppercase tracking-widest bg-primary text-black hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                >
                  <PlatformIcon className="mr-3 size-5" />
                  Get Sonixy for {platform}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="py-24 border-t border-white/5 bg-[#080808]"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 uppercase italic leading-none">
                  Clip & Drag <br />{" "}
                  <span className="text-primary opacity-50">Zero Export</span>
                </h2>

                <div className="space-y-12">
                  {[
                    {
                      icon: Scissors,
                      title: "Destructive-Free Clipping",
                      desc: "Select a region on the waveform and drag it. Sonixy creates a high-quality temporary wav instantly.",
                    },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="size-12 shrink-0 border border-white/10 flex items-center justify-center bg-white/5">
                        <f.icon className="size-6 text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
                          {f.title}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 relative">
                <div className="absolute -inset-4 border border-primary/20 pointer-events-none opacity-50" />
                <div className="relative aspect-[16/10] bg-black border border-white/10 overflow-hidden shadow-2xl">
                  <Image
                    src="/crop-vid.webp"
                    alt="Workflow Demo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-20">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                High-Speed Engine
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
              {[
                {
                  title: "Instant Indexing",
                  desc: "Scan 100k+ files in seconds. Indexing ensures your library is always searchable.",
                  icon: Zap,
                },
                {
                  title: "Auto-Normalize",
                  desc: "Consistent monitoring levels. Smart gain calculation on preview prevents ear fatigue.",
                  icon: Volume2,
                },
                {
                  title: "Meta Filtering",
                  desc: "Search by sample rate, bit depth, or custom tags.",
                  icon: ListFilter,
                },
                {
                  title: "Concurrent Processing",
                  desc: "Task processing happens on multiple threads. High speeds and no lag.",
                  icon: Cpu,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-[#050505] p-8 hover:bg-[#0a0a0a] transition-colors group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-primary transition-all">
                    <f.icon className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-tighter group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-24 border-t border-white/5 bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
          <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic mb-12 leading-none">
              FIND YOUR ASSETS <br />{" "}
              <span className="text-primary">EASILY.</span>
            </h2>
            <div className="flex flex-col items-center gap-8">
              <Button
                size="lg"
                onClick={() => setPwywOpen(true)}
                className="h-16 rounded-none px-12 text-sm font-mono uppercase tracking-[0.2em] bg-white text-black hover:bg-primary transition-all shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none"
              >
                Download Now <ArrowRight className="ml-3 size-5" />
              </Button>

              <div className="flex gap-12 font-mono text-[10px] tracking-widest uppercase text-zinc-400">
                <div className="flex gap-2">
                  <a
                    href="https://codeberg.org/sker/sonixy"
                    className="hover:text-white transition-colors underline decoration-primary/30"
                  >
                    Source Code
                  </a>
                  <a
                    href="https://github.com/devsker/sonixy-mirror"
                    className="hover:text-white transition-colors underline decoration-primary/30"
                  >
                    (mirror)
                  </a>
                </div>
                <span>Build 0.2.1</span>
              </div>
            </div>
            <br />
            <a
              href="https://sker.codeberg.page"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              by sker
            </a>
          </div>
        </footer>
      </main>

      <PwywDialog platform={platform} open={pwywOpen} onOpenChange={setPwywOpen} />
    </div>
  );
}
