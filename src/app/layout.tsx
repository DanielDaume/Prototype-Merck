import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { prisma } from "@/lib/db";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Agent Central",
  description: "Discover, assess and reuse enterprise AI capabilities",
};

export const dynamic = "force-dynamic";

async function getSidebarCounts() {
  try {
    const [
      agents,
      products,
      mcpServers,
      skills,
      rules,
      guides,
      hooks,
      useCases,
      requests,
      dataProducts,
      cabOpen,
      reviews,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agentProduct.count(),
      prisma.mcpServer.count(),
      prisma.skill.count(),
      prisma.rule.count(),
      prisma.guide.count(),
      prisma.hook.count(),
      prisma.useCase.count(),
      prisma.accessRequest.count({ where: { status: "PENDING" } }),
      prisma.catalogDataProduct.count(),
      prisma.cabChange.count({ where: { status: { in: ["Pending", "Review required"] } } }),
      prisma.reviewItem.count({ where: { status: { in: ["OPEN", "DUE_SOON", "OVERDUE"] } } }),
    ]);
    return {
      agents,
      products,
      mcpServers,
      skills,
      rules,
      guides,
      hooks,
      useCases,
      requests,
      dataProducts,
      cabOpen,
      reviews,
    };
  } catch {
    return undefined;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const counts = await getSidebarCounts();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <ToastProvider>
          <AppShell counts={counts}>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
