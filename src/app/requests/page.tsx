import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { assetTypeLabels, requestStatusLabels } from "@/lib/labels";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await prisma.accessRequest.findMany({
    orderBy: { requestedAt: "desc" },
  });

  const tone = {
    PENDING: "amber" as const,
    APPROVED: "green" as const,
    REJECTED: "red" as const,
  };

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Track access requests for agents and reusable components."
      />
      <div className="overflow-hidden rounded-[12px] border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-[#FAFBFC] text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Asset</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Requested</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Approver</th>
              <th className="px-4 py-3 font-semibold">Expected response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((req) => {
              const href =
                req.assetType === "AGENT" && req.assetSlug
                  ? `/agents/${req.assetSlug}`
                  : req.assetType === "MCP_SERVER" && req.assetSlug
                    ? `/mcp-servers/${req.assetSlug}`
                    : req.assetType === "SKILL" && req.assetSlug
                      ? `/skills/${req.assetSlug}`
                      : null;
              return (
                <tr key={req.id} className="hover:bg-bg/70">
                  <td className="px-4 py-3 font-medium text-navy">
                    {href ? (
                      <Link href={href} className="text-primary hover:underline">
                        {req.assetName}
                      </Link>
                    ) : (
                      req.assetName
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{assetTypeLabels[req.assetType]}</td>
                  <td className="px-4 py-3 text-muted">{relativeTime(req.requestedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={tone[req.status]}>{requestStatusLabels[req.status]}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-muted">{req.approver || "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {req.expectedAt ? req.expectedAt.toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
