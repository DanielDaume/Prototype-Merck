"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/providers/ToastProvider";

const integrations = [
  { name: "UPTIMIZE Foundry", status: "Connected", tone: "green" as const },
  { name: "myGPT", status: "Connected", tone: "green" as const },
  { name: "HIVE", status: "Planned", tone: "amber" as const },
  { name: "Microsoft Copilot Studio", status: "Planned", tone: "amber" as const },
  { name: "Salesforce", status: "Not configured", tone: "gray" as const },
  { name: "SAP Joule", status: "Not configured", tone: "gray" as const },
  { name: "UiPath", status: "Not configured", tone: "gray" as const },
];

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
        <h2 className="mb-1 text-sm font-semibold text-navy">Integrations</h2>
        <p className="mb-4 text-[12px] text-muted">
          Demo integration status — no live connections are configured.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((item) => (
            <div key={item.name} className="rounded-[10px] border border-border p-3">
              <div className="text-sm font-medium text-navy">{item.name}</div>
              <div className="mt-2">
                <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
