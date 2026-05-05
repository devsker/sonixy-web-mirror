"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import {
  Scissors,
  Volume2,
  ListFilter,
  Zap,
  LayoutGrid,
  Code2,
  Download,
} from "lucide-react";
import { SiLinux, SiApple } from "react-icons/si";
import { FaMicrosoft } from "react-icons/fa";
import { Monitor } from "lucide-react";
import { PwywDialog } from "@/components/pwyw-dialog";
import BlurEffect from "react-progressive-blur";

// ─── Scroll-feature sub-components ──────────────────────────────────────────

const PHASES = [
  {
    headline: ["Select. Drag.", "Done."],
    body: "No exports. No renders. Select any region on the waveform and drop it straight into your timeline.",
    image: "/clipping.webp",
  },
  {
    headline: ["100,000 files", "blazing fast."],
    body: "Multi-threaded scanning keeps your entire library indexed and searchable the moment you launch.",
    image: "/indexing.webp",
  },
  {
    headline: ["Find by", "anything."],
    body: "Filter by sample rate, bit depth, BPM, key, or custom tags. Instantly.",
    image: "/filter.webp",
  },
] as const;

function PhaseSlide({
  progress,
  range,
  headline,
  body,
  image,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  headline: readonly [string, string];
  body: string;
  image: string;
}) {
  const [s, e] = range;
  const pad = (e - s) * 0.18;
  const isFirst = s === 0;

  const opacity = useTransform(
    progress,
    isFirst ? [e - pad, e] : [s, s + pad, e - pad, e],
    isFirst ? [1, 0] : [0, 1, 1, 0]
  );
  const y = useTransform(progress, [s, s + pad * 2], [isFirst ? 0 : 36, 0]);
  const imgScale = useTransform(progress, [s, s + pad * 2], [isFirst ? 1 : 1.05, 1]);
  const imgOpacity = useTransform(
    progress,
    isFirst ? [e - pad, e] : [s, s + pad, e - pad, e],
    isFirst ? [1, 0] : [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center pointer-events-none"
    >
      <div className="max-w-[1400px] mx-auto w-full px-8 md:px-16 grid md:grid-cols-[0.8fr_1.2fr] gap-16 md:gap-24 items-center">
        <motion.div style={{ y }} className="flex flex-col">
          <h2 className="text-5xl md:text-[62px] font-bold tracking-tight leading-[1.05] mb-7 text-white">
            {headline[0]}
            <br />
            {headline[1]}
          </h2>
          <p className="text-[17px] text-white/40 leading-relaxed max-w-sm">
            {body}
          </p>
        </motion.div>

        <motion.div
          style={{ scale: imgScale, opacity: imgOpacity }}
          className="relative aspect-[16/10] rounded-sm overflow-hidden"
        >
          <Image src={image} alt={body} fill className="object-cover" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProgressDot({
  progress,
  range,
}: {
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const [s, e] = range;
  const scaleY = useTransform(progress, [s, s + (e - s) * 0.3, e - (e - s) * 0.3, e], [0.2, 1, 1, 0.2]);
  const opacity = useTransform(progress, [s, s + (e - s) * 0.2, e - (e - s) * 0.2, e], [0.25, 1, 1, 0.25]);

  return (
    <div className="relative w-[3px] h-5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 top-0 bottom-0 bg-white rounded-full origin-top"
        style={{ scaleY, opacity }}
      />
    </div>
  );
}

function ScrollFeatures() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress: raw } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Light spring smooths trackpad inertia without adding noticeable lag
  const progress = useSpring(raw, { stiffness: 180, damping: 28, restDelta: 0.001 });
  const n = PHASES.length;

  return (
    <div ref={ref} style={{ height: `${n * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Progress dots — right edge */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-[6px]">
          {PHASES.map((_, i) => (
            <ProgressDot
              key={i}
              progress={progress}
              range={[i / n, (i + 1) / n]}
            />
          ))}
        </div>

        {/* Phase slides */}
        {PHASES.map((phase, i) => (
          <PhaseSlide
            key={i}
            progress={progress}
            range={[i / n, (i + 1) / n]}
            {...phase}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [platform, setPlatform] = React.useState<
    "Windows" | "macOS" | "Linux" | "Desktop"
  >("Desktop");
  const [pwywOpen, setPwywOpen] = React.useState(false);
  const [version, setVersion] = React.useState<string>("0.2.1");
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();
  const heroRef = React.useRef<HTMLElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const threshold = heroRef.current
      ? heroRef.current.offsetHeight - 80
      : 400;
    setScrolled(latest > threshold);
  });

  React.useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes("win")) setPlatform("Windows");
    else if (ua.includes("mac")) setPlatform("macOS");
    else if (ua.includes("linux")) setPlatform("Linux");

    fetch("/api/latest-release")
      .then((r) => r.json())
      .then((d) => {
        if (d.version) setVersion(d.version);
      })
      .catch(console.error);
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
    <div className="min-h-screen bg-black text-white antialiased selection:bg-white selection:text-black">
      {/* Navbar pill */}
      <motion.header
        className="fixed top-5 z-50"
        initial={false}
        animate={scrolled ? "left" : "center"}
        variants={{
          center: { left: "50%", x: "-50%" },
          left: { left: "2rem", x: "0%" },
        }}
        transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.8 }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.8 }}
          className="flex items-center h-11 rounded-full bg-black/75 backdrop-blur-xl border border-white/[0.1] shadow-[0_2px_24px_rgba(0,0,0,0.5)] overflow-hidden px-2"
        >
          <motion.span layout className="text-[13px] font-semibold px-3 whitespace-nowrap">
            Sonixy
          </motion.span>

          <motion.div layout className="w-px h-4 bg-white/10 shrink-0" />

          {/* Features link */}
          <motion.a
            layout
            href="#features"
            title="Features"
            className="rounded-full text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors overflow-hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {scrolled ? (
                <motion.span
                  key="icon"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center size-8"
                >
                  <LayoutGrid className="size-[15px]" />
                </motion.span>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center h-8 px-3 text-[13px] whitespace-nowrap"
                >
                  Features
                </motion.span>
              )}
            </AnimatePresence>
          </motion.a>

          {/* Source link */}
          <motion.a
            layout
            href="https://codeberg.org/sker/sonixy"
            title="Source"
            className="rounded-full text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors overflow-hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {scrolled ? (
                <motion.span
                  key="icon"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center size-8"
                >
                  <Code2 className="size-[15px]" />
                </motion.span>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center h-8 px-3 text-[13px] whitespace-nowrap"
                >
                  Source
                </motion.span>
              )}
            </AnimatePresence>
          </motion.a>

          {/* Download */}
          <div className="pl-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {scrolled ? (
                <motion.button
                  key="dl-icon"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.8 }}
                  onClick={() => setPwywOpen(true)}
                  title="Download"
                  className="flex items-center justify-center size-8 rounded-full text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                >
                  <Download className="size-[15px]" />
                </motion.button>
              ) : (
                <motion.button
                  key="dl-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setPwywOpen(true)}
                  className="bg-white text-black text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
                >
                  Download
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.header>

      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative z-10 pt-48 pb-24 px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-[88px] font-bold tracking-tight leading-[1.04] mb-6">
              Find your
              <br />
              samples, fast.
            </h1>
            <p className="text-xl text-white/40 max-w-lg mx-auto leading-relaxed mb-10">
              Organize, preview, and drag samples directly into your timeline.
              No exports. No waiting.
            </p>
            <button
              onClick={() => setPwywOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-black text-[15px] font-semibold px-7 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              <PlatformIcon className="size-[15px]" />
              Download for {platform}
            </button>
          </motion.div>
        </section>

        {/* Hero screenshot */}
        <section className="relative z-0 -mt-10 px-6 pb-40">
          <div className="max-w-6xl mx-auto">
            <div
              className="relative aspect-[16/9] rounded-sm overflow-hidden"
            >
              <Image
                src="/app.webp"
                loading="eager"
                alt="Sonixy app"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* Scroll-jacked feature showcase */}
        <div id="features">
          <ScrollFeatures />
        </div>

        {/* CTA section */}
        <section className="overflow-hidden">
          <div className="max-w-6xl mx-auto px-8 py-48 flex flex-col md:flex-row gap-16 items-center">
            <div className="flex flex-col gap-8 shrink-0">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to find
                <br />
                your samples?
              </h2>
              <button
                onClick={() => setPwywOpen(true)}
                className="self-start inline-flex items-center gap-2 bg-white text-black text-[15px] font-semibold px-7 py-3 rounded-full hover:bg-white/90 transition-colors"
              >
                <PlatformIcon className="size-[15px]" />
                Download for {platform}
              </button>
              <div className="flex gap-8 text-[13px] text-white/25">
                <a href="https://codeberg.org/sker/sonixy" className="hover:text-white/50 transition-colors">
                  Source Code
                </a>
                <a href="https://github.com/devsker/sonixy-mirror" className="hover:text-white/50 transition-colors">
                  Mirror
                </a>
                <span>{version}</span>
              </div>
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden">
                <Image
                  src="/app.webp"
                  alt="Sonixy app"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <a href="https://sker.lol" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">
            by sker
          </a>
        </div>
      </footer>

      <PwywDialog
        platform={platform}
        open={pwywOpen}
        onOpenChange={setPwywOpen}
      />
    </div>
  );
}
