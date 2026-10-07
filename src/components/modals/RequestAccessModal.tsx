"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";

export function RequestAccessModal({
  open,
  onClose,
  assetName,
  assetSlug,
  assetType = "AGENT",
  agentId,
}: {
  open: boolean;
  onClose: () => void;
  assetName: string;
  assetSlug: string;
  assetType?: string;
  agentId?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [businessCase, setBusinessCase] = useState("");
  const [environment, setEnvironment] = useState("Prod");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!reason.trim() || !businessCase.trim()) {
      toast("Please provide reason and business use case", "warning");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType,
          assetName,
          assetSlug,
          agentId,
          reason,
          businessCase,
          environment,
        }),
      });
      if (!res.ok) throw new Error("failed");
      toast("Access request submitted", "success");
      onClose();
      setReason("");
      setBusinessCase("");
      router.refresh();
      router.push("/requests");
    } catch {
      toast("Could not submit request", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <div className="w-full max-w-lg rounded-[12px] border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">Request access</h2>
            <p className="text-sm text-muted">{assetName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-bg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Reason for access</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Why do you need access?"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Business use case</span>
            <textarea
              value={businessCase}
              onChange={(e) => setBusinessCase(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Describe the business use case"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Environment</span>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option>Dev</option>
              <option>Test</option>
              <option>Prod</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}
