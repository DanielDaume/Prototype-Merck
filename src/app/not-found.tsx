import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[12px] border border-border bg-white p-10 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-navy">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The requested catalog asset or page does not exist.</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
