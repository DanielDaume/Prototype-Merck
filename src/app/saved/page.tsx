import Link from "next/link";
import { Bookmark } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { assetTypeLabels } from "@/lib/labels";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function hrefFor(type: string, slug: string) {
  switch (type) {
    case "AGENT":
      return `/agents/${slug}`;
    case "MCP_SERVER":
      return `/mcp-servers/${slug}`;
    case "SKILL":
      return `/skills/${slug}`;
    case "RULE":
      return `/rules/${slug}`;
    case "GUIDE":
      return `/guides/${slug}`;
    case "HOOK":
      return `/hooks/${slug}`;
    default:
      return "/browse";
  }
}

export default async function SavedPage() {
  const saved = await prisma.savedItem.findMany({
    where: { userKey: "demo-user" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Saved" description="Bookmarked agents and reusable components." />
      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved any assets yet."
          description="Use the bookmark action on cards and detail pages to build your shortlist."
        />
      ) : (
        <div className="space-y-3">
          {saved.map((item) => (
            <Link
              key={item.id}
              href={hrefFor(item.assetType, item.assetSlug)}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-border bg-white p-4 shadow-sm hover:border-primary/30"
            >
              <div>
                <div className="mb-1">
                  <StatusBadge tone="blue">{assetTypeLabels[item.assetType]}</StatusBadge>
                </div>
                <div className="text-sm font-semibold text-navy">{item.assetName}</div>
              </div>
              <div className="text-[12px] text-muted">Saved {relativeTime(item.createdAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
