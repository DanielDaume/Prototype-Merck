import Link from "next/link";

type Node = {
  id: string;
  label: string;
  href?: string;
  tone?: "system" | "mcp" | "agent" | "skill" | "rule";
};

const toneClass = {
  system: "bg-[#243443] text-white",
  mcp: "bg-primary text-white",
  agent: "bg-accent text-white",
  skill: "bg-purple text-white",
  rule: "bg-warning text-white",
};

export function DependencyGraph({
  nodes,
  edges,
  agentDependencies,
}: {
  nodes: Node[];
  edges: { from: string; to: string }[];
  agentDependencies?: { name: string; slug: string }[];
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[12px] border border-border bg-white p-5">
        <div className="flex min-w-[640px] flex-col items-center gap-3">
          {nodes.map((node, idx) => (
            <div key={node.id} className="flex flex-col items-center">
              {idx > 0 ? <div className="mb-3 h-6 w-px bg-border" /> : null}
              {node.href ? (
                <Link
                  href={node.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm ${toneClass[node.tone ?? "agent"]}`}
                >
                  {node.label}
                </Link>
              ) : (
                <div className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm ${toneClass[node.tone ?? "agent"]}`}>
                  {node.label}
                </div>
              )}
              {edges.some((e) => e.from === node.id) && idx < nodes.length - 1 ? null : null}
            </div>
          ))}
          {nodes.length >= 3 ? (
            <div className="mt-2 grid w-full max-w-xl grid-cols-2 gap-4">
              {nodes.slice(-2).map((n) => (
                <div key={`branch-${n.id}`} className="text-center text-[11px] text-muted">
                  Linked dependency: {n.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-center text-[11px] text-muted">
          Simplified lineage view for workshop demonstration (demo data).
        </p>
      </div>

      {agentDependencies && agentDependencies.length > 0 ? (
        <div className="rounded-[12px] border border-border bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-navy">Agent dependencies</h4>
          <ul className="space-y-2">
            {agentDependencies.map((dep) => (
              <li key={dep.slug}>
                <Link href={`/agents/${dep.slug}`} className="text-sm font-medium text-primary hover:underline">
                  {dep.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
