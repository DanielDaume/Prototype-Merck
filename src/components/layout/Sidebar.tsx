"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  BookMarked,
  Bot,
  Boxes,
  Briefcase,
  ChevronDown,
  ClipboardCheck,
  Database,
  Grid3X3,
  Home,
  Inbox,
  Layers,
  Network,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  Target,
  Webhook,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLeaf = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
};

type NavGroup = NavLeaf & {
  children: NavLeaf[];
  groupKey: "agents" | "cab";
};

type ManageEntry =
  | { kind: "item"; item: NavLeaf }
  | { kind: "group"; group: NavGroup }
  | { kind: "spacer" };

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function childActive(pathname: string, children: NavLeaf[]) {
  return children.some((c) => isActivePath(pathname, c.href));
}

function NavLink({
  item,
  pathname,
  collapsed,
  nested = false,
  groupActive = false,
}: {
  item: NavLeaf;
  pathname: string;
  collapsed: boolean;
  nested?: boolean;
  groupActive?: boolean;
}) {
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg text-[13px] transition-colors",
        nested ? "py-[6px] pl-9 pr-3 text-[12.5px]" : "px-3 py-[7px]",
        active
          ? "bg-[#EEF2F6] font-medium text-navy"
          : groupActive
            ? "font-medium text-navy hover:bg-[#F3F6F9]"
            : "text-[#4A5568] hover:bg-[#F3F6F9] hover:text-navy",
        collapsed && !nested && "justify-center px-2"
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          nested ? "h-3.5 w-3.5" : "h-4 w-4",
          active || groupActive ? "text-primary" : "text-muted"
        )}
      />
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
      {!collapsed && item.badge !== undefined && item.badge !== "" ? (
        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function ExpandableGroup({
  group,
  pathname,
  collapsed,
  expanded,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const selfActive = isActivePath(pathname, group.href);
  const childIsActive = childActive(pathname, group.children);
  const groupActive = selfActive || childIsActive;
  const Icon = group.icon;
  const showChildren = !collapsed && expanded;

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-lg transition-colors",
          selfActive
            ? "bg-[#EEF2F6]"
            : groupActive
              ? "bg-transparent"
              : "hover:bg-[#F3F6F9]"
        )}
      >
        <Link
          href={group.href}
          title={collapsed ? group.label : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 px-3 py-[7px] text-[13px]",
            selfActive
              ? "font-medium text-navy"
              : groupActive
                ? "font-medium text-navy"
                : "text-[#4A5568] hover:text-navy",
            collapsed && "justify-center px-2"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", groupActive ? "text-primary" : "text-muted")} />
          {!collapsed ? <span className="min-w-0 flex-1 truncate">{group.label}</span> : null}
          {!collapsed && group.badge !== undefined && group.badge !== "" ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {group.badge}
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
            aria-expanded={expanded}
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
            className="mr-1 rounded-md p-1.5 text-muted hover:bg-[#EEF2F6] hover:text-navy"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        ) : null}
      </div>
      {showChildren ? (
        <div className="mt-0.5 space-y-0.5">
          {group.children.map((child) => (
            <NavLink key={child.href} item={child} pathname={pathname} collapsed={false} nested />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionLabel({ title, collapsed }: { title: string; collapsed: boolean }) {
  if (collapsed) return <div className="mb-2 mx-auto h-px w-6 bg-border" />;
  return (
    <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
      {title}
    </div>
  );
}

export type SidebarCounts = {
  agents: number;
  products: number;
  mcpServers: number;
  skills: number;
  guides: number;
  rules: number;
  hooks: number;
  useCases: number;
  requests: number;
  dataProducts: number;
  cabOpen: number;
  reviews: number;
};

export function Sidebar({
  collapsed,
  onToggle,
  counts,
}: {
  collapsed: boolean;
  onToggle: () => void;
  counts?: SidebarCounts;
}) {
  const pathname = usePathname();
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [cabOpen, setCabOpen] = useState(false);

  const discover: NavLeaf[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Search },
    { href: "/requests", label: "Requests", icon: Inbox, badge: counts?.requests },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  const agentsGroup: NavGroup = {
    groupKey: "agents",
    href: "/agents",
    label: "AI Agents",
    icon: Bot,
    badge: counts?.agents,
    children: [
      { href: "/agent-products", label: "Agent Products", icon: Boxes, badge: counts?.products },
      { href: "/mcp-servers", label: "MCP Servers", icon: Server, badge: counts?.mcpServers },
      { href: "/skills", label: "Skills", icon: Sparkles, badge: counts?.skills },
      { href: "/guides", label: "Guides", icon: BookOpen, badge: counts?.guides },
    ],
  };

  const cabGroup: NavGroup = {
    groupKey: "cab",
    href: "/cab",
    label: "CAB Workspace",
    icon: Network,
    badge: counts?.cabOpen,
    children: [
      { href: "/rules", label: "Rules & Guardrails", icon: Shield, badge: counts?.rules },
      { href: "/hooks", label: "Hooks", icon: Webhook, badge: counts?.hooks },
      { href: "/reviews", label: "Reviews", icon: ClipboardCheck, badge: counts?.reviews },
      { href: "/activity", label: "Activity", icon: Activity },
    ],
  };

  const manage: ManageEntry[] = [
    { kind: "item", item: { href: "/data-assets", label: "Data Assets", icon: Grid3X3 } },
    { kind: "item", item: { href: "/glossary", label: "Glossary Terms", icon: BookMarked } },
    {
      kind: "item",
      item: { href: "/data-products", label: "Data Products", icon: Package, badge: counts?.dataProducts },
    },
    { kind: "item", item: { href: "/data-domains", label: "Data Domains", icon: Target } },
    { kind: "spacer" },
    { kind: "group", group: agentsGroup },
    { kind: "spacer" },
    { kind: "item", item: { href: "/use-cases", label: "Use Cases", icon: Briefcase, badge: counts?.useCases } },
    { kind: "item", item: { href: "/platforms", label: "Platforms & Coverage", icon: Layers } },
    { kind: "spacer" },
    { kind: "group", group: cabGroup },
  ];

  const admin: NavLeaf[] = [{ href: "/settings", label: "Settings", icon: Settings }];

  // Auto-expand parent when child (or parent) route is active
  useEffect(() => {
    if (isActivePath(pathname, "/agents") || childActive(pathname, agentsGroup.children)) {
      setAgentsOpen(true);
    }
    if (isActivePath(pathname, "/cab") || childActive(pathname, cabGroup.children)) {
      setCabOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-white transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[228px]"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-border px-3", collapsed && "justify-center")}>
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Database className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-navy">AI Agent Central</div>
            </div>
          ) : null}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-3">
          <SectionLabel title="Discover" collapsed={collapsed} />
          <nav className="space-y-0.5">
            {discover.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </nav>
        </div>

        <div className="mb-3">
          <SectionLabel title="Manage" collapsed={collapsed} />
          <nav className="space-y-0.5">
            {manage.map((entry, idx) => {
              if (entry.kind === "spacer") {
                return collapsed ? null : <div key={`spacer-${idx}`} className="h-1.5" />;
              }
              if (entry.kind === "item") {
                return (
                  <NavLink
                    key={entry.item.href}
                    item={entry.item}
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                );
              }
              return (
                <ExpandableGroup
                  key={entry.group.groupKey}
                  group={entry.group}
                  pathname={pathname}
                  collapsed={collapsed}
                  expanded={entry.group.groupKey === "agents" ? agentsOpen : cabOpen}
                  onToggle={() => {
                    if (entry.group.groupKey === "agents") setAgentsOpen((v) => !v);
                    else setCabOpen((v) => !v);
                  }}
                />
              );
            })}
          </nav>
        </div>

        <div className="mb-3">
          <SectionLabel title="Administrate" collapsed={collapsed} />
          <nav className="space-y-0.5">
            {admin.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </nav>
        </div>
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
