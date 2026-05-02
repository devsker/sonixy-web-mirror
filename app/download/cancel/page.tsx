"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function DownloadCancelContent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFreeDownload = async () => {
    setIsLoading(true);
    try {
      const userAgent = window.navigator.userAgent.toLowerCase();
      let platform = "Desktop";
      if (userAgent.indexOf("win") !== -1) platform = "Windows";
      else if (userAgent.indexOf("mac") !== -1) platform = "macOS";
      else if (userAgent.indexOf("linux") !== -1) platform = "Linux";

      const response = await fetch(`/api/latest-release?platform=${platform}`);
      if (!response.ok) throw new Error("No build available");
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      alert("Unable to fetch download. Please visit Codeberg releases manually.");
      window.open("https://codeberg.org/sker/sonixy/releases", "_blank");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-zinc-400">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
              No Problem
            </h1>
            <p className="text-lg text-zinc-400">
              Sonixy is free and open-source. Get started right now.
            </p>
          </div>

          <div className="rounded border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-300 leading-relaxed">
              Whether you pay or not, you get the full experience. Your support helps keep development alive.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleFreeDownload}
              disabled={isLoading}
              className="w-full h-12 rounded-none bg-primary text-black hover:bg-white disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Download Free"}
              <ArrowRight className="ml-3 size-5" />
            </Button>
            <Link href="/">
              <Button className="w-full h-10 rounded-none border border-white/10 bg-transparent text-white hover:bg-white/5">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DownloadCancelPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]" />}>
      <DownloadCancelContent />
    </Suspense>
  );
}
