"use client";

import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CertificationBadge } from "@/components/ui/CertificationBadge";
import { parseTags } from "@/lib/utils";
import type { RiskLevel } from "@prisma/client";

export type AssetCardProps = {
  href: string;
  name: string;
  typeLabel: string;
  subtitle: string;
  description: string;
  tags?: string;
  rating?: number | null;
  platform?: string;
  riskLevel?: RiskLevel | null;
  certified?: boolean;
  onToggleSave?: () => void;
  saved?: boolean;
};

export function AssetCard({
  href,
  name,
  typeLabel,
  subtitle,
  description,
  tags,
  rating,
  platform,
  riskLevel,
  certified,
  onToggleSave,
  saved,
}: AssetCardProps) {
  const tagList = parseTags(tags ?? "");

  return (
    <div className="group relative rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <Link href={href} className="absolute inset-0 z-0 rounded-[12px]" aria-label={name} />
      <div className="relative z-10 pointer-events-none">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-navy group-hover:text-primary">{name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
              <StatusBadge tone="blue">{typeLabel}</StatusBadge>
              <span>{subtitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {typeof rating === "number" && rating > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {rating.toFixed(1)}
              </span>
            ) : null}
            {onToggleSave ? (
              <button
                type="button"
                aria-label={saved ? "Remove bookmark" : "Save"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSave();
                }}
                className="rounded-md p-1.5 text-muted hover:bg-bg hover:text-primary"
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
              </button>
            ) : null}
          </div>
        </div>
        <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{description}</p>
        {tagList.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tagList.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-md bg-[#EEF2F6] px-2 py-0.5 text-[11px] text-muted">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-[12px]">
          {platform ? <span className="font-medium text-navy">{platform}</span> : null}
          {riskLevel ? <RiskBadge level={riskLevel} /> : null}
          {typeof certified === "boolean" ? <CertificationBadge certified={certified} /> : null}
        </div>
      </div>
    </div>
  );
}
