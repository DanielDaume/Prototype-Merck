import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({
    include: { agents: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Skills"
        description="Reusable capabilities that can be composed into AI agents and workflows."
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill) => (
          <Link
            key={skill.id}
            href={`/skills/${skill.slug}`}
            className="rounded-[12px] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-[16px] font-semibold text-navy">{skill.name}</h3>
              <StatusBadge tone={skill.status === "Production" ? "green" : "blue"}>{skill.status}</StatusBadge>
            </div>
            <p className="mb-3 line-clamp-2 text-[13px] text-[#4A5568]">{skill.shortDescription}</p>
            <div className="text-[12px] text-muted">
              {skill.category} · v{skill.version} · {skill.agents.length} agents · {skill.owner}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
