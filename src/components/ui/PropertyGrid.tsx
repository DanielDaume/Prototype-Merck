export function PropertyGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-[#FAFBFC] px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{item.label}</div>
          <div className="mt-1 text-sm font-medium text-navy">{item.value || "—"}</div>
        </div>
      ))}
    </div>
  );
}
