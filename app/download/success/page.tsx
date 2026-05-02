"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function DownloadSuccessContent() {
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<string>("Desktop");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const p = searchParams.get("platform") || "Desktop";
    setPlatform(p);

    const fetchRelease = async () => {
      try {
        const response = await fetch(`/api/latest-release?platform=${p}`);
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Unable to fetch download");
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setDownloadUrl(data.url);
        setIsLoading(false);

        // Auto-trigger download after 1s
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } catch (err) {
        setError("Failed to fetch download");
        setIsLoading(false);
      }
    };

    fetchRelease();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-zinc-400">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
              Thank You
            </h1>
            <p className="text-lg text-zinc-400">
              Your download for <span className="text-primary font-mono">{platform}</span> is starting...
            </p>
          </div>

          {isLoading && (
            <div className="space-y-4">
              <div className="h-1 w-full bg-white/10 overflow-hidden rounded-none">
                <div className="h-full bg-primary animate-pulse" />
              </div>
              <p className="text-sm text-zinc-500">Preparing your download</p>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Please visit{" "}
                <a
                  href="https://codeberg.org/sker/sonixy/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-primary/30 hover:text-white transition-colors"
                >
                  Codeberg releases
                </a>{" "}
                to download manually.
              </p>
            </div>
          )}

          {downloadUrl && !error && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                If the download doesn't start, click below:
              </p>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-12 rounded-none bg-primary text-black hover:bg-white">
                  Download Now <ArrowRight className="ml-3 size-5" />
                </Button>
              </a>
            </div>
          )}

          <Link href="/">
            <Button className="w-full h-10 rounded-none border border-white/10 bg-transparent text-white hover:bg-white/5">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function DownloadSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]" />}>
      <DownloadSuccessContent />
    </Suspense>
  );
}
