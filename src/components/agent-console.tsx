"use client";

import { motion } from "motion/react";
import {
  Globe,
  Link2,
  Loader2,
  Radar,
  Users,
} from "lucide-react";
import { DinoLoader } from "@/components/dashboard/dino-loader";
import { HNIcon } from "@/components/dashboard/hn-icon";

function NodeShell({
  icon: Icon,
  kicker,
  title,
  desc,
  status,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  kicker: string;
  title: string;
  desc: string;
  status: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay }}
      className="rounded-lg border border-border/50 bg-background/40 p-3.5"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md border border-brand/30 bg-brand/10 text-brand">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground/60">
              {kicker}
            </span>
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
          </div>
          <div className="mt-0.5 font-heading text-[13px] leading-tight text-foreground">
            {title}
          </div>
          <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground/85">
            {desc}
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-foreground/80">
            <Loader2 className="size-3 animate-spin text-brand" />
            <span>{status}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FlowLine({ label, delay = 0 }: { label?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 py-1.5 pl-[18px]"
    >
      <div className="relative h-5 w-px overflow-hidden bg-border/60">
        <motion.span
          className="absolute left-1/2 top-0 block size-1.5 -translate-x-1/2 rounded-full bg-brand"
          style={{ boxShadow: "0 0 8px var(--brand)" }}
          animate={{ y: [-4, 18, -4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/55">
          {label}
        </span>
      )}
    </motion.div>
  );
}

function OutputChip({
  icon: Icon,
  label,
  value,
  delay,
  branded,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: number;
  branded?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-1 items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-3.5 py-2.5"
    >
      <div
        className={
          branded
            ? "shrink-0 overflow-hidden rounded-md"
            : "grid size-8 shrink-0 place-items-center rounded-md border border-border/60 bg-card text-foreground/80"
        }
      >
        {branded ? <Icon className="size-8" /> : <Icon className="size-4" />}
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground/55">
          output
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-base text-foreground">
            {value}
          </span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function AgentConsole() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-[#0a0e14] shadow-[0_30px_60px_-15px_oklch(0_0_0_/_0.5)]">
      <div className="flex items-center gap-3 border-b border-border/40 bg-background/30 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          opencorp · workflow
        </span>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-brand">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          live
        </div>
      </div>

      <div className="space-y-1 p-5">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 rounded-md border border-border/40 bg-background/30 px-3 py-2"
        >
          <Link2 className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground/55">
            input
          </span>
          <span className="ml-auto truncate font-mono text-[12px] text-foreground/85">
            https://filler.live
          </span>
        </motion.div>

        <FlowLine label="url" delay={0.1} />

        <NodeShell
          icon={Globe}
          kicker="agent · 1"
          title="Product Analyst"
          desc="Reads the site. Figures out what it is, who it's for, what it does."
          status="got the product summary"
          delay={0.15}
        />

        <FlowLine label="product info" delay={0.25} />

        <NodeShell
          icon={Radar}
          kicker="agent · 2"
          title="Discovery Agent"
          desc="Uses the product info to find competitors and the HN threads where your users already are."
          status="scanning web + algolia HN"
          delay={0.3}
        />

        <FlowLine label="competitors + product info" delay={0.4} />

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <OutputChip
            icon={Users}
            label="competitors"
            value="24"
            delay={0.5}
          />
          <OutputChip
            icon={HNIcon}
            label="HN threads"
            value="12"
            delay={0.6}
            branded
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="border-t border-border/40 pt-4"
        >
          <DinoLoader
            loading={true}
            label="play dino"
            sublabel="Press SPACE while the agents work."
            tone="brand"
            instanceKey="workflow-flow"
          />
        </motion.div>
      </div>
    </div>
  );
}
