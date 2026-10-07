"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { platforms } from "@/lib/labels";

const initial = {
  name: "",
  description: "",
  businessOwner: "",
  businessArea: "ENABLING_FUNCTIONS",
  platform: "UPTIMIZE Foundry",
  lifecycleStage: "IDEA",
  riskLevel: "NOT_ASSESSED",
  accessLevel: "APPROVAL_REQUIRED",
};

export function RegisterAgentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.businessOwner.trim()) {
      toast("Please fill name, description and business owner", "warning");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      toast("Agent registered successfully", "success");
      onClose();
      setForm(initial);
      router.push(`/agents/${data.slug}`);
      router.refresh();
    } catch {
      toast("Could not register agent", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[12px] border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">Register agent</h2>
            <p className="text-sm text-muted">Create a demo agent record in the local repository.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-bg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <label className="md:col-span-2 block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Agent name</span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="md:col-span-2 block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Business owner</span>
            <input
              value={form.businessOwner}
              onChange={(e) => set("businessOwner", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Business area</span>
            <select
              value={form.businessArea}
              onChange={(e) => set("businessArea", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="HEALTHCARE">Healthcare</option>
              <option value="LIFE_SCIENCE">Life Science</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="ENABLING_FUNCTIONS">Enabling Functions</option>
              <option value="GLOBAL_CROSS_SECTOR">Global / Cross-Sector</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Platform</span>
            <select
              value={form.platform}
              onChange={(e) => set("platform", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Lifecycle</span>
            <select
              value={form.lifecycleStage}
              onChange={(e) => set("lifecycleStage", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="IDEA">Idea</option>
              <option value="PILOT">Pilot</option>
              <option value="PRODUCTION">Production</option>
              <option value="RETIRING">Retiring</option>
              <option value="RETIRED">Retired</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Risk</span>
            <select
              value={form.riskLevel}
              onChange={(e) => set("riskLevel", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="NOT_ASSESSED">Not assessed</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Access level</span>
            <select
              value={form.accessLevel}
              onChange={(e) => set("accessLevel", e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="OPEN">Open</option>
              <option value="APPROVAL_REQUIRED">Approval required</option>
              <option value="RESTRICTED">Restricted</option>
            </select>
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
            Register agent
          </button>
        </div>
      </div>
    </div>
  );
}
