"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const ISSUE_TYPES = [
  "Incorrect metadata",
  "Agent quality issue",
  "Security concern",
  "Owner information outdated",
] as const;

export function FlagIssueModal({
  open,
  onClose,
  agentId,
  agentName,
}: {
  open: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}) {
  const { toast } = useToast();
  const [issueType, setIssueType] = useState<string>(ISSUE_TYPES[0]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!comment.trim()) {
      toast("Please describe the issue", "warning");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, issueType, comment }),
      });
      if (!res.ok) throw new Error("failed");
      toast("Issue flagged successfully", "success");
      onClose();
      setComment("");
      setIssueType(ISSUE_TYPES[0]);
    } catch {
      toast("Could not flag issue", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <div className="w-full max-w-lg rounded-[12px] border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">Flag issue</h2>
            <p className="text-sm text-muted">{agentName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-bg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Issue type</span>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Describe what needs attention…"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            Submit issue
          </button>
        </div>
      </div>
    </div>
  );
}
