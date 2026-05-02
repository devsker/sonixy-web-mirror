"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ChevronDown, Copy, Check } from "lucide-react";

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
      className="w-full group relative flex items-center justify-between p-3 border border-white/10 bg-white/5 hover:border-primary hover:bg-primary/5 transition-all text-left"
      title="Click to copy"
    >
      <code className="text-xs font-mono text-zinc-300 group-hover:text-white transition-colors">
        {command}
      </code>
      <div className="flex items-center justify-center size-8 rounded group-hover:bg-white/5 transition-colors">
        {copied ? (
          <Check className="size-3.5 text-primary" />
        ) : (
          <Copy className="size-3.5 text-zinc-500 group-hover:text-zinc-300" />
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
  const [showOther, setShowOther] = useState(false);

  const fetchBinaries = async () => {
    try {
      const response = await fetch("/api/latest-release");
      if (!response.ok) throw new Error("Failed to fetch binaries");
      const data = await response.json();
      setBinaries(data.binaries);
    } catch (error) {
      console.error("Error fetching binaries:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBinaries();
    }
  }, [open]);

  const getPlatformBinaries = () => {
    if (!binaries) return [];
    if (platform === "Linux") return binaries.Linux;
    if (platform === "macOS") return binaries.macOS;
    if (platform === "Windows") return binaries.Windows;
    return [];
  };

  const getOtherBinaries = () => {
    if (!binaries) return [];
    return [
      ...binaries.Linux.filter((b) => !getPlatformBinaries().includes(b)),
      ...binaries.macOS.filter((b) => !getPlatformBinaries().includes(b)),
      ...binaries.Windows.filter((b) => !getPlatformBinaries().includes(b)),
      ...binaries.Other,
    ];
  };

  const handleAmountContinue = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (finalAmount === null) return;

    if (finalAmount === 0 || finalAmount <= 0) {
      // Free - go straight to format selection
      setStage("format");
    } else {
      // Paid - go to payment first
      setStage("payment");
    }
  };

  const handlePaymentContinue = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;

    window.open(`https://www.paypal.me/proxyscripts/${finalAmount}`, "_blank");
    setStage("format");
  };

  const handleSelectBinary = (binary: Binary) => {
    window.location.href = binary.browser_download_url;
    onOpenChange(false);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;
  const platformBinaries = getPlatformBinaries();
  const otherBinaries = getOtherBinaries();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl rounded-none border border-white/10 bg-[#050505] p-8 max-h-[90vh] overflow-y-auto">
        {stage === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Support Sonixy
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-zinc-400">
                Pay what you want. Every bit helps keep development going.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Free", value: 0 },
                    { label: "$3", value: 3 },
                    { label: "$7", value: 7 },
                    { label: "$15", value: 15 },
                  ].map((chip) => (
                    <button
                      key={chip.value}
                      onClick={() => {
                        setAmount(chip.value);
                        setCustomAmount("");
                      }}
                      className={`py-3 px-4 text-sm font-mono uppercase tracking-wide transition-all border ${
                        amount === chip.value && !customAmount
                          ? "border-primary bg-primary text-black"
                          : "border-white/10 bg-transparent text-white hover:border-primary/50"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                    Custom Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">$</span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount(null);
                      }}
                      min="0"
                      step="0.01"
                      className="rounded-none border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-10 rounded-none border border-white/10 bg-transparent text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAmountContinue}
                  disabled={amount === null && !customAmount}
                  className="flex-1 h-10 rounded-none bg-primary text-black hover:bg-white disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {stage === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Complete Payment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="rounded border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-zinc-300">
                  Open PayPal to complete your ${finalAmount} payment. You'll return here to choose your download format.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStage("amount")}
                  className="flex-1 h-10 rounded-none border border-white/10 bg-transparent text-white hover:bg-white/5"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePaymentContinue}
                  className="flex-1 h-10 rounded-none bg-primary text-black hover:bg-white"
                >
                  Open PayPal
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {stage === "format" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
                Choose Download Format
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Recommended for your platform */}
              {platformBinaries.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                    Recommended for {platform}
                  </p>
                  <div className="space-y-2">
                    {platformBinaries.map((binary) => (
                      <button
                        key={binary.name}
                        onClick={() => handleSelectBinary(binary)}
                        className="w-full text-left p-4 border border-white/10 bg-white/5 hover:border-primary hover:bg-primary/10 transition-all"
                      >
                        <p className="text-sm font-mono text-white truncate">
                          {binary.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AUR Options for Linux */}
              {platform === "Linux" && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                    Arch Linux (AUR)
                  </p>
                  <div className="space-y-2">
                    <CopyableCommand command="yay sonixy-bin" />
                    <CopyableCommand command="yay sonixy-git" />
                  </div>
                </div>
              )}

              {/* Other formats */}
              {otherBinaries.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowOther(!showOther)}
                    className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors py-3 border-b border-white/5"
                  >
                    <span>Other Formats ({otherBinaries.length})</span>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        showOther ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showOther && (
                    <div className="space-y-2 mt-3">
                      {otherBinaries.map((binary) => (
                        <button
                          key={binary.name}
                          onClick={() => handleSelectBinary(binary)}
                          className="w-full text-left p-4 border border-white/10 bg-transparent hover:border-primary/50 hover:bg-white/5 transition-all"
                        >
                          <p className="text-sm font-mono text-zinc-400 truncate">
                            {binary.name}
                          </p>
                          <p className="text-xs text-zinc-600 mt-1">
                            {binary.category}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setStage(finalAmount && finalAmount > 0 ? "payment" : "amount");
                  }}
                  className="flex-1 h-10 rounded-none border border-white/10 bg-transparent text-white hover:bg-white/5"
                >
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
