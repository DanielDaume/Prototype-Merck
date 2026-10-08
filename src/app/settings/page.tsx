"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";

export default function SettingsPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Prototype repository configuration for workshop demonstration."
      />

      <section className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-navy">Repository</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Repository name</span>
            <input
              defaultValue="AI Agent Central"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              onBlur={() => toast("Available in production version")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Default visibility</span>
            <select
              defaultValue="Internal"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              onChange={() => toast("Available in production version")}
            >
              <option>Internal</option>
              <option>Restricted</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-navy">Governance</h2>
        <div className="space-y-3">
          {[
            "Require owner",
            "Require risk assessment",
            "Require backup owner",
            "Require lifecycle state",
            "Require linked use case for production agents",
          ].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                defaultChecked
                onChange={() => toast("Available in production version")}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-navy">Notifications</h2>
        <div className="space-y-3">
          {["Review reminders", "Access request notifications"].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                defaultChecked
                onChange={() => toast("Available in production version")}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-navy">Platforms & coverage</h2>
            <p className="mt-1 text-[12px] text-muted">
              Source coverage is documented as a workshop snapshot — not as live integration status.
            </p>
          </div>
          <Layers className="h-4 w-4 shrink-0 text-primary" />
        </div>
        <Link
          href="/platforms"
          className="mt-4 inline-flex items-center rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-bg"
        >
          Open Platforms & Coverage
        </Link>
      </section>
    </div>
  );
}
