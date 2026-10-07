"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { useToast } from "@/components/providers/ToastProvider";
import { reviewStatusLabels } from "@/lib/labels";
import type { ReviewStatus, RiskLevel } from "@prisma/client";

type ReviewRow = {
  id: string;
  reason: string;
  dueDate: string;
  status: ReviewStatus;
  agent: {
    name: string;
    slug: string;
    businessOwner: string;
    riskLevel: RiskLevel;
  };
};

export function ReviewsClient({ reviews }: { reviews: ReviewRow[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const markReviewed = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("failed");
      toast("Review marked as complete", "success");
      router.refresh();
    } catch {
      toast("Could not update review", "error");
    } finally {
      setBusyId(null);
    }
  };

  const tone: Record<ReviewStatus, "blue" | "amber" | "red" | "green"> = {
    OPEN: "blue",
    DUE_SOON: "amber",
    OVERDUE: "red",
    COMPLETED: "green",
  };

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-[12px] border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/agents/${review.agent.slug}`} className="text-[16px] font-semibold text-primary hover:underline">
                {review.agent.name}
              </Link>
              <div className="mt-1 text-[13px] text-muted">
                Owner {review.agent.businessOwner} · {review.reason}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <RiskBadge level={review.agent.riskLevel} />
                <StatusBadge tone={tone[review.status]}>{reviewStatusLabels[review.status]}</StatusBadge>
                <span className="text-[12px] text-muted">
                  Due {new Date(review.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/agents/${review.agent.slug}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg"
              >
                Open review
              </Link>
              {review.status !== "COMPLETED" ? (
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => markReviewed(review.id)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  Mark reviewed
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
