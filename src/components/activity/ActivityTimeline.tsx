import Link from "next/link";
import { relativeTime } from "@/lib/utils";
import { assetTypeLabels } from "@/lib/labels";
import type { AssetType } from "@prisma/client";

export function ActivityTimeline({
  items,
}: {
  items: {
    id: string;
    title: string;
    description: string;
    actor: string;
    createdAt: Date | string;
    assetType?: AssetType | null;
    assetName?: string | null;
    assetSlug?: string | null;
  }[];
}) {
  return (
    <ol className="space-y-0">
      {items.map((item, idx) => {
        const href =
          item.assetSlug && item.assetType === "AGENT"
            ? `/agents/${item.assetSlug}`
            : item.assetSlug && item.assetType === "MCP_SERVER"
              ? `/mcp-servers/${item.assetSlug}`
              : item.assetSlug && item.assetType === "SKILL"
                ? `/skills/${item.assetSlug}`
                : item.assetSlug && item.assetType === "RULE"
                  ? `/rules/${item.assetSlug}`
                  : item.assetSlug && item.assetType === "GUIDE"
                    ? `/guides/${item.assetSlug}`
                    : item.assetSlug && item.assetType === "HOOK"
                      ? `/hooks/${item.assetSlug}`
                      : null;

        return (
          <li key={item.id} className="relative flex gap-4 pb-6">
            {idx < items.length - 1 ? (
              <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
            ) : null}
            <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-white" />
            <div className="min-w-0 flex-1 rounded-[10px] border border-border bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-navy">{item.title}</h4>
                {item.assetType ? (
                  <span className="rounded bg-[#EEF2F6] px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted">
                    {assetTypeLabels[item.assetType]}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[13px] text-[#4A5568]">{item.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                <span>{item.actor}</span>
                <span>·</span>
                <span>{relativeTime(item.createdAt)}</span>
                {href && item.assetName ? (
                  <>
                    <span>·</span>
                    <Link href={href} className="font-medium text-primary hover:underline">
                      {item.assetName}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
