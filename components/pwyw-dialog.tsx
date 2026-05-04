"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Copy, Check, Download, Star } from "lucide-react";
import { SiLinux, SiApple } from "react-icons/si";
import { FaMicrosoft } from "react-icons/fa";

interface Binary {
  name: string;
  browser_download_url: string;
  category: string;
}

interface Binaries {
  Linux: Binary[];
  macOS: Binary[];
  Windows: Binary[];
  Other: Binary[];
}

interface PwywDialogProps {
  platform: "Windows" | "macOS" | "Linux" | "Desktop";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isRecommended(name: string, os: OsKey): boolean {
  const n = name.toLowerCase();
  if (os === "Windows") return n.includes("setup") && n.endsWith(".exe");
  if (os === "macOS")   return n.endsWith(".dmg");
  return false;
}

const OS_TABS = [
  { key: "Windows", label: "Windows", icon: FaMicrosoft },
  { key: "macOS",   label: "macOS",   icon: SiApple },
  { key: "Linux",   label: "Linux",   icon: SiLinux },
] as const;

type OsKey = (typeof OS_TABS)[number]["key"];

const CopyableCommand = ({ command }: { command: string }) => {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="w-full group flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left"
      title="Click to copy"
    >
      <code className="text-[13px] font-mono text-white/60 group-hover:text-white transition-colors">
        {command}
      </code>
      <div className="flex items-center justify-center size-7 rounded-lg group-hover:bg-white/[0.06] transition-colors shrink-0">
        {copied ? (
          <Check className="size-3.5 text-white/60" />
        ) : (
          <Copy className="size-3.5 text-white/25 group-hover:text-white/50" />
        )}
      </div>
    </button>
  );
};

export function PwywDialog({ platform, open, onOpenChange }: PwywDialogProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [stage, setStage] = useState<"amount" | "payment" | "format">("amount");
  const [binaries, setBinaries] = useState<Binaries | null>(null);
  const [activeOs, setActiveOs] = useState<OsKey>(
    platform === "Desktop" ? "Windows" : platform
  );

  useEffect(() => {
    if (platform !== "Desktop") setActiveOs(platform);
  }, [platform]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/latest-release")
      .then((r) => r.json())
      .then((d) => setBinaries(d.binaries))
      .catch(console.error);
  }, [open]);

  const handleAmountContinue = () => {
    const final = customAmount ? parseFloat(customAmount) : amount;
    if (final === null) return;
    if (final <= 0) setStage("format");
    else setStage("payment");
  };

  const handlePaymentContinue = () => {
    const final = customAmount ? parseFloat(customAmount) : amount;
    if (!final || final <= 0) return;
    window.open(`https://www.paypal.me/proxyscripts/${final}`, "_blank");
    setStage("format");
  };

  const handleSelectBinary = (binary: Binary) => {
    window.location.href = binary.browser_download_url;
    onOpenChange(false);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;
  const activeBinaries: Binary[] = binaries?.[activeOs] ?? [];

  const [contentHeight, setContentHeight] = React.useState<number | undefined>(undefined);
  const roRef = React.useRef<ResizeObserver | null>(null);

  const contentRef = React.useCallback((node: HTMLDivElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
    }
    if (node) {
      const ro = new ResizeObserver(([entry]) => {
        setContentHeight(entry.contentRect.height);
      });
      ro.observe(node);
      roRef.current = ro;
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-0 overflow-hidden outline-none">
        <motion.div
          animate={{ height: contentHeight || "auto" }}
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
          className="relative overflow-hidden"
        >
          <div ref={contentRef}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="p-8 w-full"
              >
                {/* ── Amount ── */}
                {stage === "amount" && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-white tracking-tight">
                        Support Sonixy
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      <p className="text-[14px] text-white/40">
                        Pay what you want. Every bit helps keep development going.
                      </p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Free", value: 0 },
                            { label: "$3",   value: 3 },
                            { label: "$7",   value: 7 },
                            { label: "$15",  value: 15 },
                          ].map((chip) => (
                            <button
                              key={chip.value}
                              onClick={() => { setAmount(chip.value); setCustomAmount(""); }}
                              className={`py-2.5 px-4 text-[14px] font-medium rounded-xl transition-all border ${
                                amount === chip.value && !customAmount
                                  ? "border-white bg-white text-black"
                                  : "border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]"
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="block text-[12px] text-white/30 mb-2">Custom amount</label>
                          <div className="flex items-center gap-2 border border-white/[0.08] rounded-xl px-4 bg-white/[0.03] focus-within:border-white/20 transition-colors">
                            <span className="text-white/30 text-[14px]">$</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={customAmount}
                              onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                              min="0"
                              step="0.01"
                              className="border-0 bg-transparent px-0 py-2.5 text-[14px] text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-transparent text-white hover:bg-white/[0.05]">
                          Cancel
                        </Button>
                        <Button onClick={handleAmountContinue} disabled={amount === null && !customAmount} className="flex-1 h-10 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-40">
                          Continue <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Payment ── */}
                {stage === "payment" && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-white tracking-tight">
                        Complete Payment
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                        <p className="text-[14px] text-white/60">
                          Open PayPal to complete your ${finalAmount} payment. You'll return here to choose your download format.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => setStage("amount")} className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-transparent text-white hover:bg-white/[0.05]">
                          Back
                        </Button>
                        <Button onClick={handlePaymentContinue} className="flex-1 h-10 rounded-xl bg-white text-black hover:bg-white/90">
                          Open PayPal <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Format ── */}
                {stage === "format" && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-white tracking-tight">
                        Download
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 mt-4">
                      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] relative">
                        {OS_TABS.map(({ key, label, icon: Icon }) => {
                          const isActive = activeOs === key;
                          const isCurrent = key === platform;
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveOs(key)}
                              className={`flex-1 relative flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-all z-10 ${
                                isActive ? "bg-white text-black" : "text-white/40 hover:text-white"
                              }`}
                            >
                              <Icon className="size-3.5" />
                              {label}
                              {isCurrent && !isActive && <span className="size-1.5 rounded-full bg-white/30" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.div
                            key={activeOs}
                            initial={{ opacity: 0, filter: "blur(8px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(8px)" }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="space-y-1.5"
                          >
                            {!binaries ? (
                              <p className="text-[13px] text-white/30 py-2">Loading…</p>
                            ) : activeBinaries.length === 0 ? (
                              <p className="text-[13px] text-white/30 py-2">No binaries available.</p>
                            ) : (
                              [...activeBinaries]
                                .sort((a, b) => {
                                  const aRec = isRecommended(a.name, activeOs);
                                  const bRec = isRecommended(b.name, activeOs);
                                  return aRec === bRec ? 0 : aRec ? -1 : 1;
                                })
                                .map((binary) => {
                                  const rec = isRecommended(binary.name, activeOs);
                                  return (
                                    <button
                                      key={binary.name}
                                      onClick={() => handleSelectBinary(binary)}
                                      className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-colors group ${
                                        rec
                                          ? "border-white/20 bg-white/[0.07] hover:bg-white/[0.11]"
                                          : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]"
                                      }`}
                                    >
                                      <span className="text-[13px] font-mono text-white truncate">{binary.name}</span>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {rec && <Star className="size-3 text-white/40 fill-white/40" />}
                                        <Download className="size-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
                                      </div>
                                    </button>
                                  );
                                })
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <div>
                        {activeOs === "Linux" && (
                          <div className="mt-4">
                            <p className="text-[12px] text-white/30 mb-2">Arch Linux (AUR)</p>
                            <div className="space-y-1.5">
                              <CopyableCommand command="yay -S sonixy-bin" />
                              <CopyableCommand command="yay -S sonixy-git" />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => setStage(finalAmount && finalAmount > 0 ? "payment" : "amount")}
                            className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-transparent text-white hover:bg-white/[0.05]"
                          >
                            Back
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
