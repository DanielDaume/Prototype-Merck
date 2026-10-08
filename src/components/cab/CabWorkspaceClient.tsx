"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/providers/ToastProvider";

export type CabChangeRow = {
  id: string;
  slug: string;
  title: string;
  changeSummary: string;
  changeType: string;
  riskImpact: string;
  submittedBy: string;
  reviewGroup: string;
  status: string;
  submittedAt: string;
  agent: { name: string; slug: string } | null;
};

function statusTone(status: string): "blue" | "amber" | "red" | "green" | "gray" {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved") return "green";
  if (s === "overdue" || s === "rejected" || s === "high risk") return "red";
  if (s.includes("due") || s === "in review" || s === "pending") return "amber";
  if (s === "open" || s === "submitted") return "blue";
  return "gray";
}

function riskTone(risk: string): "green" | "amber" | "red" | "gray" {
  const r = risk.toLowerCase();
  if (r.includes("high") || r.includes("critical") || r.includes("mission")) return "red";
  if (r.includes("medium") || r.includes("moderate")) return "amber";
  if (r.includes("low")) return "green";
  return "gray";
}

export function CabWorkspaceClient({ changes }: { changes: CabChangeRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const markReviewed = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cab/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("failed");
      toast("Change marked as reviewed", "success");
      router.refresh();
    } catch {
      toast("Could not update change", "error");
    } finally {
      setBusyId(null);
    }
  };

  const openChange = (change: CabChangeRow) => {
    setExpandedId((prev) => (prev === change.id ? null : change.id));
    toast(`Opened: ${change.title}`, "default");
  };

  if (changes.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-navy">No CAB items requiring attention</p>
        <p className="mt-1 text-[13px] text-muted">
          AI change and governance reviews will appear here when submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-[12px] border border-border bg-white shadow-sm lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-[#FAFBFC] text-[11px] font-medium uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Risk impact</th>
              <th className="px-4 py-3">Submitted by</th>
              <th className="px-4 py-3">Review group</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {changes.map((change) => {
              const expanded = expandedId === change.id;
              const completed = change.status.toLowerCase() === "completed";
              return (
                <tr key={change.id} className="align-top">
                  <td className="px-4 py-3">
                    {change.agent ? (
                      <Link
                        href={`/agents/${change.agent.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {change.agent.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-navy">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">{change.title}</div>
                    <div className="mt-0.5 text-[12px] text-muted">{change.changeType}</div>
                    {expanded ? (
                      <p className="mt-2 max-w-md text-[13px] text-[#4A5568]">{change.changeSummary}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={riskTone(change.riskImpact)}>{change.riskImpact}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-muted">{change.submittedBy}</td>
                  <td className="px-4 py-3 text-muted">{change.reviewGroup}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(change.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone(change.status)}>{change.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openChange(change)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-bg"
                      >
                        Open change
                        {expanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {!completed ? (
                        <button
                          type="button"
                          disabled={busyId === change.id}
                          onClick={() => markReviewed(change.id)}
                          className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                        >
                          Mark reviewed
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {changes.map((change) => {
          const expanded = expandedId === change.id;
          const completed = change.status.toLowerCase() === "completed";
          return (
            <div
              key={change.id}
              className="rounded-[12px] border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  {change.agent ? (
                    <Link
                      href={`/agents/${change.agent.slug}`}
                      className="text-[16px] font-semibold text-primary hover:underline"
                    >
                      {change.agent.name}
                    </Link>
                  ) : (
                    <div className="text-[16px] font-semibold text-navy">{change.title}</div>
                  )}
                  <div className="mt-1 text-[13px] font-medium text-navy">{change.title}</div>
                  <div className="mt-1 text-[12px] text-muted">{change.changeType}</div>
                </div>
                <StatusBadge tone={statusTone(change.status)}>{change.status}</StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone={riskTone(change.riskImpact)}>{change.riskImpact}</StatusBadge>
                <span className="text-[12px] text-muted">
                  {change.submittedBy} · {change.reviewGroup} ·{" "}
                  {new Date(change.submittedAt).toLocaleDateString()}
                </span>
              </div>
              {expanded ? (
                <p className="mt-3 text-[13px] text-[#4A5568]">{change.changeSummary}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openChange(change)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg"
                >
                  Open change
                </button>
                {!completed ? (
                  <button
                    type="button"
                    disabled={busyId === change.id}
                    onClick={() => markReviewed(change.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    Mark reviewed
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
