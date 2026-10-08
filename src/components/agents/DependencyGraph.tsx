import Link from "next/link";

export type DependencyNode = {
  id: string;
  label: string;
  href?: string;
  tone?: "system" | "mcp" | "agent" | "skill" | "rule" | "product" | "data";
  status?: string;
  kind?: string;
  side?: "upstream" | "center" | "downstream";
};

export type DependencyEdge = {
  from: string;
  to: string;
  label?: string;
};

function LineageCard({
  node,
  prominent = false,
}: {
  node: DependencyNode;
  prominent?: boolean;
}) {
  const content = (
    <div
      className={
        prominent
          ? "min-w-[200px] max-w-[260px] rounded-[10px] border-2 border-primary bg-white px-4 py-3 text-center shadow-sm"
          : "min-w-[160px] max-w-[220px] rounded-[10px] border border-border bg-white px-3 py-2.5 text-center shadow-sm"
      }
    >
      {node.kind ? (
        <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">{node.kind}</div>
      ) : null}
      <div className={`text-sm font-semibold ${prominent ? "text-primary" : "text-navy"}`}>{node.label}</div>
      {node.status ? <div className="mt-1 text-[11px] text-muted">{node.status}</div> : null}
    </div>
  );
  if (node.href) {
    return (
      <Link href={node.href} className="block transition hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}

export function DependencyGraph({
  nodes,
  edges,
  agentDependencies,
  dependents,
  title = "Agent lineage",
  centerLabel,
  inCount,
  outCount,
}: {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  agentDependencies?: { name: string; slug: string; relationLabel?: string | null }[];
  dependents?: { name: string; slug: string; relationLabel?: string | null }[];
  title?: string;
  centerLabel?: string;
  inCount?: number;
  outCount?: number;
}) {
  const upstream = nodes.filter((n) => n.side === "upstream" || (!n.side && n.tone !== "agent"));
  const center = nodes.filter((n) => n.side === "center" || n.tone === "agent");
  const downstream = nodes.filter((n) => n.side === "downstream");

  // Fallback: if sides not provided, split by edge direction around first agent node
  let left = upstream;
  let mid = center.length ? center : nodes.filter((n) => n.tone === "agent").slice(0, 1);
  let right = downstream;

  if (left.length === 0 && right.length === 0 && nodes.length > 0) {
    const agentNode = mid[0] || nodes.find((n) => n.tone === "agent") || nodes[0];
    mid = [agentNode];
    const outs = new Set(edges.filter((e) => e.from === agentNode.id).map((e) => e.to));
    const inns = new Set(edges.filter((e) => e.to === agentNode.id).map((e) => e.from));
    left = nodes.filter((n) => n.id !== agentNode.id && inns.has(n.id));
    right = nodes.filter((n) => n.id !== agentNode.id && outs.has(n.id));
    const rest = nodes.filter(
      (n) => n.id !== agentNode.id && !inns.has(n.id) && !outs.has(n.id)
    );
    left = [...left, ...rest.filter((_, i) => i % 2 === 0)];
    right = [...right, ...rest.filter((_, i) => i % 2 === 1)];
  }

  const inN = inCount ?? left.length;
  const outN = outCount ?? right.length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[12px] border border-border bg-white p-5">
        <h4 className="mb-1 text-sm font-semibold text-navy">{title}</h4>
        <p className="mb-5 text-[12px] text-muted">
          Upstream inputs · current agent · downstream outputs (seeded relationships)
        </p>

        {nodes.length === 0 ? (
          <p className="text-sm text-muted">No dependency relationships recorded for this agent.</p>
        ) : (
          <div className="flex min-w-[720px] items-center justify-between gap-4">
            <div className="flex w-[28%] flex-col items-stretch gap-2">
              <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
                Input / Upstream
              </div>
              {left.map((n) => (
                <LineageCard key={n.id} node={n} />
              ))}
              {left.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted">
                  No upstream links
                </div>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2">
              <div className="hidden h-px w-full bg-border md:block" />
              <LineageCard
                node={
                  mid[0] || {
                    id: "center",
                    label: centerLabel || "Current agent",
                    tone: "agent",
                    kind: "AI Agent",
                    status: `→ ${inN} in / ${outN} out`,
                  }
                }
                prominent
              />
              {(mid[0] || centerLabel) && (
                <div className="text-[11px] text-muted">
                  → {inN} in / {outN} out
                </div>
              )}
              <div className="hidden h-px w-full bg-border md:block" />
            </div>

            <div className="flex w-[28%] flex-col items-stretch gap-2">
              <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
                Output / Downstream
              </div>
              {right.map((n) => (
                <LineageCard key={n.id} node={n} />
              ))}
              {right.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted">
                  No downstream links
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {agentDependencies && agentDependencies.length > 0 ? (
        <div className="rounded-[12px] border border-border bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-navy">Depends on agents</h4>
          <ul className="space-y-2">
            {agentDependencies.map((dep) => (
              <li key={dep.slug} className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/agents/${dep.slug}`} className="font-medium text-primary hover:underline">
                  {dep.name}
                </Link>
                {dep.relationLabel ? (
                  <span className="text-[11px] text-muted">{dep.relationLabel}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dependents && dependents.length > 0 ? (
        <div className="rounded-[12px] border border-border bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-navy">Used by agents</h4>
          <ul className="space-y-2">
            {dependents.map((dep) => (
              <li key={dep.slug} className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/agents/${dep.slug}`} className="font-medium text-primary hover:underline">
                  {dep.name}
                </Link>
                {dep.relationLabel ? (
                  <span className="text-[11px] text-muted">{dep.relationLabel}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
