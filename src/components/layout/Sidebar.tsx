"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bookmark,
  BookOpen,
  Bot,
  ClipboardCheck,
  FileText,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  Webhook,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const discover: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/requests", label: "Requests", icon: Inbox, badge: "6" },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

const manage: NavItem[] = [
  { href: "/agents", label: "AI Agents", icon: Bot },
  { href: "/mcp-servers", label: "MCP Servers", icon: Server },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/rules", label: "Rules & Guardrails", icon: Shield },
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/hooks", label: "Hooks", icon: Webhook },
];

const govern: NavItem[] = [
  { href: "/reviews", label: "Reviews", icon: ClipboardCheck },
  { href: "/activity", label: "Activity", icon: Activity },
];

const admin: NavItem[] = [{ href: "/settings", label: "Settings", icon: Settings }];

function Section({
  title,
  items,
  collapsed,
  pathname,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <div className="mb-4">
      {!collapsed ? (
        <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
          {title}
        </div>
      ) : (
        <div className="mb-2 mx-auto h-px w-6 bg-border" />
      )}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                active
                  ? "bg-primary-light font-medium text-primary"
                  : "text-[#4A5568] hover:bg-[#EEF2F6] hover:text-navy",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted")} />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
              {!collapsed && item.badge ? (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-white transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-border px-3", collapsed && "justify-center")}>
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <FileText className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-navy">AI Agent Central</div>
            </div>
          ) : null}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <Section title="Discover" items={discover} collapsed={collapsed} pathname={pathname} />
        <Section title="Manage" items={manage} collapsed={collapsed} pathname={pathname} />
        <Section title="Govern" items={govern} collapsed={collapsed} pathname={pathname} />
        <Section title="Administrate" items={admin} collapsed={collapsed} pathname={pathname} />
      </div>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-[#EEF2F6] hover:text-navy",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
