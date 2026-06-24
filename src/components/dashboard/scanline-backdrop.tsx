"use client";

import { motion } from "motion/react";

export function ScanlineBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.025)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,oklch(1_0_0/0.018)_3px,oklch(1_0_0/0.018)_4px)]" />
      <div className="absolute -top-40 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.15_75_/_0.07),transparent_70%)] blur-2xl" />
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
        initial={{ top: "-5%" }}
        animate={{ top: "105%" }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1,
        }}
      />
    </div>
  );
}
